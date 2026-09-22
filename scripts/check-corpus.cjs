'use strict';
const assert=require('node:assert/strict');
const M=require('../docs/assets/corpus-labs-math.js'),E=require('../docs/assets/moving-math.js'),F=require('../docs/assets/flow-compression-math.js');
for(const c of [0,.5,1,1.5])for(const k of [16,64,256]){const r=M.toy(c,k,64);assert(Math.abs(r.finite.reduce((a,p,i)=>a+i*p,0)-2)<1e-11);assert(Math.abs(r.limit.reduce((a,p,i)=>a+i*p,0)-2)<1e-11);assert(Math.abs(r.limit[0]-Math.exp(-2+r.b))<1e-14);}
const sample=M.fixedStrip(2048,5,64,123),random=M.rng(123),primes=[],primeSign={};
for(let n=2;n<=2048;n++){let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}if(prime){primes.push(n);primeSign[n]=random()<.5?-1:1;}}
const signs=[0,1];for(let n=2;n<=2048;n++){let rest=n,sign=1;for(const p of primes){if(p>rest)break;while(rest%p===0){sign*=primeSign[p];rest/=p;}}signs[n]=sign;}
const starts=[];for(let j=1;j<=2048-5;j++){const x=j+1;starts[j]=signs[x-1]!==signs[x]&&[0,1,2,3,4].every(k=>signs[x+k]===signs[x])?1:0;}
for(let u=0;u<sample.origins;u++){let count=0;for(let j=u+1;j<=u+64;j++)count+=starts[j];assert.equal(sample.counts[u],count);}
const hermite=E.rankOne(2,1,.6,1);assert(Math.abs(hermite.variance-1.4)<1e-12);assert(Math.abs(hermite.pmf[0]-Math.exp(-.8))<1e-12);assert(E.windowRankOne(3,1,.2,1,.4,1).poisson);assert.equal(E.windowRankOne(3,2,.2,1,.4,1).maxDescendants,3);assert(Math.abs(E.windowRankOne(3,2,.2,1,.4,1).variance-62/75)<1e-12);
for(let ci=-125;ci<=125;ci++)for(let zi=-200;zi<=100;zi++)for(const p of E.onePrimeDescendants(ci/100,1,.05,zi/100).descendants)assert.equal(p.hit,2*Math.abs(zi+p.k*ci)<100);
const exact=F.finiteCovariance(10,.5),mc=F.simulate(10,.5,2000,1773);let integral=0;const steps=10000,dt=10/steps;for(let k=0;k<=steps;k++){const t=k*dt;integral+=(k===0||k===steps?1:k%2?4:2)*(10-t)*Math.exp(-Math.log(2)*t/2);}integral*=2*dt/(3*10);assert(Math.abs(exact.cVariance-integral)<1e-10);assert(Math.abs(mc.empirical.covariance[1][1]-exact.cVariance)<.45);assert.equal(F.finiteCovariance(10,0).cVariance,F.finiteCovariance(10,.8).cVariance);assert(Math.abs(F.limit.covariance-4/Math.log(2))<1e-12);
console.log('PASS corpus: elementary count moments, brute-force fixed-strip counts, rank-one/crop laws, strict target endpoints and finite compression covariance.');

// Regression: the reader and the step path must agree at entry/exit instants.
// Comparing coordinates after an exp(log(u)) round trip used to lose a point.
global.window={};require('../docs/assets/research-math.js');require('../docs/assets/flows-math.js');
let eventChecks=0;
for(const c of [2,4,8,16])for(const seed of [1,19,20260909]){
 const cloud=window.ResearchFlows.cloud(c,seed);
 const times=[0,3,...cloud.points.flatMap(p=>[p.entry,p.exit]).filter(t=>t>=0&&t<=3)];
 for(const kind of ['fixed','scale']){
  const path=cloud.path(kind);
  for(const t of times){
   let count=path[0][1];for(const [at,n]of path){if(at>t)break;count=n;}
   assert.equal(cloud.at(t)[kind],count,`cloud mean ${c}, seed ${seed}, ${kind}, t=${t}`);eventChecks++;
  }
 }
}
console.log(`PASS cloud: ${eventChecks} exact event/end-point reader counts match their step paths.`);
