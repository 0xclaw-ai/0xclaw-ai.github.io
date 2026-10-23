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
reduced.addEventListener('change',()=>{schedule();updateBackground()});
Promise.all([...art.querySelectorAll('img')].map(image=>image.decode().catch(()=>{}))).then(()=>{ready=true;schedule()});
schedule();
if('IntersectionObserver'in window){
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule()},{threshold:.15}).observe(art);
  if(!reduced.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('entered');observer.unobserve(entry.target)}}),{threshold:.1});
    document.querySelectorAll('.overview .section-intro,.projects .section-intro').forEach(item=>observer.observe(item));
  }
}
// Motion is driven by native scroll; no scroll interception and no perpetual render loop.
const drawings=[...document.querySelectorAll('.motion-drawing')];
const steps=[...document.querySelectorAll('.process-steps article')];
const motionSections=[...document.querySelectorAll('.process,.story')];
const trail=document.querySelector('.story-drawing .drawing-path');
const trailLength=trail.getTotalLength();
const dot=document.querySelector('.travel-dot');
const clamp=value=>Math.max(0,Math.min(1,value));
if('IntersectionObserver'in window){
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');reveal.unobserve(entry.target)}}),{threshold:.12});
  motionSections.forEach(section=>{if(!reduced.matches)section.classList.add('motion-ready');reveal.observe(section)});
}
let framePending=false;
function updateBackground(){
  const distance=document.documentElement.scrollHeight-innerHeight;
  const progress=distance>0?clamp(scrollY/distance):0;
  document.documentElement.style.setProperty('--scroll-tint',reduced.matches?'0':String(progress*.24));
  drawings.forEach(drawing=>{
    const box=drawing.getBoundingClientRect();
    const amount=reduced.matches?1:clamp((innerHeight*.95-box.top)/(innerHeight*.68));
    drawing.style.setProperty('--draw-progress',amount.toFixed(4));
    drawing.querySelectorAll('.phase-node').forEach((node,index)=>{node.style.opacity=String(.25+.75*clamp(amount*7-index))});
    if(drawing.classList.contains('story-drawing')){
      const point=trail.getPointAtLength(trailLength*amount);
      dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
    }
  });
  steps.forEach(step=>{const box=step.getBoundingClientRect();step.style.setProperty('--step-progress',reduced.matches?'1':clamp((innerHeight*.9-box.top)/(innerHeight*.5)).toFixed(4))});
  framePending=false;
}
addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(updateBackground)}},{passive:true});
addEventListener('resize',updateBackground);updateBackground();

// Native media controls appear only during interaction; retain them without JS.
document.querySelectorAll('video').forEach(video=>{
  let hovered=false,touched=false,keyboard=false;
  video.tabIndex=0;
  function syncControls(){
    const fullscreen=document.fullscreenElement===video||video.webkitDisplayingFullscreen;
    video.controls=Boolean(hovered||touched||keyboard||fullscreen);
  }
  video.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'||event.pointerType==='pen'){hovered=true;syncControls()}});
  video.addEventListener('pointerleave',()=>{hovered=false;syncControls()});
  video.addEventListener('pointerdown',event=>{keyboard=false;if(event.pointerType==='touch')touched=true;syncControls()});
  video.addEventListener('focus',()=>{keyboard=video.matches(':focus-visible');syncControls()});
  video.addEventListener('keydown',()=>{keyboard=true;syncControls()});
  video.addEventListener('blur',()=>{keyboard=false;touched=false;syncControls()});
  document.addEventListener('pointerdown',event=>{if(event.target!==video){touched=false;keyboard=false;syncControls()}},{passive:true});
  document.addEventListener('fullscreenchange',syncControls);
  video.addEventListener('webkitbeginfullscreen',syncControls);
  video.addEventListener('webkitendfullscreen',syncControls);
  syncControls();
});

// Seven named phases run only while their illustration is in view.
const workflow=document.querySelector('.workflow-drawing');
const phaseLabels=[...workflow.querySelectorAll('[data-workflow-phase]')];
const phaseNodes=[...workflow.querySelectorAll('.phase-node')];
let workflowPhase=0,workflowVisible=false,workflowTimer;
function showWorkflowPhase(index){
  workflowPhase=index;
  workflow.style.setProperty('--phase-progress',String(index/6));
  phaseLabels.forEach((label,i)=>label.classList.toggle('is-current',i===index));
  phaseNodes.forEach((node,i)=>{node.classList.toggle('is-current',i===index);node.classList.toggle('is-complete',i<index)});
}
function scheduleWorkflow(){
  clearTimeout(workflowTimer);
  if(workflowVisible&&!reduced.matches&&!document.hidden)workflowTimer=setTimeout(()=>{showWorkflowPhase((workflowPhase+1)%7);scheduleWorkflow()},2200);
}
showWorkflowPhase(0);
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{workflowVisible=entries[0].isIntersecting;scheduleWorkflow()},{threshold:.55}).observe(workflow);
document.addEventListener('visibilitychange',scheduleWorkflow);
reduced.addEventListener('change',scheduleWorkflow);
