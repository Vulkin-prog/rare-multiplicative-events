'use strict';
window.ClusterMath=(()=>{
  const finite=(x,lo,hi)=>{if(!Number.isFinite(x)||x<lo||x>hi)throw new RangeError('Parameter outside the supported range.');return x;};
  let primePrefix;
  function primeCount(n){n=Math.floor(finite(n,0,2000000));if(!primePrefix){const mark=new Uint8Array(2000001);primePrefix=new Uint32Array(2000001);for(let p=2;p<=2000000;p++){if(!mark[p]){if(p*p<=2000000)for(let k=p*p;k<=2000000;k+=p)mark[k]=1;}primePrefix[p]=primePrefix[p-1]+(!mark[p]?1:0);}}return primePrefix[n];}
  function cusp(N,tau,order=1){finite(N,100,1000000);finite(tau,.25,4);if(!Number.isInteger(N))throw new RangeError('Integer N required.');finite(order,0,2);if(!Number.isInteger(order))throw new RangeError("Integer order required.");const primes=primeCount(2*N-1)-primeCount(N-1),a=tau/N,q=a*(1+(order>=1?Math.log(1/a):0)+(order===2?Math.log(1/a)**2/2:0));return {N,tau,order,primes,a,q,primeShare:primes/N,primeMass:primes*q,haarPrimeMass:primes*a,compositeMass:(N-primes)*a,total:(N-primes)*a+primes*q};}
  const scenarios=Object.freeze({free:{A:Infinity,B:1,key:(a,b)=>a+','+b},equal:{A:3,B:2,key:(a,b)=>String(a+b)},pinned:{A:2,B:1,key:(a,b)=>String(b)},torsion:{A:4,B:1,key:(a,b)=>(a%2)+','+b}});
  function family(scenario,N=180,core=5){const s=scenarios[scenario];if(!s)throw new RangeError('Unknown relation.');finite(N,20,400);const groups=new Map();for(let a=0;2**a*core<=N;a++)for(let b=0;2**a*3**b*core<=N;b++){const multiplier=2**a*3**b,key=s.key(a,b),point={a,b,multiplier,n:core*multiplier,key};if(!groups.has(key))groups.set(key,[]);groups.get(key).push(point);}return [...groups].map(([key,points])=>({key,points:points.sort((a,b)=>a.n-b.n)})).sort((a,b)=>a.points[0].n-b.points[0].n);}
  function countLaw(scenario,tau=2,max=28){const {A}=scenarios[scenario]||{};if(!A)throw new RangeError('Unknown relation.');finite(tau,.25,4);const q=1/A,p=1-q,rate=tau*p,jump=Array.from({length:max+1},(_,j)=>j?tau*p*p*q**(j-1):0),pmf=[Math.exp(-rate)],poisson=[Math.exp(-tau)];for(let n=1;n<=max;n++){let v=0;for(let j=1;j<=n;j++)v+=j*jump[j]*pmf[n-j];pmf[n]=v/n;poisson[n]=poisson[n-1]*tau/n;}return {A,tau,p,q,rate,variance:tau*(1+q)/(1-q),pmf,poisson,tail:Math.max(0,1-pmf.reduce((a,b)=>a+b,0)),poissonTail:Math.max(0,1-poisson.reduce((a,b)=>a+b,0))};}
  function erasure(B,p,r){finite(B,2,16);finite(p,.25,.75);finite(r,0,B);if(!Number.isInteger(B)||!Number.isInteger(r))throw new RangeError('Integer coordinates required.');const a=p**B;return {B,p,r,a,rectangle:p**(B-r),product:r?1:a,rectangleCost:p**(-r),productCost:r?1/a:1};}
  function supportBound(origins,cells,tau){finite(origins,1,2**30);finite(cells,1,2**20);finite(tau,.25,4);const lmax=tau/cells;if(lmax>1)return null;let point=Math.exp(-tau),cdf=point,best={bound:0,k:0};for(let k=1;k<=64;k++){if(k>1){point*=tau/(k-1);cdf+=point;}const tail=Math.max(0,1-cdf),bound=tail-origins*Math.exp(-tau)*lmax**k;if(bound>best.bound)best={bound,k};}return best;}

  const fixedWord='+-++--++++--+++--+-+--+-+-------+----++++-+---+---+-+-+-+--++-++-+-+++-++-+++++-+++';
  const resolutionCache=new Map();
  function resolution(cells=1,origin=1){
    if(![1,2,4,8,16].includes(cells)||!Number.isInteger(origin)||origin<1||origin>64)throw new RangeError('Unsupported observation.');
    const width=16/cells;
    let data=resolutionCache.get(cells);
    if(!data){
      const samples=[],histogram=new Map(),totalHistogram=Array(5).fill(0),matrix=Array.from({length:cells},()=>Array(cells).fill(0));
      for(let u=1;u<=64;u++){
        const indicators=Array.from({length:16},(_,i)=>{const n=u+i+1;return Number(fixedWord[n-2]!==fixedWord[n-1]&&[0,1,2,3].every(j=>fixedWord[n-1+j]===fixedWord[n-1]));});
        const counts=Array.from({length:cells},(_,c)=>indicators.slice(c*width,(c+1)*width).reduce((a,b)=>a+b,0)),total=counts.reduce((a,b)=>a+b,0),key=counts.join(',');
        samples.push({u,indicators,counts,total});totalHistogram[total]++;histogram.set(key,(histogram.get(key)||0)+1);
        for(let j=0;j<16;j++)for(let k=0;k<16;k++)if(Math.abs(j-k)>=4)matrix[Math.floor(j/width)][Math.floor(k/width)]+=(indicators[j]*indicators[k]/64-1/(64*256));
      }
      const fact=n=>n<2?1:n*fact(n-1);let overlap=0;
      for(const [key,count]of histogram){const v=key.split(',').map(Number),target=Math.exp(-1)*v.reduce((a,n)=>a*(1/cells)**n/fact(n),1);overlap+=Math.min(count/64,target);}
      data={cells,width,samples,histogram,totalHistogram,totalVariation:1-overlap,packet:matrix.flat().reduce((a,b)=>a+Math.abs(b),0),matrix,distinct:histogram.size,bound:supportBound(64,cells,1)};resolutionCache.set(cells,data);
    }
    return {...data,origin,selected:data.samples[origin-1],word:fixedWord};
  }
  function finiteClock(u=17,v=10,t=10){
    [u,v].forEach(x=>{finite(x,0,60);if(!Number.isInteger(x))throw new RangeError('Integer clock position required.');});finite(t,1,15);if(!Number.isInteger(t))throw new RangeError('Integer target width required.');
    const rows=[{sites:[5],phase:v},{sites:[10,15],phase:(u+v)%61},{sites:[20,30,45],phase:(2*u+v)%61}].map(r=>({...r,hit:r.phase<t}));
    const histogram=Array(7).fill(0);for(let a=0;a<61;a++)for(let b=0;b<61;b++){const total=Number(b<t)+2*Number((a+b)%61<t)+3*Number((2*a+b)%61<t);histogram[total]++;}
    const p=t/61,binomial=[(1-p)**6];for(let j=1;j<=6;j++)binomial[j]=binomial[j-1]*(7-j)/j*p/(1-p);
    return {u,v,t,rows,histogram,pmf:histogram.map(n=>n/(61*61)),binomial,mean:6*p,hits:rows.reduce((sum,r)=>sum+(r.hit?r.sites.length:0),0)};
  }

  return Object.freeze({resolution,finiteClock,cusp,family,countLaw,erasure,supportBound,scenarios});
})();
