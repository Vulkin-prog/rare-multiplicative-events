'use strict';
// A single unit-intensity planar Poisson cloud over the complete queried domain.
window.ResearchFlows = (() => {
  function cloud(c,seed,S=3){
    if(![2,4,8,16].includes(c)||S!==3)throw new RangeError('Use mean 2, 4, 8 or 16 and a three-doubling window.');
    const random=window.ResearchMath.rng(seed),height=c*2**S,stop=Math.exp(-height);let product=1,n=-1;
    do{product*=random();n++;}while(product>stop);
    const points=Array.from({length:n},()=>{const u=random()+.5/4294967296,z=(random()+.5/4294967296)*height;return {u,z,entry:Math.log2(u)+S,exit:z?Math.log2(height/z):Infinity};});
    const state={c,seed,S,height,points};
    // Use the same event times as path(): recomputing u and z from logarithms
    // can otherwise exclude an entering point or retain an exiting one by one ulp.
    state.at=t=>{if(!Number.isFinite(t)||t<0||t>S)throw new RangeError('Time must be between zero and three doublings.');const width=2**(t-S),ceiling=height*2**(-t);return {t,width,ceiling,fixed:points.filter(p=>p.entry<=t).length,scale:points.filter(p=>p.entry<=t&&p.exit>t).length,meanFixed:c*2**t,meanScale:c};};
    state.path=kind=>{let n=state.at(0)[kind];const rows=[[0,n]],events=[];for(const p of points){if(p.entry>0&&p.entry<=S&&(kind==='fixed'||p.exit>p.entry))events.push([p.entry,1]);if(kind==='scale'&&p.exit>0&&p.exit<=S&&p.entry<p.exit)events.push([p.exit,-1]);}events.sort((a,b)=>a[0]-b[0]);for(const [t,delta] of events){rows.push([t,n]);n+=delta;rows.push([t,n]);}rows.push([S,n]);return rows;};
    return state;
  }
  return Object.freeze({cloud});
})();
