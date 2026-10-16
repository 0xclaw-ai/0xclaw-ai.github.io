/* Keep native playback controls, but reveal them only during interaction.
   Without JavaScript, the HTML controls attribute remains a usable fallback. */
(() => {
  const section = document.getElementById('project-videos');
  if (!section) return;
  const touch = matchMedia('(hover: none), (pointer: coarse)');
  let keyboard = false;
  section.addEventListener('keydown', () => { keyboard = true; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') keyboard = true;
  });
  section.addEventListener('pointerdown', () => { keyboard = false; });
  section.querySelectorAll('video').forEach(video => {
    const media = document.createElement('div');
    media.className = 'project-video-media';
    video.parentNode.insertBefore(media, video);
    media.appendChild(video);
    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = 'project-video-play';
    playButton.setAttribute('aria-label', `Play ${video.getAttribute('aria-label') || 'project video'}`);
    playButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.7v14.6a1 1 0 0 0 1.54.84l11.1-7.3a1 1 0 0 0 0-1.68L8.54 3.86A1 1 0 0 0 7 4.7Z"/></svg>';
    media.appendChild(playButton);
    video.tabIndex = 0;
    let hovering = false;
    const update = () => {
      video.controls = touch.matches || hovering ||
        (keyboard && document.activeElement === video) ||
        document.fullscreenElement === video || !!video.webkitDisplayingFullscreen;
    };
    media.addEventListener('pointerenter', () => { hovering = true; update(); });
    media.addEventListener('pointerleave', () => { hovering = false; update(); });
    playButton.addEventListener('click', () => {
      video.play().catch(() => { video.controls = true; });
    });
    const syncPlayback = () => {
      const playing = !video.paused && !video.ended;
      media.classList.toggle('is-playing', playing);
      playButton.tabIndex = playing ? -1 : 0;
    };
    video.addEventListener('play', syncPlayback);
    video.addEventListener('pause', syncPlayback);
    video.addEventListener('ended', syncPlayback);
    video.addEventListener('focus', update);
    video.addEventListener('blur', update);
    video.addEventListener('keydown', event => {
      keyboard = true;
      update();
      if ((event.key === ' ' || event.key === 'Enter') && event.target === video) {
        event.preventDefault();
        if (video.paused) video.play().catch(() => { video.controls = true; });
        else video.pause();
      }
    });
    document.addEventListener('fullscreenchange', update);
    video.addEventListener('webkitendfullscreen', update);
    touch.addEventListener('change', update);
    update();
  });
})();
