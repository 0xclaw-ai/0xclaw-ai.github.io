// The existing mascot supplies the silhouette; every visible mark is an ASCII glyph.
(() => {
  const figure = document.querySelector('.ascii-mascot');
  if (!figure) return;
  const canvas = figure.querySelector('canvas');
  const source = figure.querySelector('img');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  const cells = [];
  const pointer = { x: -1000, y: -1000 };
  let ready = false, visible = false, raf = 0, last = 0, time = 0;
  function draw() {
    if (!ready) return;
    ctx.clearRect(0, 0, 538, 464);
    ctx.font = '600 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const cell of cells) {
      const sweep = Math.exp(-Math.pow((cell.x + cell.y * .6 - (time * 50 % 1050 - 180)) / 65, 2));
      const hover = reduced.matches ? 0 : Math.exp(-((cell.x - pointer.x) ** 2 + (cell.y - pointer.y) ** 2) / 4500);
      const breath = reduced.matches ? 0 : .04 * Math.sin(time * 1.2 + cell.y * .014);
      const light = reduced.matches ? 0 : sweep * .16 + hover * .2;
      ctx.fillStyle = `rgba(${cell.color},${Math.min(1, cell.alpha + light + breath)})`;
      ctx.fillText(cell.char, cell.x, cell.y);
    }
  }
  function tick(now) {
    raf = 0;
    if (!ready || !visible || document.hidden || reduced.matches || contrast.matches) return;
    if (now - last > 65) {
      time += Math.min((now - last) / 1000, .12);
      last = now;
      draw();
    }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(raf); raf = 0; last = performance.now(); draw();
    if (ready && visible && !document.hidden && !reduced.matches && !contrast.matches) raf = requestAnimationFrame(tick);
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(figure.clientWidth * dpr);
    canvas.height = Math.round(figure.clientHeight * dpr);
    ctx.setTransform(canvas.width / 538, 0, 0, canvas.height / 464, 0, 0);
    draw();
  }
  function sample() {
    if (ready || !source.naturalWidth) return;
    const sampling = document.createElement('canvas');
    sampling.width = 90; sampling.height = 58;
    const pixels = sampling.getContext('2d', { willReadFrequently: true });
    if (!pixels) return;
    pixels.drawImage(source, 0, 0, 90, 58);
    const data = pixels.getImageData(0, 0, 90, 58).data;
    const chars = '.,:;+=x*#';
    for (let y = 0; y < 58; y++) for (let x = 0; x < 90; x++) {
      const i = (y * 90 + x) * 4;
      const [r, g, b, a] = data.subarray(i, i + 4);
      if (a < 100) continue;
      const value = Math.max(r, g, b) / 255;
      const gold = r > b * 1.3 && g > b * 1.2;
      const cyan = g > r * 1.3 && b > r * 1.3 && g > 110;
      cells.push({ x: (x + .5) * 538 / 90, y: (y + .5) * 8,
        char: chars[Math.min(chars.length - 1, Math.floor(value * 8))],
        color: gold ? '224,194,137' : cyan ? '158,229,239' : '202,179,233',
        alpha: (.12 + .88 * Math.pow(value, .72)) * a / 255 });
    }
    ready = true; resize(); figure.classList.add('is-ready'); sync();
  }
  source.addEventListener('load', sample, { once: true });
  if (source.complete) sample();
  new ResizeObserver(resize).observe(figure);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(figure);
  figure.addEventListener('pointermove', e => {
    const r = figure.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width * 538;
    pointer.y = (e.clientY - r.top) / r.height * 464;
  }, { passive: true });
  figure.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1000; });
  reduced.addEventListener('change', sync);
  contrast.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
})();

// ASCII backdrop and responsive logo-inspired lettering.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  document.querySelectorAll('.ascii-backdrop').forEach(canvas => {
    const section = canvas.parentElement;
    const story = section.classList.contains('story');
    const process = section.classList.contains('process');
    const panel = section.classList.contains('signal-workflow');
    const copySelector = panel ? '.workflow-labels, .workflow-controls' : story ? '#story-title, .story-copy, .story-drawing figcaption, .story-drawing svg' : process ? '#process-title, .process-heading > p, .signal-workflow, .process-steps article' : '.hero-copy, .stage-controls, .caption-stack';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, raf = 0, last = 0, time = story ? 9 : process ? 18 : 0;
    let visible = false, masks = [], ink = '';
    const pointer = { x: -1000, y: -1000 };
    const chars = '.,:;+=x*';
    const quiet = (x, y) => masks.reduce((level, box) => {
      const dx = Math.max(box.left - x, 0, x - box.right);
      const dy = Math.max(box.top - y, 0, y - box.bottom);
      return level * (1 - box.strength * Math.exp(-(dx * dx + dy * dy) / 1100));
    }, 1);
    function draw() {
      ctx.clearRect(0, 0, width, height);
      if (contrast.matches) return;
      const extent = panel || story || process || width < 700 ? width : width * .67;
      const edgeFade = (x, y) => Math.min(1, y / 36, (height - y) / 42) *
        Math.min(1, (extent - x) / 65);
      // Small cells form drifting ribbons; text areas remain deliberately quiet.
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      for (let y = 14; y < height; y += 16) {
        for (let x = 8; x < extent; x += 12) {
          const wave = Math.sin(x * .013 + y * .006 + time * .28) +
            .64 * Math.cos(y * .019 - x * .007 - time * .21) +
            .35 * Math.sin(x * .031 + y * .023 + time * .09);
          const band = Math.max(0, 1 - Math.abs(wave - .55) * 1.6);
          const hover = Math.exp(-((x - pointer.x) ** 2 + (y - pointer.y) ** 2) / 4200);
          const signal = Math.pow(Math.max(0, Math.sin(x * .008 - y * .011 - time * .65)), 10);
          const alpha = (.46 * band + .18 * hover + .13 * signal * band) * quiet(x, y) * edgeFade(x, y);
          if (alpha < .025) continue;
          const index = Math.min(chars.length - 1, Math.floor((band * .8 + hover * .2) * chars.length));
          ctx.fillStyle = `rgba(${signal > .6 ? '166,212,229' : ink},${alpha})`;
          ctx.fillText(chars[index], x, y);
        }
      }
      // The grid is subordinate to the characters, and fades beneath the copy too.
      if (panel) return;
      ctx.lineWidth = .7;
      for (let x = 22; x < extent; x += 100) {
        for (let y = 8; y < height - 8; y += 16) {
          ctx.strokeStyle = `rgba(${ink},${.13 * quiet(x, y) * edgeFade(x, y)})`;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke();
        }
      }
      for (let y = 25; y < height; y += 100) {
        for (let x = 0; x < extent - 16; x += 16) {
          ctx.strokeStyle = `rgba(${ink},${.11 * quiet(x, y) * edgeFade(x, y)})`;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y); ctx.stroke();
        }
      }
    }
    function tick(now) {
      raf = 0;
      if (motion.matches || contrast.matches || !visible || document.hidden) return;
      if (now - last > 65) {
        time += Math.min((now - last) / 1000, .12);
        last = now;
        draw();
      }
      raf = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(raf); raf = 0;
      last = performance.now(); draw();
      if (!motion.matches && !contrast.matches && visible && !document.hidden) raf = requestAnimationFrame(tick);
    }
    function resize() {
      width = section.clientWidth; height = section.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ink = getComputedStyle(section).getPropertyValue('--ascii-ink').trim();
      const area = section.getBoundingClientRect();
      masks = [...section.querySelectorAll(copySelector)].map(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left - area.left - 10, right: r.right - area.left + 10,
          top: r.top - area.top - 8, bottom: r.bottom - area.top + 8,
          strength: el.tagName.toLowerCase() === 'svg' ? .68 : .97 };
      });
      draw();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);
    section.querySelectorAll(copySelector).forEach(el => resizeObserver.observe(el));
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(section);
    section.addEventListener('pointermove', e => {
      const r = section.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    }, { passive: true });
    section.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1000; });
    motion.addEventListener('change', sync);
    contrast.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    document.fonts.ready.then(resize);
    resize(); sync();
  });
})();

(() => {
  const title=document.getElementById('hero-title');
  const first=title.firstChild;
  const lead=document.createElement('span');lead.className='logo-lead';lead.textContent=first.textContent;first.replaceWith(lead);
  const words=[lead,...title.querySelectorAll('.headline-stage')];
  words.forEach(word=>{
    const text=word.textContent;
    const outer=document.createElement('span');outer.className='logo-lettering';outer.dataset.label=text;
    const face=document.createElement('span');face.className='logo-face';face.textContent=text;face.dataset.label=text;
    outer.append(face);word.replaceChildren(outer);
  });
  // Keep the large cap height; condense the display lettering to the available line.
  function fit(){
    const available=title.clientWidth-42;
    const widest=Math.max(...words.map(word=>word.querySelector('.logo-lettering').offsetWidth));
    title.style.setProperty('--logo-width',String(Math.min(1,available/widest)));
  }
  const stack=title.querySelector('.headline-stack');
  function placeLight(event){
    const face=stack.querySelector('.is-active .logo-face');
    if(!face)return;
    const box=face.getBoundingClientRect();
    stack.style.setProperty('--logo-light-x',`${(event.clientX-box.left)/box.width*face.offsetWidth}px`);
    stack.style.setProperty('--logo-light-y',`${event.clientY-box.top}px`);
  }
  stack.addEventListener('pointerenter',placeLight,{passive:true});
  stack.addEventListener('pointermove',placeLight,{passive:true});
  document.fonts.ready.then(fit);
  new ResizeObserver(fit).observe(title.parentElement);
})();

(() => {
 const headings=[...document.querySelectorAll('h2')];
 headings.forEach(heading=>{
  // Keep the existing phrases, explicit line breaks and emphasized second lines.
  heading.setAttribute('aria-label',heading.innerText.replace(/\s+/g,' ').trim());
  const lines=[];let line={text:'',accent:false};
  for(const node of [...heading.childNodes]){
   if(node.nodeName==='BR'){lines.push(line);line={text:'',accent:false};continue}
   line.text+=node.textContent;
   if(node.nodeType===1&&node.matches('.type-accent'))line.accent=true;
  }
  if(line.text.trim())lines.push(line);
  heading.replaceChildren();heading.classList.add('claw-heading');
  lines.forEach(({text,accent})=>{
   const row=document.createElement('span');row.className='claw-line'+(accent?' claw-accent':'');row.setAttribute('aria-hidden','true');
   const outer=document.createElement('span');outer.className='logo-lettering';outer.dataset.label=text.trim();
   const face=document.createElement('span');face.className='logo-face';face.textContent=text.trim();
   outer.append(face);row.append(outer);heading.append(row);
  });
 });
 function fit(){headings.forEach(heading=>{
  const widest=Math.max(...[...heading.querySelectorAll('.logo-lettering')].map(el=>el.offsetWidth));
  heading.style.setProperty('--logo-width',Math.min(1,(heading.clientWidth-24)/widest));
 })}
 const observer=new ResizeObserver(fit);headings.forEach(h=>observer.observe(h));
 document.fonts.ready.then(fit);
})();
