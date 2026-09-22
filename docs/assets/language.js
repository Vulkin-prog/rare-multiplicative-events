'use strict';
// Static translations; both editions use exactly the same interaction code.
const SiteText=(() => {
  const english=document.documentElement.lang==='en';
  const text=(key,fallback)=>english?(window.SiteEnglish?.[key]??fallback):fallback;
  text.template=key=>(parts,...values)=>{
    const translated=english?(window.SiteEnglish?.[key]??parts):parts;
    let result=translated[0];
    for(let i=0;i<values.length;i++)result+=String(values[i])+translated[i+1];
    return result;
  };
  return text;
})();
