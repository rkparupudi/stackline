const C={q:'#8c9bff',ok:'#4fc1c6',w:'#f7e463',x:'#ff6a4d'};
const ST={ok:['#131d45','#3a4a8c'],down:['#3a1420','#e8452c'],hot:['#3a3412','#f7e463'],lead:['#0f3a40','#4fc1c6'],cut:['#e8452c','#e8452c']};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P=(p,b,c='q',t='',hop)=>({p:p.split(' '),b,c,t,hop});
const ring=(a)=>{const r=a*Math.PI/180;return[360+140*Math.cos(r),190+140*Math.sin(r)]};
const arc=(a1,a2)=>{const[x1,y1]=ring(a1),[x2,y2]=ring(a2);return`M${x1.toFixed(1)} ${y1.toFixed(1)} A140 140 0 ${a2-a1>180?1:0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`};
const rp=a=>ring(a).map(v=>Math.round(v));

/* Scale every time in a scene by k (k>1 = slower). */
function scaleScene(s,k){
  if(k===1)return s;
  const m=v=>v*k;
  return {...s,L:m(s.L),hop:(s.hop||.6)*k,
    pk:(s.pk||[]).map(p=>({...p,b:m(p.b),hop:p.hop?m(p.hop):undefined,dur:p.dur?m(p.dur):undefined})),
    st:Object.fromEntries(Object.entries(s.st||{}).map(([id,l])=>[id,l.map(([t,v])=>[m(t),v])])),
    cuts:Object.fromEntries(Object.entries(s.cuts||{}).map(([id,l])=>[id,l.map(([t,v])=>[m(t),v])])),
    fl:(s.fl||[]).map(([x,y,t,a,b,c])=>[x,y,t,m(a),m(b),c]),
    steps:s.steps.map(([t,x])=>[m(t),x])};
}
function build(s){
  const L=s.L, hop=s.hop||.6, N={};
  const kt=v=>Math.min(Math.max(v/L,0),1).toFixed(4);
  for(const n of s.nodes){const[id,x,y,l,sub='',shape='']=n;N[id]={id,x,y,l,sub,shape,w:Math.max(92,l.length*9.2+28,sub.length*7+26),h:sub?58:46}}
  const disc=(attr,list,init)=>{let a=[...list];if(!a.length||a[0][0]>0)a.unshift([0,init]);return`<animate attributeName="${attr}" dur="${L}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${a.map(v=>kt(v[0])).join(';')}" values="${a.map(v=>v[1]).join(';')}"/>`};
  const vis=(t0,t1)=>{if(t0<=0&&t1>=L)return'';if(t0<=0)return`<animate attributeName="opacity" dur="${L}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${kt(t1)}" values="1;0"/>`;if(t1>=L)return`<animate attributeName="opacity" dur="${L}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${kt(t0)}" values="0;1"/>`;return`<animate attributeName="opacity" dur="${L}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${kt(t0)};${kt(t1)}" values="0;1;0"/>`};
  let o=`<svg viewBox="0 0 720 380" role="img" aria-label="${esc(s.t)} animation"><defs><filter id="gl-${s.id}" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  o+=s.extra||'';
  for(const[a,b]of s.edges){const A=N[a],B=N[b],k=a+'-'+b,cut=(s.cuts||{})[k];
    o+=`<line class="edge" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}">${cut?disc('stroke',cut.map(([t,v])=>[t,v==='cut'?'#e8452c':'#33427e']),'#33427e'):''}</line>`}
  for(const p of s.pk||[]){
    let d,times,pts;
    if(p.d){d=p.d;const e=p.b+p.dur;times=[0,p.b,e,L];pts=[0,0,1,1]}
    else{const v=p.p.map(id=>[N[id].x,N[id].y]);d='M'+v.map(q=>q.join(' ')).join(' L');let cum=[0];for(let i=1;i<v.length;i++)cum.push(cum[i-1]+Math.hypot(v[i][0]-v[i-1][0],v[i][1]-v[i-1][1]));const tot=cum[cum.length-1]||1,h=p.hop||hop;times=[0,p.b];pts=[0,0];cum.forEach((c,i)=>{if(i){times.push(p.b+i*h);pts.push(c/tot)}});times.push(L);pts.push(1)}
    const e=times[times.length-2],col=C[p.c]||C.q;
    o+=`<g opacity="0"><circle r="11" fill="${col}" opacity=".45" filter="url(#gl-${s.id})"/><circle r="6.5" fill="${col}"/>${p.t?`<text y="-14" text-anchor="middle" font-size="12.5" font-weight="700" fill="${col}">${esc(p.t)}</text>`:''}<animateMotion dur="${L}s" repeatCount="indefinite" calcMode="linear" path="${d}" keyTimes="${times.map(kt).join(';')}" keyPoints="${pts.map(v=>v.toFixed(4)).join(';')}"/>${vis(p.b,e)}</g>`}
  for(const n of Object.values(N)){
    const{x,y,w,h,l,sub,shape}=n,st=(s.st||{})[n.id],first=st&&st[0][0]===0?st[0][1]:'ok';
    const anim=st?disc('fill',st.map(([t,v])=>[t,ST[v][0]]),ST.ok[0])+disc('stroke',st.map(([t,v])=>[t,ST[v][1]]),ST.ok[1]):'';
    let body;
    if(shape==='db'){const t=y-h/2;body=`<path d="M${x-w/2} ${t+8} v${h-12} a${w/2} 8 0 0 0 ${w} 0 v${-(h-12)}"/><ellipse cx="${x}" cy="${t+8}" rx="${w/2}" ry="8"/>`}
    else body=`<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="12"/>`;
    const ly=sub?y-2:y+5.5,dy=shape==='db'?4:0;
    o+=`<g fill="${ST[first][0]}" stroke="${ST[first][1]}" stroke-width="2">${anim}${body}</g><text x="${x}" y="${ly+dy}" text-anchor="middle" font-size="16" font-weight="700" fill="#eef1ff">${esc(l)}</text>${sub?`<text x="${x}" y="${y+17+dy}" text-anchor="middle" font-size="12.5" fill="#a7b1dc">${esc(sub)}</text>`:''}`}
  for(const[x,y,t,t0,t1,c]of s.fl||[]){const w=t.length*7.6+20;
    o+=`<g opacity="${t0<=0?1:0}"><rect x="${x-w/2}" y="${y-13}" width="${w}" height="26" rx="13" fill="${C[c]}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#0b1433">${esc(t)}</text>${vis(t0,t1)}</g>`}
  return o+'</svg>'}
