/* Each lab: {title, intro, html, mount(root) -> cleanup()} */
const LABS={};

LABS['load-balancer']={title:'Live lab: load balancer',
intro:'Requests stream in continuously. Server C is twice as slow as the others. Switch algorithms or take servers down, and watch where the work piles up.',
html:`<div class="row"><label>Algorithm <select id="lb-alg"><option value="rr">Round robin</option><option value="lc">Least connections</option><option value="rnd">Random</option></select></label></div><div class="srv" id="lb-srv"></div><div class="stat" id="lb-stat"></div>`,
mount(root){const $=s=>root.querySelector(s);
 const srv=['A','B','C','D'].map(n=>({n:'Server '+n,up:true,slow:n==='C'?2:1,act:0,tot:0}));let rr=0,dropped=0,sent=0,lat=[],timers=new Set();
 $('#lb-srv').innerHTML=srv.map((s,i)=>`<div class="sv" data-i="${i}"><b>${s.n}</b><small>${s.slow>1?'2× slower':'normal speed'}</small><div class="meter"><i></i></div><small class="c"></small><button type="button" data-i="${i}">Take down</button></div>`).join('');
 const cards=[...root.querySelectorAll('.sv')];
 root.querySelectorAll('.sv button').forEach(b=>b.onclick=()=>{const s=srv[b.dataset.i];s.up=!s.up;if(!s.up)s.act=0;draw()});
 const alg=$('#lb-alg');alg.onchange=()=>{srv.forEach(s=>s.tot=0);lat=[];sent=0;dropped=0;draw()};
 function pick(){const up=srv.filter(s=>s.up);if(!up.length)return null;
  if(alg.value==='lc')return up.reduce((m,s)=>s.act<m.act?s:m);
  if(alg.value==='rnd')return up[Math.floor(Math.random()*up.length)];
  for(let k=0;k<srv.length;k++){const s=srv[(rr+k)%srv.length];if(s.up){rr=(rr+k+1)%srv.length;return s}}}
 function draw(){srv.forEach((s,i)=>{const el=cards[i];el.classList.toggle('down',!s.up);const m=el.querySelector('.meter i');m.style.width=Math.min(100,s.act/14*100)+'%';m.style.background=s.act>9?'var(--x)':s.act>5?'var(--w)':'var(--q)';el.querySelector('.c').textContent=s.up?`${s.act} in flight · ${s.tot} served`:'DOWN';el.querySelector('button').textContent=s.up?'Take down':'Bring up'});
  const avg=lat.length?lat.reduce((a,b)=>a+b,0)/lat.length:0;
  $('#lb-stat').innerHTML=`<span>Requests <strong>${sent}</strong></span><span>Failed (no healthy server) <strong>${dropped}</strong></span><span>Avg response, last 40 <strong>${(avg/1000).toFixed(2)} s</strong></span>`}
 const iv=setInterval(()=>{if(document.hidden)return;sent++;const s=pick();if(!s){dropped++;draw();return}
  s.act++;s.tot++;const el=cards[srv.indexOf(s)];el.classList.add('flash');const t1=setTimeout(()=>el.classList.remove('flash'),150);timers.add(t1);
  const dur=(900+Math.random()*700)*s.slow*(1+s.act*.08);
  const t2=setTimeout(()=>{timers.delete(t2);if(s.up&&s.act>0)s.act--;lat.push(dur);if(lat.length>40)lat.shift();draw()},dur);timers.add(t2);draw()},260);
 draw();return()=>{clearInterval(iv);timers.forEach(clearTimeout)}}};

LABS['consistent-hashing']={title:'Live lab: hash ring',
intro:'24 keys on a hash ring. Add or remove a node and compare how many keys move with consistent hashing and with plain hash % N.',
html:`<div class="canvas"><svg class="labsvg" id="ch-svg" viewBox="0 0 400 312" role="img" aria-label="Hash ring with nodes and keys"></svg></div><div class="row"><button type="button" id="ch-add">Add node</button><button type="button" id="ch-rem">Remove node</button><button type="button" id="ch-v">Virtual nodes: off</button></div><div class="stat" id="ch-stat"></div>`,
mount(root){const $=s=>root.querySelector(s);
 const fnv=str=>{let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0};
 const COLS=['#8c9bff','#4fc1c6','#f7e463','#ff6a4d','#c79bff','#ffa5d8','#9fe3ff','#ffc36b'];
 const keys=Array.from({length:24},(_,i)=>'user:'+(1000+i*37));
 let nodes=['N1','N2','N3'],next=4,vn=false,msg='Add or remove a node to see how many keys move.';
 const ang=k=>fnv(k)/4294967296*360;
 const points=ns=>ns.flatMap(n=>(vn?[0,1,2,3,4]:[0]).map(v=>({n,a:ang(n+'#'+v)}))).sort((a,b)=>a.a-b.a);
 const ownerRing=(k,pts)=>{const a=ang(k);return(pts.find(p=>p.a>=a)||pts[0]).n};
 const ownerMod=(k,ns)=>ns[fnv(k)%ns.length];
 const col=n=>COLS[(+n.slice(1)-1)%COLS.length];
 function draw(){const pts=points(nodes),cx=200,cy=150,r=110,Pt=(a,rr)=>[cx+rr*Math.cos((a-90)*Math.PI/180),cy+rr*Math.sin((a-90)*Math.PI/180)];
  let o=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#33427e" stroke-width="3"/>`;
  for(const k of keys){const[x,y]=Pt(ang(k),r);o+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${col(ownerRing(k,pts))}"/>`}
  for(const p of pts){const[x,y]=Pt(p.a,r),[lx,ly]=Pt(p.a,r+22);o+=`<rect x="${(x-8).toFixed(1)}" y="${(y-8).toFixed(1)}" width="16" height="16" rx="4" fill="${col(p.n)}" stroke="#0b1433" stroke-width="2"/>`;if(!vn)o+=`<text x="${lx.toFixed(1)}" y="${(ly+5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="700" fill="${col(p.n)}">${p.n}</text>`}
  const cnt={};keys.forEach(k=>{const n=ownerRing(k,pts);cnt[n]=(cnt[n]||0)+1});
  o+=`<text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="15" font-weight="700" fill="#eef1ff">${nodes.length} nodes</text><text x="${cx}" y="${cy+14}" text-anchor="middle" font-size="12.5" fill="#a7b1dc">squares = nodes, dots = keys</text>`;
  $('#ch-svg').innerHTML=o;
  $('#ch-stat').innerHTML=`<span>${esc(msg)}</span><span class="full">Keys per node: ${nodes.map(n=>`<strong>${n}: ${cnt[n]||0}</strong>`).join(' · ')}</span>`}
 function change(nn,label){const p0=points(nodes),p1=points(nn);
  const mr=keys.filter(k=>ownerRing(k,p0)!==ownerRing(k,p1)).length,mm=keys.filter(k=>ownerMod(k,nodes)!==ownerMod(k,nn)).length;
  msg=`${label}: consistent hashing moved ${mr} of 24 keys; hash % N would have moved ${mm}.`;nodes=nn;draw()}
 $('#ch-add').onclick=()=>{if(nodes.length>=8)return;const n='N'+next++;change([...nodes,n],'Added '+n)};
 $('#ch-rem').onclick=()=>{if(nodes.length<=1)return;const n=nodes[Math.floor(nodes.length/2)];change(nodes.filter(x=>x!==n),'Removed '+n)};
 const vb=$('#ch-v');vb.onclick=()=>{vn=!vn;vb.textContent='Virtual nodes: '+(vn?'on (5 per node)':'off');vb.classList.toggle('on',vn);msg=vn?'Each node now owns 5 points on the ring, so the load evens out.':'One point per node: notice how uneven the key counts can be.';draw()};
 draw();return()=>{}}};

LABS['rate-limiting']={title:'Live lab: token bucket',
intro:'Each request spends one token. Tokens refill at a steady rate, up to the bucket’s capacity. Try a burst.',
html:`<div class="row"><label>Capacity <input type="range" id="rl-cap" min="1" max="10" value="5"><strong id="rl-capv">5</strong></label><label>Refill per second <input type="range" id="rl-rate" min="1" max="10" value="2"><strong id="rl-ratev">1</strong></label></div><div class="bucket" aria-hidden="true"><i id="rl-fill"></i></div><div class="stat"><span>Tokens <strong id="rl-tok">5.0</strong></span><span>Allowed <strong id="rl-ok">0</strong></span><span>Rejected (429) <strong id="rl-no">0</strong></span></div><div class="row"><button type="button" id="rl-one">Send 1 request</button><button type="button" id="rl-burst">Burst of 10</button></div><div class="log" id="rl-log" aria-label="Recent results"></div>`,
mount(root){const $=s=>root.querySelector(s);let cap=5,rate=1,tok=5,ok=0,no=0,last=performance.now(),raf;const log=[],rates=[.5,1,1.5,2,3,4,5,6,8,10];
 function upd(){$('#rl-capv').textContent=cap;$('#rl-ratev').textContent=rate;$('#rl-tok').textContent=tok.toFixed(1);$('#rl-ok').textContent=ok;$('#rl-no').textContent=no;$('#rl-fill').style.width=(tok/cap*100)+'%';$('#rl-log').innerHTML=log.map(v=>`<i style="background:${v?'var(--ok)':'var(--x)'}" title="${v?'200 OK':'429'}"></i>`).join('')}
 function send(){if(tok>=1){tok-=1;ok++;log.push(1)}else{no++;log.push(0)}if(log.length>40)log.shift();upd()}
 $('#rl-cap').oninput=e=>{cap=+e.target.value;tok=Math.min(tok,cap);upd()};
 $('#rl-rate').oninput=e=>{rate=rates[+e.target.value-1];upd()};
 $('#rl-one').onclick=send;$('#rl-burst').onclick=()=>{for(let i=0;i<10;i++)send()};
 const tick=now=>{const dt=(now-last)/1000;last=now;tok=Math.min(cap,tok+rate*dt);$('#rl-tok').textContent=tok.toFixed(1);$('#rl-fill').style.width=(tok/cap*100)+'%';raf=requestAnimationFrame(tick)};
 upd();raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)}};

LABS['circuit-breaker']={title:'Live lab: circuit breaker',
intro:'The order service calls a payment API about twice a second. Make the API fail and watch the breaker trip, fail fast, probe and recover. It trips after 3 failures and waits 4 seconds before probing.',
html:`<div class="row"><button type="button" id="cb-tog">Payment API: healthy</button><span class="cbstate" id="cb-state">CLOSED</span></div><div class="stat"><span>Consecutive failures <strong id="cb-f">0</strong></span><span>Calls reaching the API <strong id="cb-hit">0</strong></span><span>Failed fast <strong id="cb-ff">0</strong></span></div><div class="log" id="cb-log"></div><p class="note" id="cb-msg">Calls are flowing normally.</p>`,
mount(root){const $=s=>root.querySelector(s);let healthy=true,state='CLOSED',fails=0,openUntil=0,hit=0,ff=0;const log=[];
 const SC={CLOSED:'var(--ok)',OPEN:'var(--x)','HALF-OPEN':'var(--w)'};
 function draw(m){const s=$('#cb-state');s.textContent=state;s.style.background=SC[state];$('#cb-f').textContent=fails;$('#cb-hit').textContent=hit;$('#cb-ff').textContent=ff;
  $('#cb-log').innerHTML=log.map(v=>`<i style="background:${v==='ok'?'var(--ok)':v==='fail'?'var(--x)':'var(--mut)'}" title="${v}"></i>`).join('');if(m)$('#cb-msg').textContent=m}
 $('#cb-tog').onclick=e=>{healthy=!healthy;e.target.textContent='Payment API: '+(healthy?'healthy':'failing');e.target.classList.toggle('on',!healthy);draw(healthy?'API fixed. Watch the breaker probe and close.':'API is now failing every call…')};
 const iv=setInterval(()=>{if(document.hidden)return;const now=Date.now();let r,m;
  if(state==='OPEN'){if(now<openUntil){ff++;r='fast';m=`Open: failing fast with a fallback. Probe in ${Math.ceil((openUntil-now)/1000)} s.`}else{state='HALF-OPEN';m='Half-open: sending one trial request…'}}
  if(!r){hit++;const ok=healthy;r=ok?'ok':'fail';
   if(state==='HALF-OPEN'){if(ok){state='CLOSED';fails=0;m='Trial succeeded, so the breaker is closed again.'}else{state='OPEN';openUntil=now+4000;m='Trial failed, so the breaker reopens for another 4 s.'}}
   else if(ok){fails=0;m=m||'Calls are flowing normally.'}
   else{fails++;m=`Failure ${fails} of 3…`;if(fails>=3){state='OPEN';openUntil=now+4000;m='3 failures in a row: the breaker trips OPEN.'}}}
  log.push(r);if(log.length>40)log.shift();draw(m)},550);
 draw();return()=>clearInterval(iv)}};

LABS['estimation']={title:'Calculator: size a system',
intro:'Pick a preset or type your own assumptions. Every result shows its arithmetic, so you learn the method, not just the numbers. Presets are illustrative practice assumptions, not real company figures.',
html:`<div class="row" id="est-pre" role="group" aria-label="Presets"></div>
<div class="egrid">
 <label>Daily active users<span><input type="number" id="e-dau" min="0" step="any"> million</span></label>
 <label>Requests per user per day<input type="number" id="e-rpu" min="0" step="any"></label>
 <label>Reads per write<input type="number" id="e-rw" min="0" step="any"></label>
 <label>Size per write / read<span><input type="number" id="e-sz" min="0" step="any"> KB</span></label>
 <label>Keep data for<span><input type="number" id="e-yr" min="0" step="any"> years</span></label>
 <label>Peak ÷ average traffic<input type="number" id="e-pk" min="1" step="any"></label>
</div>
<div class="tiles" id="est-out"></div><ol class="math" id="est-math"></ol>
<h3 class="sub">Numbers worth memorising</h3>
<p class="note">Rounded orders of magnitude for quick estimates. Real latencies vary a lot with hardware, region and load.</p>
<table class="stack"><thead><tr><th>Fact</th><th>Rounded value</th><th>Why it helps</th></tr></thead><tbody>
<tr><td>Seconds in a day</td><td>86,400 ≈ 10⁵</td><td>Converts “per day” into “per second”.</td></tr>
<tr><td>1 million requests per day</td><td>≈ 12 per second</td><td>Scale up: 100 M/day ≈ 1,200/s.</td></tr>
<tr><td>1 KB × 1 million</td><td>1 GB</td><td>Storage per day from writes × size.</td></tr>
<tr><td>Main memory read</td><td>~100 nanoseconds</td><td>Why caches are so fast.</td></tr>
<tr><td>SSD random read</td><td>~tens to hundreds of microseconds</td><td>Roughly 1,000× slower than memory.</td></tr>
<tr><td>Round trip inside one data centre</td><td>~0.5 milliseconds</td><td>Every extra service hop adds up.</td></tr>
<tr><td>Round trip across continents</td><td>~100–150 milliseconds</td><td>Why CDNs and regional deployments exist.</td></tr>
</tbody></table>`,
mount(root){const $=s=>root.querySelector(s);
 const PRE=[['URL shortener',{dau:10,rpu:5,rw:100,sz:.5,yr:5,pk:3}],['Chat app',{dau:50,rpu:40,rw:1,sz:.2,yr:3,pk:3}],['News feed',{dau:100,rpu:20,rw:50,sz:1,yr:5,pk:3}],['Photo sharing',{dau:30,rpu:30,rw:30,sz:300,yr:5,pk:2.5}]];
 const ids=['dau','rpu','rw','sz','yr','pk'];
 const num=n=>{const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(1)+' B':a>=1e6?(n/1e6).toFixed(1)+' M':a>=1e4?(n/1e3).toFixed(1)+' K':a>=100?Math.round(n).toLocaleString('en'):n.toFixed(1)};
 const by=b=>{const u=['B','KB','MB','GB','TB','PB','EB'];let i=0;while(b>=1000&&i<u.length-1){b/=1000;i++}return(b>=100?Math.round(b):b.toFixed(1))+' '+u[i]};
 const pre=$('#est-pre');pre.innerHTML=PRE.map(([n],i)=>`<button type="button" data-i="${i}">${n}</button>`).join('');
 const load=i=>{const v=PRE[i][1];ids.forEach(k=>$('#e-'+k).value=v[k]);pre.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('on',k===i));calc()};
 pre.querySelectorAll('button').forEach(b=>b.onclick=()=>load(+b.dataset.i));
 ids.forEach(k=>$('#e-'+k).oninput=()=>{pre.querySelectorAll('button').forEach(b=>b.classList.remove('on'));calc()});
 function calc(){const g=k=>Math.max(0,parseFloat($('#e-'+k).value)||0);
  const dau=g('dau')*1e6,rpu=g('rpu'),rw=g('rw'),sz=g('sz')*1000,yr=g('yr'),pk=Math.max(1,g('pk'));
  const day=dau*rpu,avg=day/86400,peak=avg*pk,wps=avg/(rw+1),rps=avg-wps,wday=day/(rw+1),sday=wday*sz,tot=sday*365*yr,egress=peak*(rw/(rw+1))*sz;
  const T=[['Average requests/s',num(avg)],['Peak requests/s',num(peak),1],['Writes/s (avg)',num(wps)],['Reads/s (avg)',num(rps)],['New storage per day',by(sday)],['Storage over '+yr+' yr',by(tot),1],['Peak read bandwidth',by(egress)+'/s']];
  $('#est-out').innerHTML=T.map(([l,v,k])=>`<div class="tile${k?' k':''}"><small>${l}</small><strong>${v}</strong></div>`).join('');
  $('#est-math').innerHTML=[`Requests per day = ${num(dau)} users × ${rpu} = <b>${num(day)}</b>`,`Average per second = ${num(day)} ÷ 86,400 = <b>${num(avg)}/s</b>; at ${pk}× peak = <b>${num(peak)}/s</b>`,`With ${rw} reads per write, writes are 1/${num(rw+1)} of traffic = <b>${num(wps)}/s</b>, reads = <b>${num(rps)}/s</b>`,`Storage per day = ${num(wday)} writes × ${by(sz)} = <b>${by(sday)}</b>; × 365 × ${yr} years = <b>${by(tot)}</b> (before replication, usually ×3)`,`Peak read bandwidth = ${num(peak*(rw/(rw+1)))} reads/s × ${by(sz)} = <b>${by(egress)}/s</b>`].map(x=>`<li>${x}</li>`).join('')}
 load(0);return()=>{}}};
