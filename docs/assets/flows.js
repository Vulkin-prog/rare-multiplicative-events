'use strict';
(() => {
  const R=window.ResearchMath,$=id=>document.getElementById(id),fmt=(n,d=4)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d}),small=n=>n===0?'0':Math.abs(n)<.0001?n.toExponential(3):fmt(n,6);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ink='var(--ink)',muted='var(--muted)',blue='var(--positive)',orange='var(--negative)',grid='var(--chart-grid)';
  function chart(id,{xmin=0,xmax=1,ymin=0,ymax=1,xticks=[0,.25,.5,.75,1],yticks=[0,.5,1],xlabel='',ylabel='',title='',description='',height=290}){
    const W=Math.max(280,$(id).clientWidth||640),H=height,m={l:53,r:17,t:28,b:55},x=v=>m.l+(v-xmin)/(xmax-xmin)*(W-m.l-m.r),y=v=>H-m.b-(v-ymin)/(ymax-ymin)*(H-m.t-m.b);
    let content=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc>`;
    for(const v of yticks){content+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}" stroke="${grid}"/><text x="${m.l-10}" y="${y(v)+4}" text-anchor="end" font-size="12">${escape(fmt(v,3))}</text>`;}
    for(const v of xticks)content+=`<text x="${x(v)}" y="${H-m.b+23}" text-anchor="middle" font-size="12">${escape(fmt(v,2))}</text>`;
    content+=`<text x="${m.l}" y="15" font-size="12">${escape(ylabel)}</text><text x="${(m.l+W-m.r)/2}" y="${H-8}" text-anchor="middle" font-size="12">${escape(xlabel)}</text>`;
    return {W,H,x,y,parts:[content],finish(){ $(id).innerHTML=this.parts.join('')+'</svg>';}};
  }
  const line=(x1,y1,x2,y2,color,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;
  const curve=(c,values,color=blue,extra='')=>`<path d="${values.map(([x,y],i)=>(i?'L':'M')+c.x(x).toFixed(3)+','+c.y(y).toFixed(3)).join(' ')}" fill="none" stroke="${color}" stroke-width="2" ${extra}/>`;

  const kPoints=Array.from({length:201},(_,i)=>[i/200,R.leadershipVariance(i/200)]);
  function renderK(){const theta=+$('k-phase').value/1000,value=R.leadershipVariance(theta),dev=value-R.leadershipMean;
    $('k-phase-value').value=theta.toFixed(3);$('k-value').textContent=value.toFixed(12);$('k-fraction').textContent=(value/4).toFixed(12);$('k-deviation').textContent=(dev>=0?'+':'−')+Math.abs(dev).toExponential(6);
    $('k-interpretation').textContent='Positive leadership remains broadly dispersed: its limiting standard deviation is '+fmt(50*Math.sqrt(value),2)+' percentage points. The magnified ripple describes only the much smaller dependence on phase.';
    const description=`At theta=${theta.toFixed(3)}, signed occupation variance K=${value.toFixed(12)}. Positive fraction variance=${(value/4).toFixed(12)}. The phase deviation is ${dev.toExponential(6)}.`;
    const a=chart('k-absolute',{xlabel:'Phase θ',ylabel:'K(θ)',title:'Leadership variance on its absolute scale',description});
    a.parts.push(line(a.x(0),a.y(R.leadershipMean),a.x(1),a.y(R.leadershipMean),muted,'stroke-dasharray="4 4"'),curve(a,kPoints),line(a.x(theta),a.y(0),a.x(theta),a.y(value),grid,'stroke-dasharray="3 4"'),`<circle cx="${a.x(theta)}" cy="${a.y(value)}" r="4" fill="${orange}"/>`);a.finish();
    const z=chart('k-detail',{ymin:-4,ymax:4,yticks:[-4,-2,0,2,4],xlabel:'Phase θ',ylabel:'10⁷ × (K − mean)',title:'Explicitly amplified phase modulation',description:description+' This panel multiplies the difference from the mean by ten million.'});
    z.parts.push(curve(z,kPoints.map(([t,k])=>[t,1e7*(k-R.leadershipMean)])),line(z.x(theta),z.y(-4),z.x(theta),z.y(4),grid,'stroke-dasharray="3 4"'),`<circle cx="${z.x(theta)}" cy="${z.y(1e7*dev)}" r="4" fill="${orange}"/>`);z.finish();
  }
  $('k-phase').addEventListener('input',renderK);

  const downloadURLs=[];
  function downloadCSV(filename,rows){
    const field=v=>typeof v==='number'?String(v):'"'+String(v??'').replace(/"/g,'""')+'"';
    const csv=rows.map(row=>row.map(field).join(',')).join('\r\n')+'\r\n';
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));downloadURLs.push(url);
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    $('download-status').textContent='Prepared '+filename+' for download.';
  }
  window.addEventListener('pagehide',()=>{for(const url of downloadURLs)URL.revokeObjectURL(url);});
  $('k-export').addEventListener('click',()=>downloadCSV('leadership_variance_phase_curve.csv',[
    ['source','theta','K_signed_variance','K_positive_fraction_variance','phase_mean','deviation','displayed_deviation_times_1e7'],
    ...kPoints.map(([theta,K])=>['LPF V2 equation 6.3; Poisson target',theta,K,K/4,R.leadershipMean,K-R.leadershipMean,1e7*(K-R.leadershipMean)])
  ]));
  const notation=$('notation-dialog');let notationOpener=null;
  function closeNotation(){if(typeof notation.close==='function')notation.close();else notation.removeAttribute('open');notationOpener?.focus();}
  $('notation-open').addEventListener('click',e=>{notationOpener=e.currentTarget;if(typeof notation.showModal==='function')notation.showModal();else notation.setAttribute('open','');$('notation-close').focus();});
  $('notation-close').addEventListener('click',closeNotation);
  notation.addEventListener('cancel',e=>{e.preventDefault();closeNotation();});


  let flow=null,flowTimer=null;
  const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function pauseFlow(){clearInterval(flowTimer);flowTimer=null;$('flow-play').textContent='Play';$('flow-play').setAttribute('aria-pressed','false');}
  function resetFlow(){
    pauseFlow();const seed=Number($('flow-seed').value);
    if($('flow-seed').value.trim()===''||!Number.isInteger(seed)||seed<0||seed>4294967295){$('flow-error').textContent='Choose an integer seed between 0 and 4,294,967,295.';$('flow-seed').setAttribute('aria-invalid','true');return;}
    $('flow-error').textContent='';$('flow-seed').removeAttribute('aria-invalid');flow=window.ResearchFlows.cloud(+$('flow-mean').value,seed);renderFlow();
  }
  function renderFlow(){
    if(!flow)return;const t=+$('flow-time').value/100,r=flow.at(t);
    $('flow-time-value').value=t.toFixed(2);
    const p=chart('flow-cloud',{xmax:1,ymax:flow.height,xticks:[0,.25,.5,.75,1],yticks:[0,flow.height/2,flow.height],xlabel:'u · position / terminal size',ylabel:'z · transformed length',title:'One Poisson cloud with two observation rectangles',description:`At ${t.toFixed(2)} doublings, the prefix has ${r.fixed} points and the scale rectangle has ${r.scale}. The same ${flow.points.length} points are retained throughout.`,height:360});
    p.parts.push(`<rect x="${p.x(0)}" y="${p.y(flow.height)}" width="${p.x(r.width)-p.x(0)}" height="${p.y(0)-p.y(flow.height)}" fill="${blue}" fill-opacity=".05" stroke="${blue}" stroke-width="2"/>`);
    p.parts.push(`<rect x="${p.x(0)}" y="${p.y(r.ceiling)}" width="${p.x(r.width)-p.x(0)}" height="${p.y(0)-p.y(r.ceiling)}" fill="${orange}" fill-opacity=".1" stroke="${orange}" stroke-width="2" stroke-dasharray="6 4"/>`);
    for(const [i,point] of flow.points.entries()){const prefix=point.u<=r.width,scale=prefix&&point.z<r.ceiling,color=scale?orange:prefix?blue:muted;
      p.parts.push(`<circle cx="${p.x(point.u)}" cy="${p.y(point.z)}" r="${scale?3.4:2.6}" fill="${color}" opacity="${prefix?1:.3}"><title>Point ${i+1}: u=${fmt(point.u,4)}, z=${fmt(point.z,4)}; ${scale?'inside scale and prefix':prefix?'prefix only':'outside both'}</title></circle>`);
    }
    p.finish();
    $('flow-fixed-count').textContent=String(r.fixed);$('flow-scale-count').textContent=String(r.scale);$('flow-fixed-mean').textContent='Exact mean '+fmt(r.meanFixed,3);$('flow-scale-mean').textContent='Exact mean '+fmt(r.meanScale,3);
    $('flow-reading').textContent=`Prefix width ${fmt(r.width,3)}. Scale height ${fmt(r.ceiling,3)}. Scale area ${flow.c} throughout. Seed ${flow.seed}; ${flow.points.length} points in the full domain.`;
    for(const kind of ['fixed','scale']){
      const rows=flow.path(kind),max=Math.max(kind==='fixed'?flow.height:flow.c,...rows.map(r=>r[1])),ymax=Math.max(4,Math.ceil(max/4)*4);
      const c=chart('flow-'+kind+'-path',{xmax:3,ymax,xticks:[0,1,2,3],yticks:[0,ymax/2,ymax],xlabel:'t · doublings',ylabel:'Point count',height:250,title:kind==='fixed'?'Growing prefix count':'Stationary scale count',description:kind==='fixed'?`At t=${t.toFixed(2)}, ${r.fixed} points, exact mean ${fmt(r.meanFixed)}. Births only.`:`At t=${t.toFixed(2)}, ${r.scale} points, exact mean ${flow.c}. Immigration and death.`});
      c.parts.push(curve(c,rows,kind==='fixed'?blue:orange),curve(c,Array.from({length:61},(_,i)=>{const t=i/20;return [t,kind==='fixed'?flow.c*2**t:flow.c];}),muted,'stroke-dasharray="5 4"'),line(c.x(t),c.y(0),c.x(t),c.y(ymax),grid,'stroke-dasharray="3 4"'),`<circle cx="${c.x(t)}" cy="${c.y(r[kind])}" r="4" fill="${kind==='fixed'?blue:orange}"/>`);c.finish();
    }
  }
  $('flow-resample').addEventListener('click',resetFlow);
  $('flow-next').addEventListener('click',()=>{const seed=Number($('flow-seed').value);$('flow-seed').value=String(((Number.isInteger(seed)?seed:20260909)+1)>>>0);resetFlow();});
  $('flow-mean').addEventListener('change',resetFlow);
  $('flow-seed').addEventListener('change',resetFlow);
  $('flow-time').addEventListener('input',()=>{pauseFlow();renderFlow();});
  $('flow-play').addEventListener('click',()=>{if(flowTimer){pauseFlow();return;}if(!flow)return;if(+$('flow-time').value>=300)$('flow-time').value='0';$('flow-play').textContent='Pause';$('flow-play').setAttribute('aria-pressed','true');const reduced=reduceMotion();flowTimer=setInterval(()=>{$('flow-time').value=String(Math.min(300,+$('flow-time').value+(reduced?25:5)));renderFlow();if(+$('flow-time').value>=300)pauseFlow();},reduced?500:100);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseFlow();});window.addEventListener('pagehide',pauseFlow);
  function revealAnchor(){const target=document.getElementById(location.hash?.slice(1));if(!target)return;for(let p=target;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}
  document.querySelectorAll('a[href="#assumptions"]').forEach(a=>a.addEventListener('click',()=>{$('assumptions').open=true;}));
  window.addEventListener('hashchange',revealAnchor);
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{renderFlow();renderK();},100);});
  if('IntersectionObserver' in window){const links=[...document.querySelectorAll('.research-nav a')],observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)links.forEach(a=>{if(a.getAttribute('href')==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-5% 0px -75% 0px'});for(const a of links){const target=document.querySelector(a.getAttribute('href'));if(target)observer.observe(target);}}
  resetFlow();renderK();revealAnchor();

})();
