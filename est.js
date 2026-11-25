if(document.getElementById('est-pre')){
const PRE=[['URL shortener',{dau:10,rpu:5,rw:100,sz:.5,yr:5,pk:3}],['Chat app',{dau:50,rpu:40,rw:1,sz:.2,yr:3,pk:3}],['News feed',{dau:100,rpu:20,rw:50,sz:1,yr:5,pk:3}],['Photo sharing',{dau:30,rpu:30,rw:30,sz:300,yr:5,pk:2.5}]];
const ids=['dau','rpu','rw','sz','yr','pk'],$=id=>document.getElementById(id);
const num=n=>{const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(1)+' B':a>=1e6?(n/1e6).toFixed(1)+' M':a>=1e4?(n/1e3).toFixed(1)+' K':a>=100?Math.round(n).toLocaleString('en'):n.toFixed(1)};
const by=b=>{const u=['B','KB','MB','GB','TB','PB','EB'];let i=0;while(b>=1000&&i<u.length-1){b/=1000;i++}return(b>=100?Math.round(b):b.toFixed(1))+' '+u[i]};
const pre=$('est-pre');
pre.innerHTML=PRE.map(([n],i)=>`<button type="button" data-i="${i}">${n}</button>`).join('');
const load=i=>{const v=PRE[i][1];ids.forEach(k=>$('e-'+k).value=v[k]);pre.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('on',k===i));calc()};
pre.querySelectorAll('button').forEach(b=>b.onclick=()=>load(+b.dataset.i));
ids.forEach(k=>$('e-'+k).oninput=()=>{pre.querySelectorAll('button').forEach(b=>b.classList.remove('on'));calc()});
function calc(){const g=k=>Math.max(0,parseFloat($('e-'+k).value)||0);
  const dau=g('dau')*1e6,rpu=g('rpu'),rw=g('rw'),sz=g('sz')*1000,yr=g('yr'),pk=Math.max(1,g('pk'));
  const day=dau*rpu,avg=day/86400,peak=avg*pk,wps=avg/(rw+1),rps=avg-wps,wday=day/(rw+1),sday=wday*sz,tot=sday*365*yr,egress=peak*(rw/(rw+1))*sz;
  const T=[['Average requests/s',num(avg)],['Peak requests/s',num(peak),1],['Writes/s (avg)',num(wps)],['Reads/s (avg)',num(rps)],['New storage per day',by(sday)],['Storage over '+g('yr')+' yr',by(tot),1],['Peak read bandwidth',by(egress)+'/s']];
  $('est-out').innerHTML=T.map(([l,v,k])=>`<div class="tile${k?' k':''}"><small>${l}</small><strong>${v}</strong></div>`).join('');
  $('est-math').innerHTML=[
   `Requests per day = ${num(dau)} users × ${rpu} = <b>${num(day)}</b>`,
   `Average per second = ${num(day)} ÷ 86,400 = <b>${num(avg)}/s</b>; at ${pk}× peak = <b>${num(peak)}/s</b>`,
   `With ${rw} reads per write, writes are 1/${num(rw+1)} of traffic = <b>${num(wps)}/s</b>, reads = <b>${num(rps)}/s</b>`,
   `Storage per day = ${num(wday)} writes × ${by(sz)} = <b>${by(sday)}</b>; × 365 × ${yr} years = <b>${by(tot)}</b> (before replication, usually ×3)`,
   `Peak read bandwidth = ${num(peak*(rw/(rw+1)))} reads/s × ${by(sz)} = <b>${by(egress)}/s</b>, a hint that you need a cache or CDN`].map(x=>`<li>${x}</li>`).join('')}
load(0);
}
