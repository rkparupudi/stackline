{
const $=s=>document.querySelector(s);
const store={get(k,d){try{const v=localStorage.getItem('stackline-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('stackline-'+k,JSON.stringify(v))}catch(e){}}};
const BY=Object.fromEntries(S.map(s=>[s.id,s]));
const HEROES={HERO,HERO_AG};
// course index
const INFO={};
for(const c of COURSES){c.list=c.modules.flatMap(m=>m.ids);c.modules.forEach((m,mi)=>m.ids.forEach(id=>{INFO[id]={c,m,mi,n:c.list.indexOf(id)+1}}))}
const hook=id=>HOOK[id]||BY[id].lede.split('. ')[0];
const words=s=>[s.lede,...(s.ideas||[]),s.real,s.trade,s.tip,...(s.steps||[]).map(x=>x[1])].join(' ').split(/\s+/).length;
const mins=id=>{const s=BY[id];return Math.max(3,Math.round(words(s)/170)+2+(LABS[id]?3:0))};
let done=new Set(store.get('done',[]));
const saveDone=()=>store.set('done',[...done]);
const pct=c=>Math.round(c.list.filter(id=>done.has(id)).length/c.list.length*100);

/* ---------- theme: auto = light by day (6:00–18:00), dark at night ---------- */
const themeSel=$('#theme');
function applyTheme(){const pref=store.get('theme','auto');let t=pref;if(pref==='auto'){const h=new Date().getHours();t=h>=6&&h<18?'light':'dark'}
  document.documentElement.dataset.theme=t;themeSel.value=pref;themeSel.title=pref==='auto'?`Auto (currently ${t})`:''}
themeSel.onchange=()=>{store.set('theme',themeSel.value);applyTheme()};
applyTheme();setInterval(applyTheme,5*60*1000);

/* ---------- animated figure ---------- */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let figs=[],cleanups=[];
const io=new IntersectionObserver(es=>{for(const e of es){const f=figs.find(f=>f.el===e.target);if(f){f.vis=e.isIntersecting;f.sync()}}},{threshold:.15});
function mountFig(el,s0){
  const f={el,s0,speed:store.get('speed',1),user:reduce,vis:false,i:-1};
  function render(){
    const s=scaleScene(s0,1/f.speed);f.s=s;
    el.innerHTML=`<div class="canvas">${build(s)}</div>
    <div class="ctrl">
      <button type="button" class="ic" data-a="prev" aria-label="Previous step">‹</button>
      <button type="button" class="play" data-a="play"></button>
      <button type="button" class="ic" data-a="next" aria-label="Next step">›</button>
      <div class="bar" aria-hidden="true"><b></b></div>
      <label class="spd">Speed <select data-a="speed">${[.5,.75,1,1.5].map(v=>`<option value="${v}"${v===f.speed?' selected':''}>${v}×</option>`).join('')}</select></label>
    </div>
    <ol class="steps">${s.steps.map(([t,x],i)=>`<li><button type="button" data-i="${i}">${esc(x)}</button></li>`).join('')}</ol>`;
    f.svg=el.querySelector('svg');f.bar=el.querySelector('.bar b');f.btn=el.querySelector('.play');f.lis=[...el.querySelectorAll('.steps li')];f.i=-1;
    f.svg.pauseAnimations();
    el.querySelector('[data-a=play]').onclick=()=>{f.user=!f.user;f.sync()};
    el.querySelector('[data-a=prev]').onclick=()=>go(Math.max(0,f.i-1),true);
    el.querySelector('[data-a=next]').onclick=()=>go((f.i+1)%s.steps.length,true);
    el.querySelector('[data-a=speed]').onchange=e=>{const t=f.svg.getCurrentTime()%f.s.L/f.s.L;f.speed=+e.target.value;store.set('speed',f.speed);render();f.svg.setCurrentTime(t*f.s.L);f.sync();paint(f,true)};
    el.querySelectorAll('.steps button').forEach(b=>b.onclick=()=>go(+b.dataset.i,false));
    f.sync();paint(f,true)}
  function go(i,pause){const s=f.s,cur=f.svg.getCurrentTime();f.svg.setCurrentTime(Math.floor(cur/s.L)*s.L+s.steps[i][0]+.02);if(pause){f.user=true;f.sync()}paint(f,true)}
  f.sync=()=>{if(!f.btn)return;f.btn.textContent=f.user?'▶ Play':'❚❚ Pause';f.btn.setAttribute('aria-label',f.user?'Play animation':'Pause animation');if(f.vis&&!f.user)f.svg.unpauseAnimations();else f.svg.pauseAnimations()};
  render();figs.push(f);io.observe(el);
}
function paint(f,force){const t=f.svg.getCurrentTime()%f.s.L;let i=0;f.s.steps.forEach((st,k)=>{if(t>=st[0])i=k});
  if(i!==f.i||force){f.lis.forEach((l,k)=>l.classList.toggle('on',k===i));f.i=i}f.bar.style.width=(t/f.s.L*100).toFixed(2)+'%'}
const loop=()=>{for(const f of figs)if(f.vis&&!f.user)paint(f);requestAnimationFrame(loop)};requestAnimationFrame(loop);

/* ---------- views ---------- */
const app=$('#app');
function teardown(){figs.forEach(f=>io.unobserve(f.el));figs=[];cleanups.forEach(fn=>{try{fn()}catch(e){}});cleanups=[]}
const tick='<svg class="tk" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const nextFor=c=>c.list.find(id=>!done.has(id))||c.list[0];

function viewHome(){
  const last=store.get('last',null);
  app.innerHTML=`<section class="home-hero"><div class="wrap">
    <div class="hh"><div><h1>Learn system design by watching it run</h1>
    <p class="lead">Short lessons where every idea is a live, animated system. Step through it, break it in a lab, then check yourself with a quick quiz.</p>
    <div class="cta">${last&&BY[last]?`<a class="btn pri" href="#${last}">Continue: ${esc(BY[last].t)} →</a>`:`<a class="btn pri" href="#${COURSES[0].list[0]}">Start the system design course →</a>`}<a class="btn" href="#agent-design">Explore AI agent design</a></div></div>
    <div class="figc" id="hero-fig"></div></div></div></section>
  <section class="band"><div class="wrap"><h2>Two courses</h2><div class="cards">${COURSES.map(c=>{const p=pct(c);return`<a class="course" href="#${c.id}">
    <h3>${esc(c.t)}</h3><p>${esc(c.d)}</p>
    <ul>${c.modules.map(m=>`<li>${esc(m.t)} <span>${m.ids.length} lessons</span></li>`).join('')}</ul>
    <div class="prog"><div class="pbar"><b style="width:${p}%"></b></div><span>${p?`${p}% complete`:`${c.list.length} lessons`}</span></div>
    <span class="go">${p?'Continue':'Start'} →</span></a>`}).join('')}</div></div></section>
  <section class="band alt"><div class="wrap"><h2>How each lesson works</h2><ol class="how">
    <li><b>Watch</b><span>A looping animation shows requests moving and things failing.</span></li>
    <li><b>Step through</b><span>Pause, go back a step, slow it down. Each step has a plain-English caption.</span></li>
    <li><b>Try it</b><span>Live labs let you break load balancers, hash rings, rate limiters and breakers.</span></li>
    <li><b>Check yourself</b><span>Two quick questions with explanations, then mark the lesson complete.</span></li></ol></div></section>`;
  mountFig($('#hero-fig'),HERO);
}

function viewCourse(c){
  const p=pct(c);
  app.innerHTML=`<section class="band course-head"><div class="wrap narrow">
    <p class="crumb"><a href="#">Home</a> / ${esc(c.t)}</p><h1>${esc(c.t)}</h1><p class="lead">${esc(c.d)}</p>
    <div class="prog big"><div class="pbar"><b style="width:${p}%"></b></div><span>${c.list.filter(id=>done.has(id)).length} of ${c.list.length} lessons complete</span></div>
    <a class="btn pri" href="#${nextFor(c)}">${p?'Continue':'Start'}: ${esc(BY[nextFor(c)].t)} →</a></div></section>
  <section class="band"><div class="wrap narrow">${c.modules.map((m,mi)=>`<div class="module"><h2><span>Module ${mi+1}</span>${esc(m.t)}</h2><ol class="lessons">${m.ids.map(id=>`<li><a href="#${id}" class="${done.has(id)?'done':''}">
      <span class="num">${done.has(id)?tick:INFO[id].n}</span><span class="tx"><b>${esc(BY[id].t)}</b><small>${esc(hook(id))}</small></span>
      <span class="meta">${LABS[id]?'<em>Lab</em>':''}${mins(id)} min</span></a></li>`).join('')}</ol></div>`).join('')}</div></section>`;
}

function sidebar(id){const {c}=INFO[id];return`<div class="side-in"><p class="side-t"><a href="#${c.id}">${esc(c.t)}</a></p>
  <div class="prog"><div class="pbar"><b style="width:${pct(c)}%"></b></div><span>${pct(c)}%</span></div>
  ${c.modules.map((m,mi)=>`<p class="side-m">${mi+1}. ${esc(m.t)}</p><ol>${m.ids.map(x=>`<li><a href="#${x}" class="${x===id?'cur':''} ${done.has(x)?'done':''}"${x===id?' aria-current="page"':''}><span class="num">${done.has(x)?tick:INFO[x].n}</span>${esc(BY[x].t)}</a></li>`).join('')}</ol>`).join('')}</div>`}

function quizHTML(id){const q=QUIZ[id];if(!q)return'';return`<section class="quiz" id="quiz"><h2>Check yourself</h2>${q.map(([qq,opts],qi)=>`<fieldset data-q="${qi}"><legend>${qi+1}. ${esc(qq)}</legend>${opts.map((o,oi)=>`<button type="button" data-o="${oi}">${esc(o)}</button>`).join('')}<p class="exp" hidden></p></fieldset>`).join('')}<p class="score" aria-live="polite"></p></section>`}
function wireQuiz(id){const q=QUIZ[id];if(!q)return;let answered=0,right=0;
  document.querySelectorAll('.quiz fieldset').forEach(fs=>{const qi=+fs.dataset.q,[,,ans,exp]=q[qi];
    fs.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(fs.dataset.done)return;fs.dataset.done=1;const ok=+b.dataset.o===ans;answered++;if(ok)right++;
      b.classList.add(ok?'right':'wrong');fs.querySelectorAll('button')[ans].classList.add('right');fs.querySelectorAll('button').forEach(x=>x.disabled=true);
      const e=fs.querySelector('.exp');e.hidden=false;e.innerHTML=`<b>${ok?'Correct.':'Not quite.'}</b> ${esc(exp)}`;
      if(answered===q.length)document.querySelector('.quiz .score').textContent=`You got ${right} of ${q.length}. ${right===q.length?'Nicely done.':'Re-read the key ideas above, then try the next lesson.'}`})})}

function viewLesson(id){
  const s=BY[id],{c,m,mi,n}=INFO[id],L=c.list,prev=L[n-2],next=L[n],lab=LABS[id];
  store.set('last',id);
  app.innerHTML=`<div class="lesson-wrap">
  <aside class="side" id="side" aria-label="Course contents">${sidebar(id)}</aside>
  <article class="lesson">
    <button type="button" class="btn sm toc" id="toc" aria-expanded="false" aria-controls="side">☰ Course contents</button>
    <p class="crumb"><a href="#${c.id}">${esc(c.t)}</a> / Module ${mi+1}: ${esc(m.t)}</p>
    <p class="meta-line">Lesson ${n} of ${L.length} · ${mins(id)} min${lab?' · includes a live lab':''}${done.has(id)?' · <span class="ok-t">completed</span>':''}</p>
    <h1>${esc(s.t)}</h1>
    <p class="tldr">${esc(s.lede)}</p>
    ${s.noFig?'':`<div class="figc" id="lesson-fig"></div>`}
    <section><h2>Key ideas</h2><ul class="ideas">${s.ideas.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></section>
    ${s.html?`<section>${s.html}</section>`:''}
    ${lab?`<section class="lab" id="lab"><h2>${esc(lab.title)}</h2><p class="note">${esc(lab.intro)}</p>${lab.html}</section>`:''}
    <section class="facts"><div><h3>In the real world</h3><p>${esc(s.real)}</p></div><div><h3>Trade-offs</h3><p>${esc(s.trade)}</p></div><div class="tip"><h3>Interview tip</h3><p>${esc(s.tip)}</p></div></section>
    ${quizHTML(id)}
    <details class="reflect"><summary>Think it through: ${esc(s.qa[0])}</summary><p>${esc(s.qa[1])}</p></details>
    <div class="complete"><button type="button" class="btn pri" id="done-btn">${done.has(id)?(next?'Completed ✓ · Next lesson →':'Completed ✓ · Back to course'):(next?'Mark complete & continue →':'Mark complete & finish course')}</button></div>
    <nav class="pn" aria-label="Lesson navigation">${prev?`<a href="#${prev}" class="p"><small>‹ Previous</small><b>${esc(BY[prev].t)}</b></a>`:'<span></span>'}${next?`<a href="#${next}" class="n"><small>Next ›</small><b>${esc(BY[next].t)}</b></a>`:`<a href="#${c.id}" class="n"><small>Finished</small><b>Back to course</b></a>`}</nav>
  </article></div>`;
  if(!s.noFig)mountFig($('#lesson-fig'),s);
  if(lab)cleanups.push(lab.mount($('#lab')));
  wireQuiz(id);
  $('#done-btn').onclick=()=>{done.add(id);saveDone();location.hash=next||c.id};
  const side=$('#side'),toc=$('#toc');toc.onclick=()=>{const o=side.classList.toggle('open');toc.setAttribute('aria-expanded',o)};
  const cur=side.querySelector('.cur');if(cur&&side.scrollHeight>side.clientHeight)side.scrollTop=cur.offsetTop-side.clientHeight/3;
}

/* ---------- router ---------- */
const COURSE_BY=Object.fromEntries(COURSES.map(c=>[c.id,c]));
function route(){
  teardown();
  let h=decodeURIComponent(location.hash.slice(1));
  if(h==='agents')h='agent-design';
  if(BY[h]&&INFO[h])viewLesson(h);
  else if(COURSE_BY[h])viewCourse(COURSE_BY[h]);
  else viewHome();
  const cur=INFO[h]?INFO[h].c.id:COURSE_BY[h]?h:'';
  document.querySelectorAll('.topnav a[data-c]').forEach(a=>a.toggleAttribute('aria-current',a.dataset.c===cur));
  document.title=(BY[h]?BY[h].t+' · ':COURSE_BY[h]?COURSE_BY[h].t+' · ':'')+'Stackline';
  window.scrollTo(0,0);
}
addEventListener('hashchange',route);route();

/* keyboard: ← → between lessons */
addEventListener('keydown',e=>{
  if((e.key==='k'&&(e.ctrlKey||e.metaKey))||(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))){e.preventDefault();openSearch();return}
  if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('#search').classList.contains('open'))return;
  const id=decodeURIComponent(location.hash.slice(1));if(!INFO[id])return;const {c,n}=INFO[id];
  if(e.key==='ArrowRight'&&c.list[n])location.hash=c.list[n];
  if(e.key==='ArrowLeft'&&c.list[n-2])location.hash=c.list[n-2];
});

/* ---------- search ---------- */
const sw=$('#search'),si=$('#s-in'),sr=$('#s-res');let hits=[],sel=0,lastFocus=null;
const IDX=S.filter(s=>INFO[s.id]).map(s=>({id:s.id,t:s.t,c:INFO[s.id].c.t,txt:[s.t,s.lede,...(s.ideas||[]),HOOK[s.id]||''].join(' ').toLowerCase()}));
function openSearch(){lastFocus=document.activeElement;sw.classList.add('open');sw.setAttribute('aria-hidden','false');si.value='';find();si.focus()}
function closeSearch(){sw.classList.remove('open');sw.setAttribute('aria-hidden','true');if(lastFocus)lastFocus.focus()}
function find(){const q=si.value.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean);
  hits=(terms.length?IDX.filter(x=>terms.every(t=>x.txt.includes(t))).sort((a,b)=>(b.t.toLowerCase().includes(q))-(a.t.toLowerCase().includes(q))):IDX).slice(0,8);sel=0;
  sr.innerHTML=hits.length?hits.map((h,i)=>`<li><a href="#${h.id}" class="${i===sel?'sel':''}" id="sr-${i}"><b>${esc(h.t)}</b><small>${esc(h.c)} · ${esc(hook(h.id))}</small></a></li>`).join(''):'<li class="none">No lessons match. Try “cache”, “queue” or “agent”.</li>';
  sr.querySelectorAll('a').forEach(a=>a.onclick=()=>closeSearch())}
si.oninput=find;
si.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!hits.length)return;sel=(sel+(e.key==='ArrowDown'?1:-1)+hits.length)%hits.length;sr.querySelectorAll('a').forEach((a,i)=>a.classList.toggle('sel',i===sel))}
  if(e.key==='Enter'&&hits[sel]){location.hash=hits[sel].id;closeSearch()}if(e.key==='Escape')closeSearch()};
$('#s-open').onclick=openSearch;$('#s-close').onclick=closeSearch;sw.onclick=e=>{if(e.target===sw)closeSearch()};
/* label table cells for the stacked mobile layout */
new MutationObserver(()=>{for(const c of document.querySelectorAll('.stack td:not([data-l])')){let i=0,p=c;while(p=p.previousElementSibling)i+=p.colSpan;c.dataset.l=c.closest('table').rows[0].cells[i]?.textContent||''}}).observe(document.body,{childList:true,subtree:true});
}
