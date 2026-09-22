'use strict';
// Pure finite combinatorics and numerical evaluations. No UI or network dependency.
window.ResearchMath = (() => {
  function rng(seed) { let a=seed>>>0; return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}; }
  function sieve(max) {const spf=new Uint32Array(max+1),primes=[];for(let p=2;p<=max;p++){if(spf[p])continue;spf[p]=p;primes.push(p);if(p*p<=max)for(let n=p*p;n<=max;n+=p)if(!spf[n])spf[n]=p;}return {spf,primes};}
  function wilson(k,n){if(!n)return [0,1];const z=1.959963984540054,p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [Math.max(0,c-h),Math.min(1,c+h)];}
  function crossoverSetup(L,seed){
    if(!Number.isInteger(L)||L<2||L>22)throw new RangeError("Run length must be an integer from 2 to 22.");
    const count=sieve(L).primes.length,alpha=2**(-count),center=2**(L-count);
    const prefixes=[...new Set(Array.from({length:17},(_,j)=>Math.max(L,Math.round(center*2**(-2+j/4)))))];
    const max=prefixes[prefixes.length-1],{spf,primes}=sieve(max),small=primes.filter(p=>p<=L),f=new Int8Array(max+1),random=rng(seed);f[1]=1;
    const state={L,seed,alpha,count,prefixes,max,hits:new Uint32Array(prefixes.length),trials:0};
    state.trial=()=>{
      let positive;do{positive=true;for(const p of small){f[p]=random()<.5?-1:1;if(f[p]<0)positive=false;}}while(positive);
      let last=1,streak=1;
      for(let n=2;n<=max;n++){
        const p=spf[n];if(p===n){if(n>L)f[n]=random()<.5?-1:1;}else f[n]=f[p]*f[n/p];
        if(f[n]===last)streak++;else{last=f[n];streak=1;}
        if(streak===L){for(let j=0;j<prefixes.length;j++)if(n<=prefixes[j])state.hits[j]++;break;}
      }
      state.trials++;
    };
    state.results=()=>prefixes.map((M,j)=>{const s=L-Math.log2(M)-count,k=state.hits[j],n=state.trials,w=r=>alpha/(alpha+(1-alpha)*r),[lo,hi]=wilson(k,n);return {M,s,k,n,alpha,lambda:M*2**(-L),estimate:n?w(k/n):null,low:n?w(hi):0,high:n?w(lo):1,theory:1/(1+2**(-s))};});
    return state;
  }
  function parseDictionary(text){
    const rows=text.trim().split(/\r?\n/).map(s=>s.replace(/\s+/g,'').replace(/[−–]/g,'-')).filter(Boolean);
    if(!rows.length)throw new Error('Enter at least one word.');
    if(rows.length>24)throw new Error('This interactive matrix accepts at most 24 words.');
    const words=rows.map((s,i)=>{if(/^[01]+$/.test(s))return s.replace(/0/g,'-').replace(/1/g,'+');if(/^[+-]+$/.test(s))return s;throw new Error('Word '+(i+1)+': use only + and −, or only 0 and 1.');});
    const B=words[0].length;
    if(B<2||B>96)throw new Error('Use words of length 2 to 96.');
    if(words.some(w=>w.length!==B))throw new Error('All words must have the same length.');
    if(new Set(words).size!==words.length)throw new Error('The dictionary must be a set: remove duplicate words.');
    return words;
  }
  function overlap(words){
    const m=words.length,B=words[0].length,A=Array.from({length:m},()=>Array(m).fill(0)),H=Array.from({length:B},()=>Array.from({length:m},()=>Array(m).fill(0))),shiftWeight=Array(B).fill(0);
    for(let d=1;d<B;d++)for(let i=0;i<m;i++)for(let j=0;j<m;j++)if(words[i].slice(d)===words[j].slice(0,B-d)){H[d][i][j]=1;A[i][j]+=2**(-d);shiftWeight[d]+=2**(-d)/m;}
    return {words,m,B,A,H,shiftWeight,omega:A.flat().reduce((a,b)=>a+b,0)/m};
  }
  function overshootClocks(L,maxH=32,maxK=8){
    if(!Number.isInteger(L)||L<2||L>200)throw new RangeError('Choose an integer L between 2 and 200.');
    const primes=sieve(L+256).primes,pi=primes.filter(p=>p<=L).length,next=primes.filter(p=>p>L);
    const integer=Array.from({length:maxH+1},(_,h)=>{const k=next.filter(p=>p<=L+h).length;return {x:h,k,boundary:2**(-k),bulk:2**(-h),endpoint:L+h};});
    const own=Array.from({length:maxK+1},(_,k)=>({x:k,k,boundary:2**(-k),bulk:2**(-k),endpoint:k?next[k-1]:L}));
    return {L,pi,nextPrime:next[0],integer,own};
  }
  const coefficients=[];let factorial=2;for(let n=3;n<=20;n++){factorial*=n;coefficients.push((n%2?1:-1)*(2**n-2*n)/factorial);}
  function summand(a){if(a<.5){let p=coefficients[coefficients.length-1];for(let j=coefficients.length-2;j>=0;j--)p=coefficients[j]+a*p;return a*p;}return (-Math.expm1(-2*a)-2*a*Math.exp(-a))/(a*a);}
  function leadershipVariance(theta){const phase=((theta%1)+1)%1;let sum=0,compensation=0;for(let q=-32;q<=52;q++){const a=2**(phase-q-1),value=summand(a)-compensation,next=sum+value;compensation=(next-sum)-value;sum=next;}return sum;}
  return Object.freeze({rng,sieve,wilson,crossoverSetup,parseDictionary,overlap,overshootClocks,leadershipVariance,leadershipMean:2-1/Math.log(2)});
})();
