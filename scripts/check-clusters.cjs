const assert=require('node:assert/strict');global.window={};require('../docs/assets/clusters-math.js');const M=window.ClusterMath,near=(x,y,t=1e-12)=>assert(Math.abs(x-y)<t,`${x} != ${y}`);
const expected=[.01898815687615374,.1309835827303305,.25023546646202666,.3037701814195075,.32209230202472583];
for(const [i,m]of [1,2,4,8,16].entries()){
 const r=M.resolution(m);near(r.totalVariation,expected[i]);assert.deepEqual(r.totalHistogram,[24,24,12,4,0]);assert(r.bound.bound<=r.totalVariation);
 // Reconstruct every visible run from the literal 83 signs, independent of the start-indicator formula.
 for(let u=1;u<=64;u++){
  const starts=[];let j=0;while(j<r.word.length){let k=j+1;while(k<r.word.length&&r.word[k]===r.word[j])k++;if(j>0&&k-j>=4)starts.push(j+1);j=k;}
  const indicators=Array.from({length:16},(_,j)=>Number(starts.includes(u+j+1)));assert.deepEqual(M.resolution(m,u).selected.indicators,indicators);
 }
}
assert.deepEqual(M.finiteClock().histogram,[2141,460,460,510,50,50,50]);for(const t of [1,10,15]){const c=M.finiteClock(60,60,t);near(c.pmf.reduce((a,p,i)=>a+p*i,0),6*t/61);near(c.binomial.reduce((a,p)=>a+p,0),1);assert.equal(c.histogram.reduce((a,n)=>a+n,0),3721);}
for(const [N,count,total]of [[128,23,1.8718491880480561],[1024,137,1.927355114616333],[16384,1612,1.9547696271287136],[65536,5709,1.9661077279825996]]){const r=M.cusp(N,1);assert.equal(r.primes,count);near(r.total,total);near(M.cusp(N,1,0).total,1);}
// Independent explicit Pólya–Aeppli coefficient formula (conditional on number of groups).
const fact=n=>n<2?1:n*fact(n-1),choose=(n,k)=>fact(n)/fact(k)/fact(n-k);
for(const scenario of ['free','equal','pinned','torsion'])for(const tau of [.25,2,4]){
 const d=M.countLaw(scenario,tau,100);near(d.pmf.reduce((a,b)=>a+b,0),1);near(d.pmf.reduce((a,p,n)=>a+n*p,0),tau);near(d.pmf.reduce((a,p,n)=>a+(n-tau)**2*p,0),d.variance,1e-10);
 for(let n=1;n<=12;n++){let sum=0;for(let k=1;k<=n;k++)sum+=d.rate**k/fact(k)*choose(n-1,k-1)*d.p**k*d.q**(n-k);near(d.pmf[n],Math.exp(-d.rate)*sum);}
 const groups=M.family(scenario,400);assert.equal(new Set(groups.flatMap(g=>g.points.map(p=>p.n))).size,groups.flatMap(g=>g.points).length);assert(groups.flatMap(g=>g.points).every(p=>p.n<=400&&p.n===5*2**p.a*3**p.b));
}
for(const p of [.25,.5,.75])for(const B of [4,8,12,16])for(let r=0;r<=B;r++){const x=M.erasure(B,p,r);near(x.rectangle/x.a,x.rectangleCost,1e-5);near(x.product/x.a,x.productCost,1e-5);}
near(M.supportBound(2**20,2**14,1).bound,1-(2+1/256)/Math.E);
console.log('PASS: exact clock enumeration, all 64-origin observations and resolution distances, source intensities, compound-Poisson coefficients/moments, erasure and support bounds.');
