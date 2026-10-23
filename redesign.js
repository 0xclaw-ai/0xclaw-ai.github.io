// Preserve native controls and prevent overlapping soundtracks.
document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{
  document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause()});
}));
const art=document.querySelector('.hero-art');
const buttons=[...document.querySelectorAll('[data-stage-button]')];
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const layers=[...document.querySelectorAll('[data-phase]')];
let current=0,holding=false,timer,ready=false,inView=true;
// Keep every layer mounted and sized. CSS transitions can reverse smoothly on rapid clicks.
function select(index){
  current=index;art.dataset.stage=String(index);
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  layers.forEach(layer=>{
    const active=Number(layer.dataset.phase)===index;
    layer.classList.toggle('is-active',active);
    if(!layer.classList.contains('headline-stage'))layer.setAttribute('aria-hidden',String(!active));
  });
}
function schedule(){
  clearTimeout(timer);
  if(ready&&!reduced.matches&&!holding&&!document.hidden&&inView)timer=setTimeout(()=>{select((current+1)%buttons.length);schedule()},6500);
}
buttons.forEach((button,index)=>button.addEventListener('click',()=>{select(index);schedule()}));
art.addEventListener('pointerenter',()=>{holding=true;schedule()});
art.addEventListener('pointerleave',()=>{holding=art.contains(document.activeElement);schedule()});
art.addEventListener('focusin',()=>{holding=true;schedule()});
art.addEventListener('focusout',()=>{requestAnimationFrame(()=>{holding=art.matches(':hover')||art.contains(document.activeElement);schedule()})});
document.addEventListener('visibilitychange',schedule);
reduced.addEventListener('change',schedule);
Promise.all([...art.querySelectorAll('img')].map(image=>image.decode().catch(()=>{}))).then(()=>{ready=true;schedule()});
schedule();
if('IntersectionObserver'in window){
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule()},{threshold:.15}).observe(art);
  if(!reduced.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('entered');observer.unobserve(entry.target)}}),{threshold:.1});
    document.querySelectorAll('.overview .section-intro,.projects .section-intro').forEach(item=>observer.observe(item));
  }
}
