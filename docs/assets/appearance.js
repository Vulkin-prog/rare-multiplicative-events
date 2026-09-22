'use strict';
// Set the stored preference before the first stylesheet is painted.
(() => {
  const key='arithmetic-reading-theme';
  const root=document.documentElement;
  let saved='light';
  try{const value=localStorage.getItem(key);if(value==='dark'||value==='light')saved=value;}catch{}
  function apply(theme,persist=false){
    const mode=theme==='dark'?'dark':'light';
    root.dataset.theme=mode;
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=mode==='dark'?'#0e1829':'#ffffff';
    const button=document.getElementById('theme-toggle');
    if(button){button.setAttribute('aria-pressed',String(mode==='dark'));button.dataset.activeTheme=mode;}
    if(persist){try{localStorage.setItem(key,mode);}catch{}}
  }
  apply(saved);
  window.SiteTheme={set:theme=>apply(theme,true),get:()=>root.dataset.theme};
  document.addEventListener('DOMContentLoaded',()=>{
    apply(root.dataset.theme);
    document.getElementById('theme-toggle')?.addEventListener('click',()=>apply(root.dataset.theme==='dark'?'light':'dark',true));
    document.querySelectorAll('[data-language-link]').forEach(link=>link.addEventListener('click',()=>{
      const nav=document.querySelector('.chapter-nav');
      const active=document.querySelector('.contents-menu a[aria-current="location"]');
      const hash=nav&&nav.getBoundingClientRect().top<=2&&active?active.getAttribute('href'):location.hash;
      link.setAttribute('href',link.dataset.languagePage+(hash||''));
    }));
  });
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue);});
})();
