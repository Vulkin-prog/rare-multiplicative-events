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

  let mc=null,mcTimer=null,mcRunning=false,mcGeneration=0;
  function mcReset(){mc=R.crossoverSetup(+$('mc-length').value,Number($('mc-seed').value)>>>0);$('mc-status').textContent='The reference curve is ready. Run the sampler to add empirical estimates.';$('mc-progress').max=+$('mc-trials').value;$('mc-progress').value=0;mcControls(false);renderMC();}
  function renderMC(){
    const rows=mc.results(),middle=rows.reduce((a,b)=>Math.abs(b.s)<Math.abs(a.s)?b:a),has=mc.trials>0;
    const c=chart('mc-chart',{xmin:-2.05,xmax:2.05,xticks:[-2,-1,0,1,2],yticks:[0,.25,.5,.75,1],xlabel:'s = L − log₂ M − π(L)',ylabel:'Conditional initial-run weight',height:335,title:'Boundary crossover: finite arithmetic samples and logistic reference',description:has?`${mc.trials} conditional trials at L=${mc.L}. At s=0: estimate ${fmt(middle.estimate)}, pointwise interval ${fmt(middle.low)} to ${fmt(middle.high)}. Curve points share the same trials.`:'Logistic reference only. No Monte Carlo estimates have been generated.'});
    c.parts.push(curve(c,Array.from({length:161},(_,i)=>{const s=-2+i/40;return [s,1/(1+2**(-s))];})));
    if(has)for(const row of rows){const px=c.x(row.s),py=c.y(row.estimate);c.parts.push(line(px,c.y(row.low),px,c.y(row.high),orange),line(px-3,c.y(row.low),px+3,c.y(row.low),orange),line(px-3,c.y(row.high),px+3,c.y(row.high),orange),`<circle cx="${px}" cy="${py}" r="4" fill="${orange}" tabindex="0"><title>M=${row.M}, s=${fmt(row.s)}; estimate ${fmt(row.estimate)}, 95% interval [${fmt(row.low)}, ${fmt(row.high)}]; ${row.k}/${row.n} complement hits</title></circle>`);}
    c.finish();$('mc-alpha').textContent=small(mc.alpha)+' · π(L) = '+mc.count;$('mc-weight').textContent=has?fmt(middle.estimate)+' [ '+fmt(middle.low,3)+', '+fmt(middle.high,3)+' ]':'Awaiting samples';$('mc-hits').textContent=has?fmt(middle.k)+' / '+fmt(mc.trials):'M = '+fmt(middle.M);
    $('mc-table').innerHTML=rows.map(r=>`<tr><td>${fmt(r.M)}</td><td>${fmt(r.s,2)}</td><td>${small(r.lambda)}</td><td>${has?r.k+' / '+r.n:'—'}</td><td>${has?fmt(r.estimate):'—'}</td><td>${has?fmt(r.low)+' – '+fmt(r.high):'—'}</td><td>${has?fmt(r.estimate-r.theory):'—'}</td></tr>`).join('');
  }
  function mcControls(running){for(const id of ['mc-run','mc-length','mc-trials','mc-seed'])$(id).disabled=running;$('mc-stop').hidden=!running;$('mc-add').disabled=running||!mc?.trials;$('mc-export').disabled=running||!mc?.trials;$('mc-add').textContent='Add '+fmt(+$('mc-trials').value)+' trials';}
  function stopMC(reason='Stopped'){if(!mcRunning)return;mcRunning=false;mcGeneration++;clearTimeout(mcTimer);mcTimer=null;mcControls(false);$('mc-progress').value=mc.trials;renderMC();$('mc-status').textContent=reason+' after '+fmt(mc.trials)+' conditional trials. The partial estimates remain available.';}
  function runMC(append=false){
    const seed=Number($('mc-seed').value);if($('mc-seed').value.trim()===''||!Number.isInteger(seed)||seed<0||seed>4294967295){$('mc-status').textContent='Choose an integer seed between 0 and 4,294,967,295.';$('mc-seed').focus();return;}
    if(!append)mc=R.crossoverSetup(+$('mc-length').value,seed);const target=mc.trials+(+$('mc-trials').value),token=++mcGeneration;$('mc-progress').max=target;$('mc-progress').value=mc.trials;mcRunning=true;mcControls(true);renderMC();let lastRender=0;
    $('mc-status').textContent='Sampling the multiplicative model…';
    function batch(){if(!mcRunning||token!==mcGeneration)return;const deadline=performance.now()+12;do{mc.trial();}while(mc.trials<target&&performance.now()<deadline);const now=performance.now();
      if(now-lastRender>350||mc.trials===target){$('mc-progress').value=mc.trials;renderMC();$('mc-status').textContent=fmt(mc.trials)+' / '+fmt(target)+' conditional trials · L = '+mc.L+' · seed '+mc.seed;lastRender=now;}
      if(mc.trials>=target){mcRunning=false;mcTimer=null;mcControls(false);$('mc-status').textContent='Complete: '+fmt(target)+' conditional trials · L = '+mc.L+' · seed '+mc.seed+'. Pointwise intervals are shown.';return;}
      mcTimer=setTimeout(batch,0);
    }
    mcTimer=setTimeout(batch,0);
  }
  $('mc-run').addEventListener('click',()=>runMC(false));
  $('mc-add').addEventListener('click',()=>runMC(true));
  $('mc-stop').addEventListener('click',()=>stopMC());
  for(const id of ['mc-length','mc-seed'])$(id).addEventListener('change',mcReset);
  $('mc-trials').addEventListener('change',()=>mcControls(mcRunning));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMC('Paused when the page became hidden');});
  window.addEventListener('pagehide',()=>stopMC());

  const kPoints=Array.from({length:201},(_,i)=>[i/200,R.leadershipVariance(i/200)]);
  function renderK(){if(!$('k-phase'))return;const theta=+$('k-phase').value/1000,value=R.leadershipVariance(theta),dev=value-R.leadershipMean;
    $('k-phase-value').value=theta.toFixed(3);$('k-value').textContent=value.toFixed(12);$('k-fraction').textContent=(value/4).toFixed(12);$('k-deviation').textContent=(dev>=0?'+':'−')+Math.abs(dev).toExponential(6);
    $('k-interpretation').textContent='Positive leadership remains broadly dispersed: its limiting standard deviation is '+fmt(50*Math.sqrt(value),2)+' percentage points. The magnified ripple describes only the much smaller dependence on phase.';
    const description=`At theta=${theta.toFixed(3)}, signed occupation variance K=${value.toFixed(12)}. Positive fraction variance=${(value/4).toFixed(12)}. The phase deviation is ${dev.toExponential(6)}.`;
    const a=chart('k-absolute',{xlabel:'Phase θ',ylabel:'K(θ)',title:'Leadership variance on its absolute scale',description});
    a.parts.push(line(a.x(0),a.y(R.leadershipMean),a.x(1),a.y(R.leadershipMean),muted,'stroke-dasharray="4 4"'),curve(a,kPoints),line(a.x(theta),a.y(0),a.x(theta),a.y(value),grid,'stroke-dasharray="3 4"'),`<circle cx="${a.x(theta)}" cy="${a.y(value)}" r="4" fill="${orange}"/>`);a.finish();
    const z=chart('k-detail',{ymin:-4,ymax:4,yticks:[-4,-2,0,2,4],xlabel:'Phase θ',ylabel:'10⁷ × (K − mean)',title:'Explicitly amplified phase modulation',description:description+' This panel multiplies the difference from the mean by ten million.'});
    z.parts.push(curve(z,kPoints.map(([t,k])=>[t,1e7*(k-R.leadershipMean)])),line(z.x(theta),z.y(-4),z.x(theta),z.y(4),grid,'stroke-dasharray="3 4"'),`<circle cx="${z.x(theta)}" cy="${z.y(1e7*dev)}" r="4" fill="${orange}"/>`);z.finish();
  }
  $('k-phase')?.addEventListener('input',renderK);

  const presets={marker:'--+-+\n--+++',runs:'-++++\n+----',constant:'+++++\n-----',asymmetric:'++-\n+-+'};
  let dictionary=null,pair=[0,0],dictionaryTimer;
  function renderDictionary(){
    if(!dictionary)return;$('dictionary-export').disabled=false;const d=+$('matrix-shift').value,weighted=$('matrix-mode').value==='weighted',matrix=weighted?dictionary.A:dictionary.H[d];
    $('matrix-shift-value').value=String(d);$('dictionary-size').textContent=dictionary.m+' words · '+dictionary.B+' letters';$('dictionary-omega').textContent=small(dictionary.omega);$('dictionary-pairs').textContent=String(dictionary.H[d].flat().reduce((a,b)=>a+b,0));
    $('dictionary-shift-reading').textContent='Selected shift d = '+d+' contributes '+small(dictionary.shiftWeight[d])+' to Ω = '+small(dictionary.omega)+(dictionary.omega?' ('+fmt(100*dictionary.shiftWeight[d]/dictionary.omega,1)+'% of the total).':'.');
    $('dictionary-matrix').innerHTML='<caption class="visually-hidden">'+(weighted?'Weighted directed overlap matrix A':'Binary incidence matrix for shift '+d)+'</caption><thead><tr><th scope="col">Earlier ↓ / later →</th>'+dictionary.words.map((w,j)=>'<th scope="col" title="'+escape(w)+'">w'+(j+1)+'</th>').join('')+'</tr></thead><tbody>'+matrix.map((row,i)=>'<tr><th scope="row" title="'+escape(dictionary.words[i])+'">w'+(i+1)+'</th>'+row.map((v,j)=>'<td class="'+(v?'nonzero ':'')+(pair[0]===i&&pair[1]===j?'selected':'')+'"><button type="button" tabindex="'+(pair[0]===i&&pair[1]===j?'0':'-1')+'" data-pair="'+i+','+j+'" aria-label="Earlier word '+(i+1)+', later word '+(j+1)+', value '+v+'">'+small(v)+'</button></td>').join('')+'</tr>').join('')+'</tbody>';
    $('dictionary-conclusion').textContent=dictionary.omega===0?'Ω = 0 exactly: this finite dictionary has no proper suffix–prefix overlaps, including self-overlaps. The arithmetic Poisson approximation still requires the theorem’s scaling hypotheses.':'This is a finite overlap diagnostic. Poisson convergence requires Ω(Wₙ) → 0 along a dictionary sequence, together with the length and size hypotheses of Theorem 1.3.';
    renderPair();
  }
  function renderPair(){if(!dictionary)return;const [i,j]=pair,w=dictionary.words[i],v=dictionary.words[j],d=+$('matrix-shift').value,shifts=[];for(let k=1;k<dictionary.B;k++)if(dictionary.H[k][i][j])shifts.push(k);
    const fits=dictionary.H[d][i][j]===1;
    $('incidence-reading').innerHTML='<strong>w'+(i+1)+' → w'+(j+1)+'</strong>: <span class="word-code">'+escape(w)+' → '+escape(v)+'</span><br>At d = '+d+': suffix <span class="word-code">'+escape(w.slice(d))+'</span> '+(fits?'matches':'does not match')+' prefix <span class="word-code">'+escape(v.slice(0,dictionary.B-d))+'</span>. Matching shifts: '+(shifts.length?shifts.join(', '):'none')+'. Weighted entry A = '+small(dictionary.A[i][j])+'.';
  }
  function updateDictionary(){clearTimeout(dictionaryTimer);try{dictionary=R.overlap(R.parseDictionary($('dictionary-words').value));pair=[Math.min(pair[0],dictionary.m-1),Math.min(pair[1],dictionary.m-1)];$('dictionary-error').textContent='';$('dictionary-words').removeAttribute('aria-invalid');$('matrix-shift').max=String(dictionary.B-1);$('matrix-shift').value=String(Math.min(+$('matrix-shift').value,dictionary.B-1));renderDictionary();}catch(e){dictionary=null;$('dictionary-shift-reading').textContent='Correct the dictionary to inspect its shift contributions.';$('dictionary-export').disabled=true;$('dictionary-error').textContent=e.message;$('dictionary-words').setAttribute('aria-invalid','true');$('dictionary-matrix').innerHTML='';$('incidence-reading').textContent='Correct the dictionary to compute its incidence matrix.';for(const id of ['dictionary-size','dictionary-omega','dictionary-pairs'])$(id).textContent='—';$('dictionary-conclusion').textContent='';}}
  $('dictionary-words').addEventListener('input',()=>{$('dictionary-export').disabled=true;clearTimeout(dictionaryTimer);dictionaryTimer=setTimeout(updateDictionary,120);});
  document.querySelectorAll('[data-dictionary]').forEach(b=>b.addEventListener('click',()=>{$('dictionary-words').value=presets[b.dataset.dictionary];pair=[0,0];updateDictionary();}));
  $('matrix-mode').addEventListener('change',renderDictionary);$('matrix-shift').addEventListener('input',renderDictionary);
  $('dictionary-matrix').addEventListener('click',e=>{const b=e.target.closest('[data-pair]');if(!b)return;pair=b.dataset.pair.split(',').map(Number);renderDictionary();$('dictionary-matrix').querySelector('[data-pair="'+pair.join(',')+'"]').focus({preventScroll:true});});

  $('dictionary-matrix').addEventListener('keydown',e=>{
    const b=e.target.closest('[data-pair]');if(!b||!dictionary)return;
    let [i,j]=b.dataset.pair.split(',').map(Number);const n=dictionary.m;
    if(e.key==='ArrowRight')j=Math.min(n-1,j+1);else if(e.key==='ArrowLeft')j=Math.max(0,j-1);
    else if(e.key==='ArrowDown')i=Math.min(n-1,i+1);else if(e.key==='ArrowUp')i=Math.max(0,i-1);
    else if(e.key==='Home')j=0;else if(e.key==='End')j=n-1;else return;
    e.preventDefault();pair=[i,j];renderDictionary();$('dictionary-matrix').querySelector('[data-pair="'+pair.join(',')+'"]').focus({preventScroll:true});
  });

  const downloadURLs=[];
  function downloadCSV(filename,rows){
    const field=v=>typeof v==='number'?String(v):'"'+String(v??'').replace(/"/g,'""')+'"';
    const csv=rows.map(row=>row.map(field).join(',')).join('\r\n')+'\r\n';
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));downloadURLs.push(url);
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    $('download-status').textContent='Prepared '+filename+' for download.';
  }
  window.addEventListener('pagehide',()=>{for(const url of downloadURLs)URL.revokeObjectURL(url);});
  $('mc-export').addEventListener('click',()=>{if(!mc?.trials||mcRunning)return;downloadCSV('crossover_L'+mc.L+'_seed'+mc.seed+'_'+mc.trials+'_trials.csv',[
    ['source','L','seed','conditional_trials','M','s','alpha_exact','lambda_reference','complement_hits','initial_weight_estimate','wilson95_lower','wilson95_upper','logistic_reference','estimate_minus_reference','interval_scope'],
    ...mc.results().map(r=>['Long runs V3; conditional arithmetic Monte Carlo',mc.L,mc.seed,r.n,r.M,r.s,r.alpha,r.lambda,r.k,r.estimate,r.low,r.high,r.theory,r.estimate-r.theory,'pointwise sampling uncertainty; shared trials'])
  ]);});
  $('k-export')?.addEventListener('click',()=>downloadCSV('leadership_variance_phase_curve.csv',[
    ['source','theta','K_signed_variance','K_positive_fraction_variance','phase_mean','deviation','displayed_deviation_times_1e7'],
    ...kPoints.map(([theta,K])=>['Records and scale flows V2 equation 6.3; Poisson target',theta,K,K/4,R.leadershipMean,K-R.leadershipMean,1e7*(K-R.leadershipMean)])
  ]));
  $('dictionary-export').addEventListener('click',()=>{updateDictionary();if(!dictionary)return;const weighted=$('matrix-mode').value==='weighted',d=+$('matrix-shift').value,A=weighted?dictionary.A:dictionary.H[d],rows=[['source','matrix','shift','m','B','omega','earlier_word','later_word','entry']];
    A.forEach((row,i)=>row.forEach((value,j)=>rows.push(['Long runs V3 equation (5.1)',weighted?'A':'H(d)',weighted?'all proper shifts':d,dictionary.m,dictionary.B,dictionary.omega,'w'+(i+1)+': '+dictionary.words[i],'w'+(j+1)+': '+dictionary.words[j],value])));
    downloadCSV('dictionary_'+(weighted?'weighted':'shift_'+d)+'_matrix.csv',rows);
  });

  const notation=$('notation-dialog');let notationOpener=null;
  function closeNotation(){if(typeof notation.close==='function')notation.close();else notation.removeAttribute('open');notationOpener?.focus();}
  $('notation-open').addEventListener('click',e=>{notationOpener=e.currentTarget;if(typeof notation.showModal==='function')notation.showModal();else notation.setAttribute('open','');$('notation-close').focus();});
  $('notation-close').addEventListener('click',closeNotation);
  notation.addEventListener('cancel',e=>{e.preventDefault();closeNotation();});

  let clock=null;
  function renderClock(){
    try{clock=R.overshootClocks(Number($('clock-length').value));$('clock-error').textContent='';$('clock-length').removeAttribute('aria-invalid');}catch(e){clock=null;$('clock-error').textContent=e.message;$('clock-length').setAttribute('aria-invalid','true');$('clock-chart').innerHTML='';for(const id of ['clock-boundary','clock-bulk','clock-events'])$(id).textContent='—';$('clock-reading').textContent='Correct L to inspect the survival probabilities.';return;}
    const own=$('clock-mode').value==='own',max=own?8:32,halvings=$('clock-scale').value==='halvings';
    $('clock-coordinate').max=String(max);const x=Math.min(max,+$('clock-coordinate').value);$('clock-coordinate').value=String(x);$('clock-coordinate-value').value=String(x);$('clock-coordinate-label').textContent=own?'Own-clock threshold k':'Integer distance h';
    const rows=own?clock.own:clock.integer,r=rows[x];
    const description=own?`At clock count ${x}, both survival probabilities are 2 to the power minus ${x}. The boundary counts positive primes; the bulk target counts additional integers.`:`At L=${clock.L}, h=${x}, the boundary has encountered ${r.k} new primes. Boundary survival=${r.boundary}; bulk target survival=${r.bulk}.`;
    const c=chart('clock-chart',{xmax:max,ymax:halvings?max:1,xticks:own?[0,2,4,6,8]:[0,8,16,24,32],yticks:halvings?[0,max/4,max/2,3*max/4,max]:[0,.25,.5,.75,1],xlabel:own?'k · steps in each clock':'h · additional integer positions',ylabel:halvings?'Halvings · −log₂ P':'Survival probability',title:'Overshoot survival in two clocks',description,height:285});
    const steps=values=>values.flatMap((v,i)=>i?[[v[0],values[i-1][1]],v]:[v]);
    c.parts.push(curve(c,steps(rows.map(r=>[r.x,halvings?r.k:r.boundary])),blue),curve(c,steps(rows.map(r=>[r.x,halvings?r.x:r.bulk])),orange,'stroke-dasharray="6 4"'),line(c.x(x),c.y(0),c.x(x),c.y(halvings?max:1),grid,'stroke-dasharray="3 3"'));
    c.parts.push(`<circle cx="${c.x(x)}" cy="${c.y(halvings?r.k:r.boundary)}" r="5" fill="${blue}"/><circle cx="${c.x(x)}" cy="${c.y(halvings?r.x:r.bulk)}" r="3" fill="${orange}"/>`);c.finish();
    $('clock-boundary').textContent='2^−'+r.k+' = '+small(r.boundary);$('clock-bulk').textContent='2^−'+x+' = '+small(r.bulk);$('clock-event-label').textContent=own?'Boundary prefix length / bulk run length':'New primes encountered';$('clock-events').textContent=own?r.endpoint+' / '+(clock.L+x):String(r.k);
    $('clock-reading').textContent=own?`The boundary survival is evaluated at prefix length ${r.endpoint}; the bulk target at run length ${clock.L+x}. Both count ${x} steps, but those steps have different meanings. Curves coincide in their own clocks.`:`The next prime after ${clock.L} is ${clock.nextPrime}. Conditional on the initial run, at least ${clock.nextPrime-clock.L-1} extra integer positions are guaranteed. The first halving occurs at h = ${clock.nextPrime-clock.L}, when the endpoint reaches that prime. At h = ${x}, the endpoint is ${r.endpoint}. Steps show the values at integer thresholds. The halving-count view keeps very small survival probabilities legible.`;
  }
  $('clock-length').addEventListener('input',renderClock);$('clock-mode').addEventListener('change',renderClock);$('clock-scale').addEventListener('change',renderClock);$('clock-coordinate').addEventListener('input',renderClock);$('clock-details').addEventListener('toggle',()=>{if($('clock-details').open)renderClock();});
  document.querySelectorAll('[data-clock-length]').forEach(b=>b.addEventListener('click',()=>{$('clock-length').value=b.dataset.clockLength;$('clock-mode').value='integer';const v=R.overshootClocks(+$('clock-length').value);$('clock-coordinate').max='32';$('clock-coordinate').value=String(v.nextPrime-v.L);renderClock();}));
  function revealAnchor(){const id=location.hash?.slice(1);if(!id)return;const target=document.getElementById(id);if(!target)return;let parent=target;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}if(id==='clock-details')renderClock();}
  document.querySelectorAll('a[href="#clock-details"]').forEach(a=>a.addEventListener('click',()=>{$('clock-details').open=true;renderClock();}));
  window.addEventListener('hashchange',revealAnchor);

  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{renderMC();renderK();renderClock();},100);});
  if('IntersectionObserver' in window){const navLinks=[...document.querySelectorAll('.research-nav a')];const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)navLinks.forEach(a=>{if(a.getAttribute('href')==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-5% 0px -75% 0px'});for(const a of navLinks){const section=document.querySelector(a.getAttribute('href'));if(section)observer.observe(section);}}
  mcReset();renderK();updateDictionary();renderClock();revealAnchor();
})();
