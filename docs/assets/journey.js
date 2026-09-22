'use strict';
// Navigation and guided controls. All mathematical models stay in math.js.
(() => {
  const chapters=[...document.querySelectorAll('.chapter')];
  const labels=chapters.map(chapter=>chapter.dataset.chapterTitle||chapter.querySelector('h2').textContent);
  const menu=$('contents-menu');
  const links=[...menu.querySelectorAll('a')];
  let current=-1,framePending=false;

  function updatePosition(){
    framePending=false;
    const reference=document.querySelector('.chapter-nav').getBoundingClientRect().height+35;
    let index=0;
    chapters.forEach((chapter,i)=>{if(chapter.getBoundingClientRect().top<=reference)index=i;});
    if(index!==current){
      current=index;
      $('current-step').textContent=String(index+1).padStart(2,'0')+' / '+String(chapters.length).padStart(2,'0');
      $('current-title').textContent=labels[index];
      links.forEach(a=>{const active=a.getAttribute('href')==='#'+chapters[index].id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    }
    const first=chapters[0].getBoundingClientRect().top+window.scrollY;
    const last=chapters.at(-1).getBoundingClientRect().bottom+window.scrollY-window.innerHeight;
    const progress=Math.max(0,Math.min(1,(window.scrollY-first)/(Math.max(1,last-first))));
    $('reading-progress').style.width=(100*progress).toFixed(2)+'%';
  }
  function queuePosition(){if(!framePending){framePending=true;requestAnimationFrame(updatePosition);}}
  window.addEventListener('scroll',queuePosition,{passive:true});
  window.addEventListener('resize',queuePosition);

  // A small native disclosure, without a modal or a second navigation surface.
  function closeMenu(focus=false){menu.open=false;if(focus)menu.querySelector('summary').focus({preventScroll:true});}
  document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){closeMenu(true);e.preventDefault();}});
  menu.addEventListener('focusout',e=>{if(e.relatedTarget&&!menu.contains(e.relatedTarget))closeMenu();});
  menu.querySelectorAll('[data-open-glossary]').forEach(b=>b.addEventListener('click',()=>closeMenu()));
  let glossaryFromMenu=false;
  menu.querySelectorAll('[data-open-glossary]').forEach(b=>b.addEventListener('click',()=>{glossaryFromMenu=true;}));
  $('glossary-dialog').addEventListener('close',()=>{if(glossaryFromMenu){glossaryFromMenu=false;menu.querySelector('summary').focus({preventScroll:true});}});
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
    const id=a.getAttribute('href').slice(1),target=$(id);
    if(!target)return;
    closeMenu();stopAllAnimations();
    const focusTarget=target===document.body?document.querySelector('h1'):(target.querySelector('h2')||target);
    focusTarget.setAttribute('tabindex','-1');
    // Preserve native fragment navigation and its browser-history semantics.
    requestAnimationFrame(()=>focusTarget.focus({preventScroll:true}));
  }));

  const specialistPanels=[...document.querySelectorAll('.expert-panel')];
  on('expert-mode','change',()=>{
    const expand=$('expert-mode').checked;
    const chapter=chapters[current<0?0:current];
    const anchor=[...chapter.querySelectorAll('p,h3,.experiment')].find(el=>{
      const box=el.getBoundingClientRect();return box.height>0&&box.top>=80&&box.top<window.innerHeight;
    })||chapter;
    const offset=anchor.getBoundingClientRect().top;
    specialistPanels.forEach(p=>{
      p.open=expand;
      if(expand){let ancestor=p.parentElement;while(ancestor){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement;}}
    });
    document.body.classList.toggle('expert-mode',expand);
    // Opening earlier chapters must not displace the paragraph being read.
    requestAnimationFrame(()=>{window.scrollBy({top:anchor.getBoundingClientRect().top-offset,behavior:'instant'});refreshOpenFigures();});
  });
  document.querySelectorAll('details').forEach(panel=>panel.addEventListener('toggle',()=>{
    if(panel===menu)return;
    $('expert-mode').checked=specialistPanels.every(p=>p.open);
    if(panel.open)refreshOpenFigures();else stopAllAnimations();
    queuePosition();
  }));
  function refreshOpenFigures(){redraw();renderInfluence();renderWindow();renderGeometry();updateScrollableRegions();queuePosition();}

  // One stop per grid, with arrow keys and Home / End within the group.
  const groups=['prime-controls','integer-grid','relation-controls','clock-controls'].filter(id=>$(id));
  function prepareGroup(id){
    const group=$(id),buttons=[...group.querySelectorAll('button')];
    const chosen=buttons.find(b=>b.getAttribute('aria-pressed')==='true')||buttons.find(b=>b.dataset.keyboardCurrent==='true')||buttons[0];
    buttons.forEach(b=>b.tabIndex=b===chosen?0:-1);
  }
  window.prepareReadingGroups=()=>groups.forEach(prepareGroup);
  groups.forEach(id=>{
    const group=$(id);
    group.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
      const buttons=[...group.querySelectorAll('button:not(:disabled)')];
      const i=buttons.indexOf(e.target);if(i<0)return;
      const styles=getComputedStyle(group),columns=styles.gridTemplateColumns;
      let step=(columns&&columns!=='none')?columns.split(' ').filter(Boolean).length:1;
      if(id!=='integer-grid'&&id!=='clock-controls')step=1;
      let next=e.key==='Home'?0:e.key==='End'?buttons.length-1:i+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:e.key==='ArrowDown'?step:-step);
      next=Math.max(0,Math.min(buttons.length-1,next));
      e.preventDefault();
      buttons.forEach((b,j)=>{b.tabIndex=j===next?0:-1;b.dataset.keyboardCurrent=String(j===next);});
      buttons[next].focus();
      // Reading a number or choosing a prime is reversible selection, not a toss.
      if(id==='integer-grid'||id==='prime-controls')buttons[next].click();
    });
    group.addEventListener('click',e=>{if(!e.target.closest('button'))return;prepareGroup(id);});
    group.addEventListener('focusin',e=>{if(!e.target.matches('button'))return;group.querySelectorAll('button').forEach(b=>{b.tabIndex=b===e.target?0:-1;b.dataset.keyboardCurrent=String(b===e.target);});});
  });

  // All readers have the same pause behavior, and only one runs at a time.
  const animationAreas={
    'window-play':{range:'window-position',readings:['window-position-value']},
    'record-play':{range:'record-prefix',readings:['record-reading','record-prefix-value']},
    'geometry-play':{range:'geometry-t',readings:['geometry-reading','geometry-t-value']},
    'flow-play':{range:'flow-t',readings:['flow-t-value']}
  };
  Object.keys(animationAreas).forEach(id=>{if(!$(id))delete animationAreas[id];});
  function animationRunning(id){return id==='window-play'?!!windowTimer:id==='record-play'?!!recordTimer:id==='geometry-play'?!!geometryTimer:!!flowTimer;}
  function syncAnimationLabels(){
    Object.entries(animationAreas).forEach(([id,area])=>{
      const running=animationRunning(id);$(id).setAttribute('aria-pressed',String(running));
      area.readings.forEach(name=>$(name).setAttribute('aria-live',running?'off':'polite'));
    });
  }
  function stopAllAnimations(except){
    if(except!=='window-play')stopWindow();
    if(except!=='record-play')stopRecord();
    if(except!=='geometry-play')stopGeometry();
    if(except!=='flow-play')stopFlow();
    syncAnimationLabels();
  }
  window.stopReadingAnimations=stopAllAnimations;
  window.syncAnimationLabels=syncAnimationLabels;
  // Capture runs before the existing button handlers; the bubbling handler reads the new state.
  Object.entries(animationAreas).forEach(([id,area])=>{
    $(id).addEventListener('click',()=>stopAllAnimations(id),true);
    $(id).addEventListener('click',syncAnimationLabels);
    $(area.range).addEventListener('input',syncAnimationLabels);
  });
  const visibility=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)return;
      const id=Object.keys(animationAreas).find(id=>entry.target.contains($(id)));
      if(id&&animationRunning(id))stopAllAnimations();
    });
  },{threshold:0});
  Object.keys(animationAreas).forEach(id=>visibility.observe($(id).closest('.experiment,.geometry-experiment')));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAllAnimations();});

  document.querySelectorAll('[data-record-at]').forEach(b=>b.addEventListener('click',()=>{
    stopAllAnimations();$('record-prefix').value=b.dataset.recordAt;renderRecords();
  }));
  document.querySelectorAll('[data-geometry-at]').forEach(b=>b.addEventListener('click',()=>{
    stopAllAnimations();$('geometry-t').value=b.dataset.geometryAt;renderGeometry();
  }));
  on('influence-invert','click',()=>{if(!tossing)$('prime-invert').click();});
  on('gaussian-c','change',()=>{
    stopAllAnimations();$('flow-c').value=$('gaussian-c').value;resetFlow();
  });
  on('flow-c','change',()=>{$('gaussian-c').value=$('flow-c').value;});

  // Avoid duplicate graphic roles and expose horizontal scrolling only where needed.
  const descriptions={
    'influence-chart':'influence-reading','poisson-chart':'pois-description','phase-chart':'phase-reading',
    'marks-chart':'marks-description','record-chart':'record-reading','geometry-scale':'geometry-reading',
    'geometry-threshold':'geometry-reading','boundary-chart':'boundary-reading','run-map':'run-results'
  };
  window.describeReadingChart=(id,svg)=>{if(svg&&descriptions[id])svg.setAttribute('aria-describedby',descriptions[id]);};
  document.querySelectorAll('.chart,.run-map').forEach(el=>{el.removeAttribute('role');el.removeAttribute('aria-label');window.describeReadingChart(el.id,el.querySelector('svg'));});
  $('coin-result')?.removeAttribute('role');$('coin-result')?.removeAttribute('aria-live');
  function updateScrollableRegions(){
    document.querySelectorAll('.formula,.word-overlaps,.chart,.run-map').forEach(el=>{
      if(el.scrollWidth>el.clientWidth+2){el.tabIndex=0;el.setAttribute('role','region');el.setAttribute('aria-label',el.classList.contains('formula')?SiteText("journey.8",'Formule, défilement horizontal'):SiteText("journey.9",'Figure, défilement horizontal'));}
      else{el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');}
    });
  }
  window.addEventListener('resize',updateScrollableRegions);
  let printState=[];
  window.addEventListener('beforeprint',()=>{stopAllAnimations();printState=[...document.querySelectorAll('.expert-panel,.explore-panel')].map(p=>[p,p.open]);printState.forEach(([p])=>p.open=true);refreshOpenFigures();});
  window.addEventListener('afterprint',()=>{printState.forEach(([p,open])=>p.open=open);printState=[];});
  window.prepareReadingGroups();syncAnimationLabels();updateScrollableRegions();updatePosition();
})();
