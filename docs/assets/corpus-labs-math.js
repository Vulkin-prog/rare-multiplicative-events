/* Source-linked exact finite calculations; no external state. */
(function(root){
 'use strict';
 function rng(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
 function poissonPMF(lambda,max=12){const p=[Math.exp(-lambda)];for(let j=1;j<=max;j++)p[j]=p[j-1]*lambda/j;return p;}
 function toy(c=.5,k=64,max=12){const b=Math.max(0,1-Math.abs(c)),q=[1-(2-b)/k,2*(1-b)/k,b/k];let finite=[1,...new Array(max).fill(0)];for(let i=0;i<k;i++){const next=new Array(max+1).fill(0);for(let n=0;n<=max;n++)for(let j=0;j<=2;j++)if(n>=j)next[n]+=q[j]*finite[n-j];finite=next;}
 const limit=[Math.exp(-2+b)];for(let n=1;n<=max;n++)limit[n]=(2*(1-b)*limit[n-1]+(n>1?2*b*limit[n-2]:0))/n;
 return {b,k,c,finite,limit,reference:poissonPMF(2,max),void:limit[0],variance:2+2*b,bound:Math.min(1,(2-b)**2/k)};}
 function toySample(c,k,seed){const random=rng(seed),pairs=[];for(let i=0;i<k;i++){const angle=(random()-.5)*k,A=Math.abs(angle)<.5,B=Math.abs(angle+c)<.5;if(A||B)pairs.push({i,x:.25+(i+.5)/(12*k),A,B});}return pairs;}
 function fixedStrip(M=32768,L=10,h=2048,seed=7721){
  if(!Number.isInteger(M)||M<64||M>262144||!Number.isInteger(L)||L<2||L>30||!Number.isInteger(h)||h<1||h>M-L)throw new RangeError('Invalid finite strip parameters');
  const spf=new Uint32Array(M+1),signs=new Int8Array(M+1),r=rng(seed);signs[1]=1;
  for(let n=2;n<=M;n++){if(!spf[n]){spf[n]=n;for(let j=n*n;j<=M;j+=n)if(!spf[j])spf[j]=n;signs[n]=r()<.5?-1:1;}else signs[n]=signs[spf[n]]*signs[n/spf[n]];}
  const n=M-L,starts=new Uint8Array(n+1),locations=[];let run=1;
  for(let x=M-1;x>=2;x--){run=signs[x]===signs[x+1]?run+1:1;if(x<=n+1&&run>=L&&signs[x-1]!==signs[x]){starts[x-1]=1;locations.push(x-1);}}
  locations.sort((a,b)=>a-b);let count=0;for(let j=1;j<=h;j++)count+=starts[j];const counts=new Uint16Array(n-h+1),hist=[];
  for(let u=0;u<=n-h;u++){if(u)count+=starts[u+h]-starts[u];counts[u]=count;hist[count]=(hist[count]||0)+1;}
  const p=hist.map(x=>(x||0)/counts.length);for(let i=0;i<p.length;i++)if(!Number.isFinite(p[i]))p[i]=0;
  const lambda=h*2**(-L),reference=poissonPMF(lambda,Math.max(24,p.length+12));let overlap=0;for(let i=0;i<p.length;i++)overlap+=Math.min(p[i]||0,reference[i]||0);
  return {M,L,h,n,seed,locations,counts,hist,p,lambda,reference,tv:1-overlap,origins:counts.length};
 }
 function primeResolution(k,N,alpha=.75,tau=1,cells=4){const q=(tau/N)**(1-alpha),lambda=k*q;let collision=q-Math.log1p(q);if(q<1e-4){collision=0;for(let j=2;j<=10;j++)collision+=(j%2? -1:1)*q**j/j;}
  const lower=-Math.expm1(-k*collision),upper=-Math.expm1(-lambda)*q,lo=Math.floor(k/cells),extra=k%cells;
  const cellUpper=Math.min(1,q*((cells-extra)*(-Math.expm1(-lo*q))+extra*(-Math.expm1(-(lo+1)*q))));
  return {q,lambda,lower,upper,cellUpper};}
 const api={rng,poissonPMF,toy,toySample,fixedStrip,primeResolution};root.CorpusMath=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
