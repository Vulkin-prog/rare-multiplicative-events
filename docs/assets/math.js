'use strict';
(function(root){
  function rng(seed){let a=seed>>>0;return function(){a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
  function sieve(n){const spf=new Uint32Array(n+1),primes=[];for(let i=2;i<=n;i++){if(!spf[i]){spf[i]=i;primes.push(i);}for(const p of primes){if(p>spf[i]||i*p>n)break;spf[i*p]=p;}}return {spf,primes};}
  function factors(n,spf){const out=[];while(n>1){const p=spf[n];if(!p)throw Error('Sieve too small');let e=0;while(n%p===0){n/=p;e++;}out.push([p,e]);}return out;}
  function signs(n,primeSigns,spf){const f=new Int8Array(n+1);f[1]=1;for(let i=2;i<=n;i++)f[i]=primeSigns[spf[i]]*f[i/spf[i]];return f;}
  function randomSigns(n,random,sv){const ps={};for(const p of sv.primes)ps[p]=random()<.5?-1:1;return signs(n,ps,sv.spf);}
  function countRuns(f,N,L){const starts=[];let longest=0;for(let x=N;x<2*N;x++){if(f[x]===f[x-1])continue;let end=x+1;while(end<f.length&&f[end]===f[x])end++;const len=end-x;longest=Math.max(longest,len);if(len>=L)starts.push({x,len,sign:f[x],censored:end===f.length});}return {starts,longest};}
  function poissonProbabilities(lambda,max){const a=[Math.exp(-lambda)];for(let k=1;k<=max;k++)a[k]=a[k-1]*lambda/k;return a;}
  function poisson(lambda,random){if(lambda===0)return 0; // Split large means to avoid exp(-lambda) underflow.
    if(lambda>30){let s=0;while(lambda>30){s+=poisson(30,random);lambda-=30;}return s+poisson(lambda,random);}
    const stop=Math.exp(-lambda);let p=1,k=0;do{k++;p*=random();}while(p>stop);return k-1;
  }
  function geometric(random){return Math.floor(-Math.log2(1-random()));}
  function primeCount(L,primes){let n=0;for(const p of primes){if(p>L)break;n++;}return n;}
  function selfOverlaps(word){const out=[];for(let d=1;d<word.length;d++)out.push({d,match:word.slice(d)===word.slice(0,-d),weight:2**(-d)});return out;}
  function normalCDF(x){const z=Math.abs(x)/Math.sqrt(2),t=1/(1+.3275911*z);const erf=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-z*z);return (1+(x<0?-erf:erf))/2;}
  function immigrationDeath(c,T,random){let time=0,z=poisson(c,random);const path=[{t:0,z}];while(time<T){time+=-Math.log(1-random())/(c+z);if(time>T)break;z+=random()<c/(c+z)?1:-1;path.push({t:time,z});}path.push({t:T,z});return path;}
  function recordState(lengths,signs,m){let start=1,visibleMax=0,holder=1,fullMax=0,episodes=0;const records=[];for(let i=0;i<lengths.length;i++){const q=lengths[i],visible=Math.max(0,Math.min(q,m-start+1));if(visible>visibleMax){visibleMax=visible;holder=signs[i];}if(q>fullMax){const recognition=start+fullMax;if(recognition<=m){episodes++;records.push({i,recognition,q});}}fullMax=Math.max(fullMax,q);start+=q;}return {max:visibleMax,holder,episodes,records};}
  const api={rng,sieve,factors,signs,randomSigns,countRuns,poissonProbabilities,poisson,geometric,primeCount,selfOverlaps,normalCDF,immigrationDeath,recordState};
  root.MathLab=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
