'use strict';
// A view and export of the current SVG, without changing the live experiment.
(() => {
  const fr = document.documentElement.lang.startsWith('fr');
  const words = fr ? {
    enlarge:'Agrandir', save:'Télécharger SVG', close:'Fermer', title:'Figure agrandie',
    tools:'Outils de la figure', zoom:'Zoom', frozen:'Instantané figé : cette vue ne suit pas les changements du graphique. Fermez-la pour retrouver les réglages et les animations.',
    pan:'Faites défiler la figure si elle dépasse le cadre.', saved:'Fichier SVG préparé.',
    error:'Cette figure ne peut pas être exportée dans ce navigateur.'
  } : {
    enlarge:'Enlarge figure', save:'Save SVG', close:'Close', title:'Enlarged figure',
    tools:'Figure tools', zoom:'Zoom', frozen:'Frozen snapshot: this view does not follow changes in the chart. Close it to return to the controls and animations.',
    pan:'Scroll the figure if it extends beyond the frame.', saved:'SVG file prepared.',
    error:'This browser could not export the figure.'
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const properties = ('color fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit opacity font-family font-size font-style font-weight font-variant letter-spacing word-spacing text-anchor dominant-baseline alignment-baseline text-decoration visibility display paint-order shape-rendering text-rendering vector-effect clip-path mask filter stop-color stop-opacity flood-color flood-opacity transform transform-origin').split(' ');
  const allowed = new Set(('svg g path rect circle ellipse line polyline polygon text tspan textPath title desc defs use symbol clipPath mask pattern linearGradient radialGradient stop marker filter feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feDropShadow feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence').split(' ').map(name=>name.toLowerCase()));
  const toolbars = new WeakMap();
  let serial = 0, dialog, opener, current, currentName, currentWidth, scrollbox, picture, status;

  function label(svg, chart) {
    const title=[...svg.children].find(child=>child.localName.toLowerCase()==='title');
    let heading=chart.previousElementSibling;
    while(heading && !heading.matches('h4')) heading=heading.previousElementSibling;
    return svg.getAttribute('aria-label')?.trim() || title?.textContent.trim() || chart.getAttribute('aria-label')?.trim() || heading?.textContent.trim() || chart.id || words.title;
  }
  function fileName(chart) {
    const page = new URLSearchParams(location.search).get('view') || location.pathname.split('/').pop()?.replace(/\.html$/,'') || 'overview';
    return [page, chart.id || 'figure'].join('-').replace(/[^a-z0-9_-]/gi,'-').slice(0,140) + '.svg';
  }
  function background(element) {
    for(let node=element; node; node=node.parentElement) {
      const value=getComputedStyle(node).backgroundColor;
      if(value && value!=='transparent' && value!=='rgba(0, 0, 0, 0)') return value;
    }
    return document.documentElement.dataset.theme==='dark' ? '#0e1829' : '#ffffff';
  }
  function snapshot(svg, chart) {
    const copy=svg.cloneNode(true), source=[svg,...svg.querySelectorAll('*')], target=[copy,...copy.querySelectorAll('*')];
    const ids=new Map(), prefix='figure-snapshot-'+(++serial)+'-';
    source.forEach(node=>{if(node.id) ids.set(node.id,prefix+ids.size);});
    const localReference=value=>value.replace(/url\(\s*["']?([^\s)"']+)["']?\s*\)/gi,(_,url)=>{
      const id=url.split('#')[1];
      return id && ids.has(id) && (url.startsWith('#') || url.split('#')[0]===location.href.split('#')[0]) ? 'url(#'+ids.get(id)+')' : 'none';
    });
    source.forEach((node,i)=>{
      const clone=target[i];
      if(!allowed.has(node.localName.toLowerCase())) {clone.remove();return;}
      const computed=getComputedStyle(node);
      for(const attr of [...clone.attributes]) {
        const name=attr.name.toLowerCase();
        if(name==='style' || name==='class' || name==='tabindex' || name.startsWith('on')) clone.removeAttribute(attr.name);
        else if(name==='id') clone.id=ids.get(attr.value);
        else if(name==='href' || name==='xlink:href') {
          if(attr.value.startsWith('#') && ids.has(attr.value.slice(1))) clone.setAttribute(attr.name,'#'+ids.get(attr.value.slice(1)));
          else clone.removeAttribute(attr.name);
        } else if(name==='aria-labelledby' || name==='aria-describedby') {
          const references=attr.value.split(/\s+/).map(id=>ids.get(id)).filter(Boolean).join(' ');
          if(references) clone.setAttribute(attr.name,references); else clone.removeAttribute(attr.name);
        } else if(/url\(/i.test(attr.value)) clone.setAttribute(attr.name,localReference(attr.value));
      }
      properties.forEach(property=>{
        const value=computed.getPropertyValue(property);
        if(value) clone.style.setProperty(property,localReference(value));
      });
      clone.style.setProperty('animation','none');
      clone.style.setProperty('transition','none');
    });
    const view=svg.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
    const box=view?.length===4 && view.every(Number.isFinite) && view[2]>0 && view[3]>0 ? view : [0,0,svg.clientWidth||640,svg.clientHeight||320];
    copy.setAttribute('xmlns',svgNS);
    copy.setAttribute('viewBox',box.join(' '));
    copy.setAttribute('width',box[2]); copy.setAttribute('height',box[3]);
    copy.setAttribute('role','img'); copy.setAttribute('aria-label',label(svg,chart));
    copy.removeAttribute('aria-labelledby'); copy.removeAttribute('aria-describedby');
    copy.style.setProperty('background',background(svg));
    copy.style.setProperty('overflow','visible');
    const paper=document.createElementNS(svgNS,'rect');
    ['x','y','width','height'].forEach((key,i)=>paper.setAttribute(key,box[i]));
    paper.setAttribute('fill',background(svg));
    copy.insertBefore(paper,copy.firstChild);
    const metadata=document.createElementNS(svgNS,'metadata');
    const experiment=chart.closest('.experiment, .influence-lab, .poisson-lab') || chart.parentElement;
    const controls=[...experiment.querySelectorAll('input,select,textarea')].map(input=>({
      id:input.id || input.name, value:input.value, ...(input.type==='checkbox' || input.type==='radio' ? {checked:input.checked} : {})
    }));
    metadata.textContent=JSON.stringify({title:label(svg,chart),page:document.title,chart:chart.id,source:location.href,captured:new Date().toISOString(),controls});
    copy.appendChild(metadata);
    return {svg:copy, width:box[2]};
  }
  function download(svg,name) {
    const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(svg);
    const url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url; link.download=name;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    announce(words.saved);
  }
  function announce(message) {
    if(!status) {
      status=document.createElement('span'); status.className='figure-tools-status'; status.setAttribute('role','status');
    }
    const destination=dialog?.open ? dialog : document.body;
    if(status.parentElement!==destination) destination.appendChild(status);
    status.textContent=message;
  }
  function createDialog() {
    dialog=document.createElement('dialog'); dialog.className='figure-dialog';
    dialog.setAttribute('aria-labelledby','figure-dialog-title'); dialog.setAttribute('aria-describedby','figure-dialog-note');
    dialog.innerHTML='<div class="figure-dialog-heading"><h2 id="figure-dialog-title"></h2><button type="button" class="figure-tool-button" data-figure-close></button></div><p id="figure-dialog-note" class="figure-dialog-note"></p><div class="figure-dialog-controls"><label for="figure-dialog-zoom"></label><select id="figure-dialog-zoom"><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option><option value="3">300%</option></select><button type="button" class="figure-tool-button" data-figure-save></button><span class="figure-dialog-hint"></span></div><div class="figure-dialog-scroll" tabindex="0"><div class="figure-dialog-picture"></div></div>';
    dialog.querySelector('[data-figure-close]').textContent=words.close;
    dialog.querySelector('#figure-dialog-note').textContent=words.frozen;
    dialog.querySelector('label').textContent=words.zoom;
    dialog.querySelector('[data-figure-save]').textContent=words.save;
    dialog.querySelector('.figure-dialog-hint').textContent=words.pan;
    scrollbox=dialog.querySelector('.figure-dialog-scroll');
    scrollbox.setAttribute('aria-label',words.pan);
    picture=dialog.querySelector('.figure-dialog-picture');
    dialog.querySelector('[data-figure-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog) return;
      const box=dialog.getBoundingClientRect();
      if(event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom) dialog.close();
    });
    dialog.addEventListener('close',()=>{
      picture.replaceChildren(); current=null;
      if(opener?.isConnected) opener.focus({preventScroll:true});
    });
    dialog.querySelector('select').addEventListener('change',resizePicture);
    dialog.querySelector('[data-figure-save]').addEventListener('click',()=>{
      try {if(current) download(current,currentName);} catch {announce(words.error);}
    });
    document.body.appendChild(dialog);
  }
  function resizePicture() {
    if(!current) return;
    const zoom=Number(dialog.querySelector('select').value);
    const width=Math.max(640,currentWidth,scrollbox.clientWidth-24)*zoom;
    picture.style.width=width+'px';
  }
  function enlarge(svg,chart,button) {
    if(!dialog) createDialog();
    const frozen=snapshot(svg,chart); current=frozen.svg; currentWidth=frozen.width; currentName=fileName(chart); opener=button;
    dialog.querySelector('#figure-dialog-title').textContent=label(svg,chart);
    dialog.querySelector('select').value='1';
    const shown=current.cloneNode(true);
    shown.style.setProperty('width','100%'); shown.style.setProperty('height','auto');
    picture.replaceChildren(shown);
    dialog.showModal(); resizePicture(); scrollbox.scrollTop=0; scrollbox.scrollLeft=0;
    dialog.querySelector('[data-figure-close]').focus();
  }
  function attach(chart) {
    if(toolbars.has(chart)) return;
    const toolbar=document.createElement('div'); toolbar.className='figure-tools';
    toolbar.setAttribute('role','group'); toolbar.setAttribute('aria-label',words.tools);
    const canEnlarge=typeof HTMLDialogElement!=='undefined' && typeof HTMLDialogElement.prototype.showModal==='function';
    for(const action of canEnlarge ? ['enlarge','save'] : ['save']) {
      const button=document.createElement('button'); button.type='button'; button.className='figure-tool-button';
      button.textContent=words[action]; button.dataset.figureAction=action;
      toolbar.appendChild(button);
    }
    function refresh() {
      const svg=chart.querySelector('svg'); toolbar.hidden=!svg;
      if(svg) toolbar.querySelectorAll('button').forEach(button=>button.setAttribute('aria-label',words[button.dataset.figureAction]+': '+label(svg,chart)));
    }
    toolbar.addEventListener('click',event=>{
      const button=event.target.closest('button'), svg=chart.querySelector('svg');
      if(!button || !svg) return;
      try {
        if(button.dataset.figureAction==='enlarge') enlarge(svg,chart,button);
        else download(snapshot(svg,chart).svg,fileName(chart));
      } catch {announce(words.error);}
    });
    chart.insertAdjacentElement('afterend',toolbar); toolbars.set(chart,toolbar); refresh();
    // Chart engines replace their own contents. Keep their sibling toolbar stable.
    new MutationObserver(refresh).observe(chart,{childList:true,subtree:true});
  }
  function start() {
    document.querySelectorAll('.chart').forEach(attach);
    new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
      if(node.nodeType!==1 || node.closest('.figure-dialog,.figure-tools')) return;
      if(node.matches('.chart')) attach(node);
      node.querySelectorAll('.chart').forEach(attach);
    }))).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
