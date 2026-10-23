(() => {
  const video = document.querySelector('#intro-video');
  const player = document.querySelector('.demo-stage__frame');
  if (video && player) {
    const toggle = player.querySelector('.demo-toggle');
    const seek = player.querySelector('.demo-seek');
    const current = player.querySelector('.demo-current');
    const duration = player.querySelector('.demo-duration');
    const mute = player.querySelector('.demo-mute');
    const fullscreen = player.querySelector('.demo-fullscreen');
    const formatTime = seconds => {
      const total = Math.floor(Number.isFinite(seconds) ? seconds : 0);
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    };
    const syncPlayback = () => {
      player.classList.toggle('is-playing', !video.paused && !video.ended);
      toggle.setAttribute('aria-label', video.paused || video.ended ? 'Play video' : 'Pause video');
    };
    const syncTime = () => {
      current.textContent = formatTime(video.currentTime);
      duration.textContent = formatTime(Math.ceil(video.duration));
      if (Number.isFinite(video.duration) && video.duration > 0) {
        const progress = Math.round(video.currentTime / video.duration * 1000);
        seek.value = String(progress);
        seek.style.setProperty('--seek-progress', `${progress / 10}%`);
        seek.disabled = false;
      }
    };
    const togglePlayback = () => {
      if (video.paused || video.ended) video.play().catch(() => {});
      else video.pause();
    };
    video.addEventListener('click', togglePlayback);
    toggle.addEventListener('click', togglePlayback);
    video.addEventListener('play', syncPlayback);
    video.addEventListener('pause', syncPlayback);
    video.addEventListener('ended', syncPlayback);
    video.addEventListener('loadedmetadata', syncTime);
    video.addEventListener('durationchange', syncTime);
    video.addEventListener('timeupdate', syncTime);
    seek.addEventListener('input', () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const target = Number(seek.value) / 1000 * video.duration;
      video.currentTime = target;
      current.textContent = formatTime(target);
      seek.style.setProperty('--seek-progress', `${Number(seek.value) / 10}%`);
    });
    mute.addEventListener('click', () => {
      video.muted = !video.muted;
      mute.classList.toggle('is-muted', video.muted);
      mute.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    });
    fullscreen.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else player.requestFullscreen?.();
    });
    syncPlayback();
    syncTime();
  }

  const hero = document.querySelector('.water-hero');
  const canvas = hero?.querySelector('.water-canvas');
  const logo = hero?.querySelector('.hero-visual img');
  const magnetCanvas = hero?.querySelector('.logo-magnet-canvas');
  const nav = document.querySelector('nav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!hero || !canvas || !logo || reducedMotion.matches) return;
  const magnetContext = magnetCanvas?.getContext('2d');

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  });
  if (!gl) return;

  const vertexSource = `
    attribute vec2 aPosition;
    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform vec2 uResolution;
    uniform vec2 uFieldResolution;
    uniform vec4 uLogoRect;
    uniform sampler2D uLogo;
    uniform sampler2D uHeight;
    uniform vec2 uPixelPointer;
    uniform vec2 uPixelGrid;
    uniform float uPixelStrength;
    uniform float uPixelIntro;
    uniform float uPixelBurst;
    uniform float uIdleProgress;
    uniform float uIdleStrength;

    float heightAt(vec2 p) {
      return (texture2D(uHeight, clamp(p, 0.0, 1.0)).r * 255.0 - 128.0) / 105.0;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      vec2 texel = 1.0 / uFieldResolution;
      float h = heightAt(uv);
      float left = heightAt(uv - vec2(texel.x, 0.0));
      float right = heightAt(uv + vec2(texel.x, 0.0));
      float below = heightAt(uv - vec2(0.0, texel.y));
      float above = heightAt(uv + vec2(0.0, texel.y));
      vec2 slope = vec2(right - left, above - below) * 0.5;
      vec3 normal = normalize(vec3(-slope * 5.0, 1.0));
      vec2 refraction = normal.xy * 0.023;
      vec2 bentUv = uv + refraction * 0.55;

      vec3 color = mix(vec3(0.024, 0.019, 0.070), vec3(0.055, 0.073, 0.160), bentUv.y * 0.82);
      color += vec3(0.055, 0.018, 0.085) * (1.0 - abs(bentUv.x - 0.5) * 1.5) * 0.55;

      vec2 auraPosition = (bentUv - uLogoRect.xy - uLogoRect.zw * 0.5) / uLogoRect.zw;
      float auraWide = exp(-dot(auraPosition * vec2(1.35, 1.7), auraPosition * vec2(1.35, 1.7)) * 1.8);
      float auraCore = exp(-dot(auraPosition * vec2(1.85, 2.25), auraPosition * vec2(1.85, 2.25)) * 3.4);
      color += vec3(0.12, 0.035, 0.23) * auraWide + vec3(0.17, 0.055, 0.24) * auraCore;
      color += vec3(0.045, 0.02, 0.07) * auraCore * uIdleStrength;

      float waveStrength = clamp(length(slope) * 18.0, 0.0, 1.0);
      float glint = pow(max(dot(normal, normalize(vec3(-0.4, 0.55, 0.72))), 0.0), 12.0);
      color += vec3(0.25, 0.32, 0.50) * glint * waveStrength * 0.60;
      float surfaceLight = clamp(dot(slope, vec2(-0.48, 0.88)) * 4.5, 0.0, 0.16);
      color += vec3(0.45, 0.52, 0.75) * surfaceLight;

      vec2 logoUv = (uv + refraction - uLogoRect.xy) / uLogoRect.zw;
      float inside = step(0.0, logoUv.x) * step(logoUv.x, 1.0)
                   * step(0.0, logoUv.y) * step(logoUv.y, 1.0);
      vec4 mark = texture2D(uLogo, clamp(logoUv, 0.0, 1.0));
      vec3 submergedMark = mark.rgb * vec3(0.92, 0.96, 1.06);

      // Resolve the original artwork into a point-grid only near the pointer.
      // The untouched logo and its existing aura remain the resting state.
      vec2 cell = floor(logoUv * uPixelGrid);
      vec2 cellUv = fract(logoUv * uPixelGrid) - 0.5;
      vec2 scatter = vec2(
        fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453),
        fract(sin(dot(cell, vec2(269.5, 183.3))) * 43758.5453)
      ) - 0.5;
      cellUv += scatter * uPixelBurst * 0.36;
      float pixelShape = 1.0 - smoothstep(0.31, 0.42, max(abs(cellUv.x), abs(cellUv.y)));
      vec4 pixelMark = texture2D(uLogo, clamp((cell + 0.5) / uPixelGrid, 0.0, 1.0));
      vec2 pointerOffset = (uv - uPixelPointer) * vec2(uResolution.x / uResolution.y, 1.0);
      float lens = 1.0 - smoothstep(0.07, 0.27 + uPixelBurst * 0.08, length(pointerOffset));
      float introBand = 1.0 - smoothstep(0.035, 0.16, abs(logoUv.x - uPixelIntro));
      // A quiet idle sweep travels from the robot's lower left to the wordmark's upper right.
      float diagonal = logoUv.x * 0.7 + logoUv.y * 0.3;
      float idleBand = (1.0 - smoothstep(0.045, 0.19, abs(diagonal - uIdleProgress))) * uIdleStrength;
      float reveal = clamp(max(max(introBand * 0.84, idleBand * 0.64), uPixelStrength * lens * 0.82) + uPixelBurst * lens * 0.26, 0.0, 1.0);
      vec3 pixelColor = pixelMark.rgb * vec3(1.05, 1.04, 1.13) + vec3(0.035, 0.02, 0.065);
      vec3 resolvedMark = mix(submergedMark, pixelColor, reveal);
      float resolvedAlpha = mix(mark.a, pixelMark.a * pixelShape, reveal);
      float magnetFocus = uPixelStrength * (1.0 - smoothstep(0.025, 0.16, length(pointerOffset)));
      resolvedAlpha *= 1.0 - magnetFocus * 0.42;
      color = mix(color, resolvedMark, resolvedAlpha * inside);
      color += vec3(0.09, 0.045, 0.12) * idleBand * pixelMark.a * pixelShape * inside;

      float vignette = 1.0 - smoothstep(0.34, 0.99, distance(uv, vec2(0.5, 0.53)));
      color *= mix(0.72, 1.0, vignette);
      color = mix(vec3(0.0392, 0.0314, 0.0784), color, smoothstep(0.0, 0.24, uv.y));
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('0xClaw water shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('0xClaw water program:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  const triangle = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, 'uResolution'),
    fieldResolution: gl.getUniformLocation(program, 'uFieldResolution'),
    rect: gl.getUniformLocation(program, 'uLogoRect'),
    logo: gl.getUniformLocation(program, 'uLogo'),
    height: gl.getUniformLocation(program, 'uHeight'),
    pixelPointer: gl.getUniformLocation(program, 'uPixelPointer'),
    pixelGrid: gl.getUniformLocation(program, 'uPixelGrid'),
    pixelStrength: gl.getUniformLocation(program, 'uPixelStrength'),
    pixelIntro: gl.getUniformLocation(program, 'uPixelIntro'),
    pixelBurst: gl.getUniformLocation(program, 'uPixelBurst'),
    idleProgress: gl.getUniformLocation(program, 'uIdleProgress'),
    idleStrength: gl.getUniformLocation(program, 'uIdleStrength'),
  };
  const logoTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, logoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(uniforms.logo, 0);
  const heightTexture = gl.createTexture();
  gl.uniform1i(uniforms.height, 1);

  let fieldWidth = 0;
  let fieldHeight = 0;
  let previous;
  let current;
  let next;
  let pixels;
  const pendingDrops = [];
  let lastPoint = null;
  let frame = 0;
  let lastFrame = 0;
  let accumulator = 0;
  let activeUntil = 0;
  let visible = true;
  let ready = false;
  let started = false;
  let introStartedAt = 0;
  let pixelTarget = 0;
  let pixelStrength = 0;
  let pixelBurstUntil = 0;
  let pixelPointer = [0.5, 0.5];
  let idleStartedAt = -Infinity;
  let magnetPixels = [];
  let magnetWidth = 0;
  let magnetHeight = 0;
  let magnetCursor = [0, 0];
  let magnetMoving = false;

  function prepareMagnet(rect) {
    if (!magnetContext || (magnetWidth === rect.width && magnetHeight === rect.height)) return;
    magnetWidth = rect.width;
    magnetHeight = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    magnetCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    magnetCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    magnetContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    const columns = Math.max(44, Math.round(rect.width / 5.5));
    const rows = Math.max(16, Math.round(rect.height / 5.5));
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = columns;
    sampleCanvas.height = rows;
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    sampleContext.drawImage(logo, 0, 0, columns, rows);
    const samples = sampleContext.getImageData(0, 0, columns, rows).data;
    magnetPixels = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = (row * columns + col) * 4;
        if (samples[index + 3] < 105) continue;
        const x = (col + 0.5) * rect.width / columns;
        const y = (row + 0.5) * rect.height / rows;
        magnetPixels.push({
          baseX: x, baseY: y, x, y, vx: 0, vy: 0,
          alpha: samples[index + 3] / 255,
          color: `rgb(${Math.min(255, samples[index] + 26)}, ${Math.min(255, samples[index + 1] + 18)}, ${Math.min(255, samples[index + 2] + 32)})`,
        });
      }
    }
    magnetMoving = false;
  }

  function drawMagnet(rect) {
    if (!magnetContext || (!pixelTarget && !magnetMoving)) return;
    magnetContext.clearRect(0, 0, rect.width, rect.height);
    const radius = Math.min(155, rect.width * 0.29);
    let moving = false;
    for (const point of magnetPixels) {
      const dx = magnetCursor[0] - point.baseX;
      const dy = magnetCursor[1] - point.baseY;
      const distance = Math.hypot(dx, dy);
      const influence = pixelTarget ? Math.max(0, 1 - distance / radius) ** 2 : 0;
      const pull = Math.min(distance * 0.36, influence * 22);
      const targetX = point.baseX + (distance ? dx / distance * pull : 0);
      const targetY = point.baseY + (distance ? dy / distance * pull : 0);
      point.vx = (point.vx + (targetX - point.x) * 0.13) * 0.76;
      point.vy = (point.vy + (targetY - point.y) * 0.13) * 0.76;
      point.x += point.vx;
      point.y += point.vy;
      const displacement = Math.hypot(point.x - point.baseX, point.y - point.baseY);
      if (displacement > 0.12 || Math.abs(point.vx) + Math.abs(point.vy) > 0.12) moving = true;
      if (influence < 0.025 && displacement < 0.7) continue;
      const size = 2.3 + Math.min(1, influence * 3) * 1.8;
      magnetContext.globalAlpha = point.alpha * Math.min(0.94, 0.35 + influence * 1.8 + displacement / 80);
      magnetContext.fillStyle = point.color;
      magnetContext.fillRect(point.x - size / 2, point.y - size / 2, size, size);
    }
    magnetContext.globalAlpha = 1;
    magnetMoving = moving;
  }

  function queueDrop(clientX, clientY, strength, radius) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pendingDrops.push([
      Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)),
      strength,
      radius,
    ]);
    if (pendingDrops.length > 96) pendingDrops.splice(0, pendingDrops.length - 96);
    activeUntil = performance.now() + 9000;
    updateActivity();
  }

  function trailRipple(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const point = [event.clientX, event.clientY];
    if (!lastPoint) {
      queueDrop(point[0], point[1], 0.033, 10);
    } else {
      const distance = Math.hypot(point[0] - lastPoint[0], point[1] - lastPoint[1]);
      if (distance < 4) return;
      const steps = Math.min(32, Math.ceil(distance / 9));
      const strength = Math.min(0.048, 0.026 + distance / 8000);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        queueDrop(
          lastPoint[0] + (point[0] - lastPoint[0]) * t,
          lastPoint[1] + (point[1] - lastPoint[1]) * t,
          strength,
          10
        );
      }
    }
    lastPoint = point;
  }
  hero.addEventListener('pointermove', trailRipple, { passive: true });
  hero.addEventListener('pointermove', event => {
    const heroRect = canvas.getBoundingClientRect();
    const markRect = logo.getBoundingClientRect();
    pixelPointer = [
      (event.clientX - heroRect.left) / heroRect.width,
      1 - (event.clientY - heroRect.top) / heroRect.height,
    ];
    pixelTarget = event.clientX >= markRect.left - 24 && event.clientX <= markRect.right + 24
      && event.clientY >= markRect.top - 24 && event.clientY <= markRect.bottom + 24 ? 1 : 0;
    magnetCursor = [event.clientX - markRect.left, event.clientY - markRect.top];
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    lastPoint = null;
    pixelTarget = 0;
    activeUntil = Math.max(activeUntil, performance.now() + 850);
    updateActivity();
  }, { passive: true });
  hero.addEventListener('pointerdown', event => {
    queueDrop(event.clientX, event.clientY, 0.37, 17);
    const markRect = logo.getBoundingClientRect();
    if (event.clientX >= markRect.left && event.clientX <= markRect.right
        && event.clientY >= markRect.top && event.clientY <= markRect.bottom) {
      pixelBurstUntil = performance.now() + 680;
      activeUntil = Math.max(activeUntil, pixelBurstUntil + 450);
      updateActivity();
    }
  }, { passive: true });
  if (nav) {
    nav.addEventListener('pointermove', event => {
      if (document.body.classList.contains('water-nav')) trailRipple(event);
    }, { passive: true });
    nav.addEventListener('pointerdown', event => {
      if (document.body.classList.contains('water-nav')) queueDrop(event.clientX, event.clientY, 0.37, 17);
    }, { passive: true });
    const updateNav = () => {
      document.body.classList.toggle('water-nav', hero.getBoundingClientRect().bottom > nav.offsetHeight);
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav, { passive: true });
    updateNav();
  }

  function resetField(rect) {
    fieldWidth = Math.min(320, Math.max(180, Math.round(rect.width * 0.3)));
    fieldHeight = Math.max(2, Math.round(fieldWidth * rect.height / rect.width));
    const count = fieldWidth * fieldHeight;
    previous = new Float32Array(count);
    current = new Float32Array(count);
    next = new Float32Array(count);
    pixels = new Uint8Array(count * 4);
    for (let i = 0; i < count; i++) {
      pixels[i * 4] = 128;
      pixels[i * 4 + 3] = 255;
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, heightTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fieldWidth, fieldHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  }

  function resize(rect) {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1 : 1.5);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      resetField(rect);
    }
  }

  function applyDrops(rect) {
    for (const [x, y, strength, radius] of pendingDrops) {
      const cx = x * (fieldWidth - 1);
      const cy = y * (fieldHeight - 1);
      const spread = Math.max(1.5, radius * fieldWidth / rect.width);
      const reach = Math.ceil(spread * 2.5);
      for (let row = Math.max(0, Math.floor(cy) - reach); row <= Math.min(fieldHeight - 1, Math.ceil(cy) + reach); row++) {
        for (let col = Math.max(0, Math.floor(cx) - reach); col <= Math.min(fieldWidth - 1, Math.ceil(cx) + reach); col++) {
          const distance2 = (col - cx) ** 2 + (row - cy) ** 2;
          const normalized = distance2 / (spread * spread);
          // A zero-mean pulse makes a crest and trough, avoiding a solid raised stripe behind the cursor.
          const pulse = (1 - normalized * 0.5) * Math.exp(-normalized * 0.5);
          current[row * fieldWidth + col] += strength * pulse;
        }
      }
    }
    pendingDrops.length = 0;
  }

  function stepField() {
    for (let row = 0; row < fieldHeight; row++) {
      for (let col = 0; col < fieldWidth; col++) {
        const index = row * fieldWidth + col;
        const center = current[index];
        // Mirrored neighbors give the water a reflective edge instead of absorbing or clipping the wave.
        const left = current[index + (col === 0 ? 1 : -1)];
        const right = current[index + (col === fieldWidth - 1 ? -1 : 1)];
        const below = current[index + (row === 0 ? fieldWidth : -fieldWidth)];
        const above = current[index + (row === fieldHeight - 1 ? -fieldWidth : fieldWidth)];
        const laplacian = left + right + below + above - 4 * center;
        // Keep the existing impact and damping; lower wave coupling only slows outward travel.
        next[index] = Math.max(-1.2, Math.min(1.2, (2 * center - previous[index] + 0.30 * laplacian) * 0.992));
      }
    }
    [previous, current, next] = [current, next, previous];
  }

  function uploadField() {
    for (let i = 0; i < current.length; i++) {
      pixels[i * 4] = Math.round(128 + Math.max(-1.2, Math.min(1.2, current[i])) * 105);
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, heightTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, fieldWidth, fieldHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  }

  function draw(timestamp) {
    frame = 0;
    const canvasRect = canvas.getBoundingClientRect();
    resize(canvasRect);
    const hadDrops = pendingDrops.length > 0;
    if (hadDrops) applyDrops(canvasRect);
    if (!lastFrame) lastFrame = timestamp;
    accumulator = Math.min(50, accumulator + timestamp - lastFrame);
    lastFrame = timestamp;
    let steps = 0;
    while (accumulator >= 1000 / 60 && steps < 3) {
      stepField();
      accumulator -= 1000 / 60;
      steps++;
    }
    if (hadDrops || steps) uploadField();
    const logoRect = logo.getBoundingClientRect();
    prepareMagnet(logoRect);
    if (!introStartedAt) introStartedAt = timestamp;
    pixelStrength += (pixelTarget - pixelStrength) * 0.16;
    // A narrow point-grid scan crosses the mark once, keeping most of it readable on arrival.
    const pixelIntro = Math.min(1.16, (timestamp - introStartedAt) / 1800 * 1.3 - 0.15);
    const pixelBurst = Math.max(0, (pixelBurstUntil - timestamp) / 680);
    const idleElapsed = timestamp - idleStartedAt;
    const idlePhase = idleElapsed >= 0 && idleElapsed < 2400 ? idleElapsed / 2400 : 0;
    const idleStrength = idlePhase ? Math.sin(Math.PI * idlePhase) : 0;
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.fieldResolution, fieldWidth, fieldHeight);
    gl.uniform2f(uniforms.pixelPointer, pixelPointer[0], pixelPointer[1]);
    gl.uniform2f(uniforms.pixelGrid, Math.max(40, logoRect.width / 5.5), Math.max(16, logoRect.height / 5.5));
    gl.uniform1f(uniforms.pixelStrength, pixelStrength);
    gl.uniform1f(uniforms.pixelIntro, pixelIntro);
    gl.uniform1f(uniforms.pixelBurst, pixelBurst);
    gl.uniform1f(uniforms.idleProgress, -0.18 + idlePhase * 1.36);
    gl.uniform1f(uniforms.idleStrength, idleStrength);
    gl.uniform4f(
      uniforms.rect,
      (logoRect.left - canvasRect.left) / canvasRect.width,
      1 - (logoRect.bottom - canvasRect.top) / canvasRect.height,
      logoRect.width / canvasRect.width,
      logoRect.height / canvasRect.height
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    drawMagnet(logoRect);
    if (!ready) {
      ready = true;
      hero.classList.add('water-ready');
    }
    if (visible && !document.hidden && timestamp < activeUntil) frame = requestAnimationFrame(draw);
    else { lastFrame = 0; accumulator = 0; }
  }

  function updateActivity() {
    if (started && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    if ((!visible || document.hidden) && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      accumulator = 0;
    }
  }

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    updateActivity();
  }, { threshold: 0.01 }).observe(hero);
  document.addEventListener('visibilitychange', updateActivity);
  window.addEventListener('resize', updateActivity, { passive: true });
  // Wake the renderer only for a short breath; never inject an automatic water drop.
  window.setInterval(() => {
    if (!started || !visible || document.hidden || pixelTarget) return;
    idleStartedAt = performance.now();
    activeUntil = Math.max(activeUntil, idleStartedAt + 2450);
    updateActivity();
  }, 5000);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    visible = false;
    updateActivity();
    hero.classList.remove('water-ready');
  });

  function start() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, logoTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logo);
    started = true;
    activeUntil = performance.now() + 2100;
    updateActivity();
  }
  if (logo.complete && logo.naturalWidth) start();
  else logo.addEventListener('load', start, { once: true });
})();
