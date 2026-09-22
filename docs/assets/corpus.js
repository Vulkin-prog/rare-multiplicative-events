'use strict';
(() => {
  // Preserve research links shared when Long runs occupied the root URL.
  const oldC=['results','relation-profile','dictionary-theorem','crossover-theorem','exponent-lab','crossover-lab','dictionary-lab','mechanism','clock-details','sources'];
  if(!window.CORPUS_OFFLINE&&document.querySelector('.overview-hero')&&/(?:\/index\.html|\/)$/i.test(location.pathname)){
    const id=location.hash.slice(1);
    if(oldC.includes(id)||id==='leadership-lab'){
      location.replace((id==='leadership-lab'?'flows.html':'paper-c.html')+location.search+location.hash);return;
    }
  }
  const menu=document.querySelector('.corpus-papers');
  if(menu){
    document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))menu.open=false;});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
    menu.addEventListener('focusout',event=>{if(event.relatedTarget&&!menu.contains(event.relatedTarget))menu.open=false;});
  }
  // Open a statement nested in a disclosure when arriving from a cross-paper link.
  function reveal(){let el;try{el=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}while(el){if(el.tagName==='DETAILS')el.open=true;el=el.parentElement;}}
  window.addEventListener('hashchange',reveal);reveal();
})();
