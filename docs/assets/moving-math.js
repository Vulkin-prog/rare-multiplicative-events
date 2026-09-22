/* Exact rank-one LIMIT models from Moving Prime Environments V1,
   Theorem 7.1, Theorem 10.1, Corollary 10.4. No arithmetic Monte Carlo.
   Suitable as a classic browser script or CommonJS module. */
(function (root) {
  'use strict';
  function check(A, B, d, tau) {
    const gcd=(a,b)=>b?gcd(b,a%b):a;
    if (!Number.isInteger(A)||!Number.isInteger(B)||A<=B||B<1||gcd(A,B)!==1)
      throw new RangeError('A and B must be coprime integers, A > B >= 1.');
    if (!(d>=0)||!Number.isFinite(d)||!(tau>0)||!Number.isFinite(tau))
      throw new RangeError('Require finite d >= 0 and tau > 0.');
  }
  const positive=x=>Math.max(0,x);
  function rankOne(A=2,B=1,d=.6,tau=1,maxCount=24) {
    check(A,B,d,tau);
    if (!Number.isInteger(maxCount)||maxCount<2||maxCount>300) throw new RangeError('maxCount 2..300');
    const U=j=>Math.pow(A,1-j)*positive(tau-(j-1)*d);
    const lambda=j=>positive(U(j)-2*U(j+1)+U(j+2));
    const germRate=tau-positive(tau-d)/A;
    const pmf=new Array(maxCount+1).fill(0); pmf[0]=Math.exp(-germRate);
    for(let n=1;n<=maxCount;n++) {
      let s=0; for(let j=1;j<=n;j++)s+=j*lambda(j)*pmf[n-j];
      pmf[n]=s/n;
    }
    const poisson=[Math.exp(-tau)];
    for(let n=1;n<=maxCount;n++)poisson[n]=poisson[n-1]*tau/n;
    // Geometric tail gives a rigorous omitted-energy bound; no infinite loop at d=0.
    let excess=0, terms=0;
    for(let k=1;k<=200;k++) {
      const overlap=positive(tau-k*d); if(!overlap)break;
      excess+=2*Math.pow(A,-k)*overlap; terms=k;
    }
    const excessTailBound=d===0?2*tau*Math.pow(A,-terms)/(A-1):
      (terms===200?2*tau*Math.pow(A,-terms)/(A-1):0);
    return {A,B,d,tau,mean:tau,germRate,deficit:tau-germRate,
      variance:tau+excess,varianceExcess:excess,excessTailBound,
      maxJump:d===0?Infinity:Math.ceil(tau/d),
      lambda:Array.from({length:maxCount},(_,j)=>lambda(j+1)),
      pmf,tail:positive(1-pmf.reduce((a,b)=>a+b,0)),
      poisson,poissonTail:positive(1-poisson.reduce((a,b)=>a+b,0)),
      voidProbability:pmf[0],poissonVoid:poisson[0]};
  }
  function windowRankOne(A=2,B=1,d=.6,tau=1,a=.25,b=1) {
    check(A,B,d,tau);
    if(!(a>0&&a<b&&b<=1))throw new RangeError('Require 0 < a < b <= 1.');
    const width=Math.log(b/a),ell=Math.log(A/B);
    const horizon=Math.ceil(width/ell);
    if(horizon>1000)throw new RangeError('This interactive model supports at most 1000 spatial channels.');
    const rays=[]; let excess=0;
    // All positive-mass channels are included: k*ell < width and k*d < tau.
    // Test direct inequalities; do not infer exact algebraic relations from sampled phases.
    for(let k=1;k<horizon;k++) {
      const alpha=Math.pow(A,k), beta=Math.pow(B,k), overlap=positive(tau-k*d);
      const start=a/beta,end=b/alpha,length=positive(end-start);
      if(overlap>0&&length>0) {
        const mass=overlap*length; excess+=2*mass;
        rays.push({k,ratio:Math.pow(A/B,k),overlap,mass,
          from:[beta*start,alpha*start],to:[beta*end,alpha*end]});
      }
    }
    // In rank one, surviving positive channels are consecutive, k=1,...,M-1.
    // Use their actual interval lengths at floating-point boundary inputs.
    const capacity=rays.length+1;
    const mean=tau*(b-a);
    return {A,B,d,tau,a,b,width,ell,mean,variance:mean+excess,
      varianceExcess:excess,maxDescendants:capacity,
      poisson:capacity===1,rays,
      pairThresholdSpatial:width/ell,pairThresholdAngular:d===0?Infinity:tau/d};
  }
  function onePrimeDescendants(c=.6,tau=1,x=.2,z=-.3) {
    if(!Number.isFinite(c)||!(tau>0)||!(x>0&&x<=1)||!Number.isFinite(z))throw new RangeError('Invalid germ');
    const descendants=[];
    for(let k=0;k<=Math.floor(Math.log2(1/x))+1;k++) {
      const position=Math.pow(2,k)*x; if(position>1)break;
      const mark=z+k*c;
      // The public sliders specify hundredth units exactly. Preserve strict
      // interval endpoints in that grid instead of rounding them inward.
      const grid=[c,z,tau].every(v=>Math.abs(v*100-Math.round(v*100))<1e-9);
      const hit=grid?Math.abs(Math.round(z*100)+k*Math.round(c*100))*2<Math.round(tau*100):Math.abs(mark)<tau/2;
      descendants.push({k,multiplier:Math.pow(2,k),position,mark,
        interval:[-tau/2-k*c,tau/2-k*c],hit});
    }
    return {c,tau,x,z,descendants,hits:descendants.filter(t=>t.hit).length};
  }
  const api={rankOne,windowRankOne,onePrimeDescendants};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.MovingMath=api;
})(typeof window!=='undefined'?window:globalThis);
