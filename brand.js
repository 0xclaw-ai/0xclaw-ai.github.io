// ASCII backdrop and responsive logo-inspired lettering.
(() => {
  const canvas = document.querySelector('.ascii-backdrop');
  const hero = canvas.closest('.hero');
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,raf=0,last=0,time=0,visible=true,paused=motion.matches;
  const pointer={x:-1000,y:-1000};
  const chars=' .,:;+=x*';
  function draw(){
    ctx.clearRect(0,0,width,height);
    const rgb=getComputedStyle(document.body).getPropertyValue('--ascii-ink').trim();
    const copy=hero.querySelector('.hero-copy').getBoundingClientRect();
    const area=hero.getBoundingClientRect();
    const cx=copy.left-area.left+copy.width*.45;
    const cy=copy.top-area.top+copy.height*.48;
    // Open space around readable content; detail lives in the surrounding margins.
    const quiet=(x,y)=>1-.94*Math.exp(-Math.pow((x-cx)/(copy.width*.64),6)-Math.pow((y-cy)/(copy.height*.69),6));
    ctx.lineWidth=.65;
    const step=100;
    for(let x=22;x<width*.62;x+=step){
      ctx.strokeStyle=`rgba(${rgb},.075)`;
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();
    }
    for(let y=25;y<height;y+=step){
      ctx.strokeStyle=`rgba(${rgb},.065)`;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width*.60,y);ctx.stroke();
    }
    ctx.font='11px monospace';ctx.textAlign='center';
    for(let y=13;y<height;y+=14){
      for(let x=8;x<width*.65;x+=10){
        const wave=Math.sin(x*.013+y*.006+time*.17)+.64*Math.cos(y*.019-x*.007-time*.12)+.35*Math.sin(x*.031+y*.023);
        const band=Math.max(0,1-Math.abs(wave-.55)*1.6);
        const edge=quiet(x,y);
        const hover=Math.exp(-((x-pointer.x)**2+(y-pointer.y)**2)/4200);
        const alpha=(.27*band+.14*hover)*edge;
        if(alpha<.025)continue;
        const index=Math.min(chars.length-1,1+Math.floor((band*.7+hover*.3)*(chars.length-2)));
        ctx.fillStyle=`rgba(${rgb},${alpha})`;
        ctx.fillText(chars[index],x,y);
      }
    }
    // A single signal follows the underlying grid, like work advancing through stages.
    const progress=(time*.075)%1;
    const px=22+Math.floor(progress*4)*100;
    const py=25+((progress*4)%1)*100;
    ctx.strokeStyle=`rgba(${rgb},.3)`;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(px-4,py);ctx.lineTo(px+4,py);ctx.moveTo(px,py-4);ctx.lineTo(px,py+4);ctx.stroke();
  }
  function tick(now){raf=0;if(paused||!visible||document.hidden)return;if(now-last>65){time+=Math.min((now-last)/1000,.12);last=now;draw()}raf=requestAnimationFrame(tick)}
  function sync(){cancelAnimationFrame(raf);raf=0;last=performance.now();draw();if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(tick)}
  function resize(){width=hero.clientWidth;height=hero.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()}).observe(hero);
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top},{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-1000});
  motion.addEventListener('change',()=>{paused=motion.matches;sync()});
  document.addEventListener('visibilitychange',sync);resize();sync();
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
