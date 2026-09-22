#!/usr/bin/env python3
"""Package the public-corpus reading routes and their local assets as one offline HTML file.
Only Python's standard library is required. Run from the Site checkout.
"""
from pathlib import Path
import argparse,base64,hashlib,json,re
root=Path(__file__).resolve().parents[1]/'docs'
route_files={'overview':'index.html','research':'paper-c.html','flows':'flows.html','clusters':'clusters.html','environments':'environments.html','sources':'sources.html','overview-intuition-fr':'overview-intuition.html','overview-intuition-en':'overview-intuition-en.html','intuition-fr':'c-intuition.html','intuition-en':'c-intuition-en.html','flows-intuition-fr':'flows-intuition.html','flows-intuition-en':'flows-intuition-en.html','clusters-intuition-fr':'clusters-intuition.html','clusters-intuition-en':'clusters-intuition-en.html','environments-intuition-fr':'environments-intuition.html','environments-intuition-en':'environments-intuition-en.html'}
pages={k:(root/f).read_text() for k,f in route_files.items()}
assets={}
def data_uri(path):
 types={'.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'}
 return 'data:'+types.get(path.suffix,'application/octet-stream')+';base64,'+base64.b64encode(path.read_bytes()).decode()
def css_inline(text,base):
 # Modern browsers, including smartphone browsers, support WOFF2. Keep one font format.
 text=re.sub(r'src\s*:\s*(url\([^)]*\.woff2[^)]*\)[^,;]*)(?:,[^;]*)?;',r'src:\1;',text)
 def replace(m):
  url=m.group(1).strip('"\' ')
  if url.startswith(('data:','http:','https:','#')):return m.group(0)
  file=(base/url.split('?')[0]).resolve()
  if not file.is_file():raise FileNotFoundError(file)
  return 'url("'+data_uri(file)+'")'
 return re.sub(r'url\(([^)]+)\)',replace,text)
for source in pages.values():
 for url in re.findall(r'(?:src|href)=["\']([^"\']+)["\']',source):
  clean=url.split('#')[0]
  if clean.startswith('assets/') and clean not in assets:
   p=root/clean
   if p.suffix=='.css':assets[clean]=css_inline(p.read_text(),p.parent)
   elif p.suffix=='.js':assets[clean]=p.read_text()
   else:assets[clean]=data_uri(p)
assert not list(root.rglob('*.pdf')), 'PDFs belong on Zenodo, not in the site export'
blob={'pages':pages,'assets':assets,'routes':{f:k for k,f in route_files.items()},'downloads':{'corpus.bib':base64.b64encode((root/'corpus.bib').read_bytes()).decode()}}
data=json.dumps(blob,separators=(',',':'),ensure_ascii=False).replace('<','\\u003c').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
bootstrap=r'''(()=>{
'use strict';
const data=JSON.parse(document.getElementById('offline-data').textContent);
const routeFiles=data.routes;
const query=new URLSearchParams(location.search);let key=query.get('view')||'overview';if(key==='intuition')key='intuition-'+(query.get('lang')==='en'?'en':'fr');if(!data.pages[key])key='overview';
// Existing shared links to the old root research page retain their destinations.
const oldCAnchors=['results','relation-profile','dictionary-theorem','crossover-theorem','exponent-lab','crossover-lab','dictionary-lab','mechanism','clock-details'];
if(key==='overview'&&oldCAnchors.includes(location.hash.slice(1)))key='research';if(key==='overview'&&location.hash==='#leadership-lab')key='flows';
if(['intuition-fr','intuition-en'].includes(key)&&['#records','#flots'].includes(location.hash))key='flows-'+key;
const selected=new DOMParser().parseFromString(data.pages[key],'text/html'),scripts=[...selected.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'));
selected.querySelectorAll('script').forEach(s=>s.remove());
selected.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{const style=selected.createElement('style');style.textContent=data.assets[link.getAttribute('href')];link.replaceWith(style);});
selected.querySelectorAll('[src],link[rel="icon"]').forEach(el=>{const attr=el.hasAttribute('src')?'src':'href',url=el.getAttribute(attr);if(data.assets[url]?.startsWith('data:'))el.setAttribute(attr,data.assets[url]);});
document.documentElement.lang=selected.documentElement.lang;document.head.replaceChildren(...selected.head.childNodes);document.body.replaceChildren(...selected.body.childNodes);document.body.id=selected.body.id;for(const attr of [...selected.body.attributes])document.body.setAttribute(attr.name,attr.value);window.CORPUS_OFFLINE=true;
const blobs=new Map();
function routeURL(file,hash=''){return '?view='+encodeURIComponent(routeFiles[file])+'&theme='+encodeURIComponent(document.documentElement.dataset.theme||'light')+hash;}
// Reading helpers can create document links after the initial rewrite.
window.CorpusOfflineRoute=routeURL;
for(const a of document.querySelectorAll('a[href]')){
 const href=a.getAttribute('href'),parts=href.split('#'),file=parts[0],hash=parts.length>1?'#'+parts.slice(1).join('#'):'';
 if(routeFiles[file]){a.href=routeURL(file,hash);a.removeAttribute('target');}
 else if(data.downloads[file]){const bytes=Uint8Array.from(atob(data.downloads[file]),c=>c.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'text/plain;charset=utf-8'}));blobs.set(file,url);a.href=url;a.download=file;}
 else if(file==='arithmetique_du_hasard_autonome.html'){a.href=location.pathname;a.download='arithmetique_du_hasard_autonome.html';}
}
// Script elements execute in source order in the current document before DOMContentLoaded.
for(const source of scripts){const script=document.createElement('script');script.textContent=data.assets[source];document.head.append(script);}
if(['light','dark'].includes(query.get('theme')))window.SiteTheme?.set(query.get('theme'));
// Capture original language/page destinations before the normal click handlers rewrite them.
document.addEventListener('click',event=>{
 const a=event.target.closest?.('a[href]');if(!a)return;
 if(a.hasAttribute('data-language-link')){
  event.preventDefault();event.stopImmediatePropagation();const file=a.getAttribute('data-language-page');const chapter=document.querySelector('.contents-menu a[aria-current="location"]');const hash=document.querySelector('.chapter-nav')?.getBoundingClientRect().top<=2&&chapter?chapter.getAttribute('href'):(location.hash||'');location.href=routeURL(file,hash);return;
 }
 const href=a.getAttribute('href');if(href.startsWith('?view=')){const next=new URL(href,location.href);next.searchParams.set('theme',document.documentElement.dataset.theme||'light');a.href=next.pathname+next.search+next.hash;}
},true);
// A fresh document per route prevents global-script collisions and stops old animations.
window.addEventListener('pagehide',()=>{for(const url of blobs.values())URL.revokeObjectURL(url);});
if(location.hash)requestAnimationFrame(()=>{try{document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();}catch{}});
})();'''
# Initial semantic content remains readable if scripting is disabled.
initial=re.search(r'<body\b[^>]*>([\s\S]*?)</body>',pages['overview'],re.I).group(1)
initial_head='<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Rare multiplicative events — public corpus</title><style>'+assets['assets/research.css']+assets['assets/connections.css']+assets['assets/corpus.css']+'</style>'
output='<!DOCTYPE html><html lang="en"><head>'+initial_head+'</head><body id="top">'+initial+'<script type="application/json" id="offline-data">'+data+'</script><script id="offline-bootstrap">'+bootstrap+'</script></body></html>'
args=argparse.ArgumentParser();args.add_argument('--output',default=str(root/'arithmetique_du_hasard_autonome.html'));dest=Path(args.parse_args().output);dest.write_text(output)
print(json.dumps({'path':str(dest),'bytes':dest.stat().st_size,'pages':len(pages),'assets':len(assets),'pdfs':0,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}))
