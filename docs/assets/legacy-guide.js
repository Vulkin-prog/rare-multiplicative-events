'use strict';
(() => {
  const hash=location.hash;
  const page=/^#(?:records|flots)(?:$|-)/.test(hash)?document.body.dataset.flow:hash==='#articles'?'sources.html':document.body.dataset.c;
  location.replace(page+location.search+(hash==='#articles'?'':hash));
})();
