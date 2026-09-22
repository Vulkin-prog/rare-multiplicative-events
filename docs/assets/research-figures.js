'use strict';
(() => {
  const M=window.ResearchFigureMath,$=id=>document.getElementById(id),fmt=(x,n=4)=>Number(x).toLocaleString('en-US',{maximumFractionDigits:n}),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const blue='var(--positive)',orange='var(--negative)',muted='var(--muted)',ink='var(--ink)',grid='var(--chart-grid)';
  function chart(id,{xmax,ymin=0,ymax,xticks,yticks,xlabel,ylabel,title,description,height=305}){
    const W=Math.max(280,$(id).clientWidth||640),H=height,l=55,r=17,top=28,bottom=52,x=v=>l+v/xmax*(W-l-r),y=v=>H-bottom-(v-ymin)/(ymax-ymin)*(H-top-bottom);
    const parts=[`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc>`];
    for(const v of yticks)parts.push(`<line x1="${l}" x2="${W-r}" y1="${y(v)}" y2="${y(v)}" stroke="${grid}"/><text x="${l-8}" y="${y(v)+4}" text-anchor="end" font-size="12">${escape(fmt(v,2))}</text>`);
    for(const v of xticks)parts.push(`<text x="${x(v)}" y="${H-bottom+22}" text-anchor="middle" font-size="12">${escape(fmt(v,2))}</text>`);
    parts.push(`<text x="${l}" y="16" font-size="12">${escape(ylabel)}</text><text x="${(l+W-r)/2}" y="${H-7}" font-size="12" text-anchor="middle">${escape(xlabel)}</text>`);
    return {W,H,x,y,parts,finish(){ $(id).innerHTML=parts.join('')+'</svg>';}};
  }
  const curve=(c,rows,color,extra='')=>`<path d="${rows.map(([x,y],i)=>(i?'L':'M')+c.x(x).toFixed(3)+','+c.y(y).toFixed(3)).join(' ')}" fill="none" stroke="${color}" stroke-width="2" ${extra}/>`;
  function steps(rows){const out=[];for(let i=0;i<rows.length;i++){if(i)out.push([rows[i][0],rows[i-1][1]]);out.push(rows[i]);}return out;}
  function renderBudget(){
    if(!$('exponent-lab'))return;const alpha=+$('budget-alpha').value/1000,epsilon=+$('budget-epsilon').value,capped=$('budget-cap').checked,b=M.exponentBudget(alpha,epsilon,capped);$('budget-alpha-value').value=alpha.toFixed(3);
    const c=chart('budget-chart',{xmax:.6,ymin:-.4,ymax:.35,xticks:[0,.2,.4,.6],yticks:[-.3,-.15,0,.15,.3],xlabel:'α · growth exponent of dictionary size',ylabel:'Exponent of N in the bound',title:'Effect of the marginal cap on the arithmetic error budget',description:`At alpha=${alpha}, epsilon=${epsilon}, the ${capped?'capped':'uncapped'} bound has largest exponent ${b.worst}. ${b.decays?'Every contribution in the selected bound has a negative power.':'This bound does not establish decay.'}`});
    for(const [threshold,label] of [[b.rawBoundary,'raw'],[b.cappedBoundary,'capped']])c.parts.push(`<line x1="${c.x(threshold)}" x2="${c.x(threshold)}" y1="${c.y(-.4)}" y2="${c.y(.35)}" stroke="${grid}" stroke-dasharray="2 4"/><text x="${c.x(threshold)-3}" y="${c.y(.30)}" text-anchor="end" font-size="12">${label}</text>`);
    c.parts.push(`<line x1="${c.x(0)}" x2="${c.x(.6)}" y1="${c.y(0)}" y2="${c.y(0)}" stroke="${ink}"/>`);
    const rows=Array.from({length:121},(_,i)=>M.exponentBudget(i/200,epsilon,capped));
    c.parts.push(curve(c,rows.map(b=>[b.alpha,b.first]),muted,'stroke-dasharray="2 3"'),curve(c,rows.map(b=>[b.alpha,b.nonterminal]),orange,'stroke-dasharray="6 3"'),curve(c,rows.map(b=>[b.alpha,b.rawTerminal]),ink,`stroke-dasharray="9 5" opacity="${capped?.35:1}"`),curve(c,rows.map(b=>[b.alpha,b.cappedTerminal]),blue,`opacity="${capped?1:.3}"`));
    c.parts.push(`<line x1="${c.x(alpha)}" x2="${c.x(alpha)}" y1="${c.y(-.4)}" y2="${c.y(.35)}" stroke="${muted}" stroke-dasharray="3 4"/>`);
    for(const [value,color] of [[b.first,muted],[b.nonterminal,orange],[b.terminal,capped?blue:ink]])c.parts.push(`<circle cx="${c.x(alpha)}" cy="${c.y(value)}" r="4" fill="${color}"/>`);c.finish();
    $('budget-table').innerHTML=[['First contribution',b.first,b.first],['Nonterminal',b.nonterminal,b.nonterminal],['Terminal',b.rawTerminal,b.cappedTerminal]].map(([name,raw,cap])=>`<tr><th scope="row">${name}</th><td class="${capped?'':'active-budget'}">${fmt(raw)}</td><td class="${capped?'active-budget':''}">${fmt(cap)}</td></tr>`).join('');
    $('budget-reading').textContent=`${capped?'Cap applied':'Without the cap'}: the largest exponent in the selected bound is ${fmt(b.worst)}. ${b.decays?'All three arithmetic contributions decay at these powers.':'This calculation does not establish decay at this exponent.'} The sufficient boundary in this display is α < ${fmt(capped?b.cappedBoundary:b.rawBoundary)}. ${epsilon===0?'The N^ε loss is omitted in this leading-power view.':'The selected positive ε is included in every term.'} The overlap hypothesis remains separate.`;
  }
  if($('exponent-lab')){for(const id of ['budget-alpha','budget-epsilon','budget-cap'])$(id).addEventListener(id==='budget-alpha'?'input':'change',renderBudget);renderBudget();}

  let word=null;
  function holder(r){return 'run '+(r.index+1)+' ('+(r.sign===1?'+':'−')+')';}
  function renderRecord(){
    if(!word)return;const m=+$('record-prefix').value,s=word.at(m),full=$('record-full').checked;$('record-prefix-value').value=String(m);$('record-back').disabled=m<=1;$('record-next').disabled=m>=word.length;
    $('record-word').innerHTML=word.word.map((sign,i)=>{const pos=i+1,seen=pos<=m,inHolder=seen&&pos>=s.holder.start&&pos<s.holder.start+s.holder.length;return `<button type="button" data-position="${pos}" class="record-cell ${seen?(sign===1?'sign-positive':'sign-negative'):'unseen'} ${inHolder?'holder-cell':''}" tabindex="${pos===m?'0':'-1'}" aria-label="Position ${pos}: ${seen?(sign===1?'plus':'minus'):'not yet observed'}${inHolder?', earliest record holder':''}" ${pos===m?'aria-current="true"':''}><span>${pos}</span><b>${seen?(sign===1?'+':'−'):'?'}</b></button>`;}).join('');
    const values=[[0,0]],announced=[[0,0]];for(let x=1;x<=m;x++){const r=word.at(x);values.push([x,r.visible]);announced.push([x,r.announced]);}
    const max=Math.max(...word.runs.map(r=>r.length)),ymax=Math.ceil(max/3)*3;
    const c=chart('record-chart',{xmax:word.length,ymax,xticks:word.length>20?[0,8,16,24,word.length]:[0,5,10,word.length],yticks:[0,ymax/3,2*ymax/3,ymax],xlabel:'m · symbols revealed',ylabel:'Maximum run length',title:'Visible maximum and full-length comparison',description:`At prefix ${m}, visible maximum ${s.visible}, held by ${holder(s.holder)}. ${s.recognized} record episodes recognized. ${full?'The dashed comparison uses full lengths of runs already started.':'Full-length comparison is hidden.'}`});
    if(full)c.parts.push(curve(c,steps(announced),muted,'stroke-dasharray="6 4"'));c.parts.push(curve(c,steps(values),blue),`<line x1="${c.x(m)}" x2="${c.x(m)}" y1="${c.y(0)}" y2="${c.y(ymax)}" stroke="${grid}" stroke-dasharray="3 4"/>`);
    for(const r of word.runs.filter(r=>r.record&&r.recognition<=m))c.parts.push(`<circle cx="${c.x(r.recognition)}" cy="${c.y(r.previous+1)}" r="4" fill="${blue}"><title>One episode recognized at prefix ${r.recognition}: ${holder(r)}</title></circle>`);c.finish();
    $('record-visible').textContent=s.visible+' / '+holder(s.holder);$('record-announced').textContent=s.announced+' / '+holder(s.announcedHolder);$('record-count').textContent=s.recognized+' ('+s.positive+' / '+s.negative+')';$('record-full-stat').hidden=!full;$('record-full-key').hidden=!full;
    let message;
    if(s.current.recognition===m)message=`Visible length ${s.currentSeen} first exceeds the previous maximum ${s.current.previous}. One ${s.current.sign===1?'positive':'negative'} record episode is recognized; ${holder(s.current)} becomes holder.`;
    else if(s.current.record&&s.current.recognition<m)message=`This run was recognized at prefix ${s.current.recognition}. Its visible length is now ${s.currentSeen}; further growth within the same run adds no record episode.`;
    else if(s.currentSeen===s.current.previous)message=`The active run has reached length ${s.currentSeen}. It ties the record, so ${holder(s.holder)} remains holder. One more ${s.current.sign===1?'+':'−'} symbol would establish a new record.`;
    else message=`The active run has visible length ${s.currentSeen}, below the previous maximum ${s.current.previous}. ${holder(s.holder)} remains holder.`;
    if(full&&s.announced>s.visible)message+=` The full-length comparison already knows a length of ${s.announced}; that information is unavailable to the finite observer.`;
    $('record-reading').textContent=message;
  }
  function setPrefix(m){$('record-prefix').value=String(Math.max(1,Math.min(word.length,m)));renderRecord();}
  if($('record-lab')){
    function resetWord(){word=M.recordWord($('record-scenario').value);$('record-prefix').max=String(word.length);setPrefix(word.name==='episode'?8:27);}
    $('record-scenario').addEventListener('change',resetWord);$('record-prefix').addEventListener('input',renderRecord);$('record-full').addEventListener('change',renderRecord);
    $('record-back').addEventListener('click',()=>setPrefix(+$('record-prefix').value-1));$('record-next').addEventListener('click',()=>setPrefix(+$('record-prefix').value+1));
    $('record-word').addEventListener('click',e=>{const b=e.target.closest('[data-position]');if(!b)return;setPrefix(+b.dataset.position);$('record-word').querySelector('[data-position="'+$('record-prefix').value+'"]').focus({preventScroll:true});});
    $('record-word').addEventListener('keydown',e=>{if(!e.target.closest('[data-position]'))return;const key=e.key,m=+$('record-prefix').value;if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;e.preventDefault();setPrefix(key==='Home'?1:key==='End'?word.length:m+(key==='ArrowRight'?1:-1));$('record-word').querySelector('[data-position="'+$('record-prefix').value+'"]').focus({preventScroll:true});});resetWord();
  }
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{renderBudget();renderRecord();},100);});
})();
