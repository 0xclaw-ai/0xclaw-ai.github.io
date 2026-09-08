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
    video.tabIndex = 0;
    let hovering = false;
    const update = () => {
      video.controls = touch.matches || hovering ||
        (keyboard && document.activeElement === video) ||
        document.fullscreenElement === video || !!video.webkitDisplayingFullscreen;
    };
    video.addEventListener('pointerenter', () => { hovering = true; update(); });
    video.addEventListener('pointerleave', () => { hovering = false; update(); });
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
