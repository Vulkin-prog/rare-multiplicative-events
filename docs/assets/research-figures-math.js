'use strict';
window.ResearchFigureMath = (() => {
  function exponentBudget(alpha,epsilon=0,capped=true){
    if(!Number.isFinite(alpha)||alpha<0||alpha>.6||![0,.01,.03].includes(epsilon))throw new RangeError('Choose a growth exponent from 0 to 0.6 and a supported epsilon.');
    const first=-1/3+alpha/6+epsilon,nonterminal=-1/3+2*alpha/3+epsilon,rawTerminal=-1/3+alpha+epsilon,cappedTerminal=-1/3+epsilon;
    const terminal=capped?cappedTerminal:rawTerminal,worst=Math.max(first,nonterminal,terminal);
    return {alpha,epsilon,capped,first,nonterminal,rawTerminal,cappedTerminal,terminal,worst,decays:worst< -1e-12,rawBoundary:1/3-epsilon,cappedBoundary:.5-1.5*epsilon};
  }
  const scenarios=Object.freeze({tie:[4,7,7,2,11,1],episode:[3,2,9,1],paper:[4,2,7,7,11,1]});
  function recordWord(name='tie'){
    const lengths=scenarios[name];if(!lengths)throw new RangeError('Unknown record scenario.');
    let start=1,H=0;
    const runs=lengths.map((q,i)=>{const r={index:i,start,length:q,sign:i%2?-1:1,previous:H,record:q>H,recognition:q>H?start+H:null};start+=q;H=Math.max(H,q);return r;});
    const length=start-1,word=runs.flatMap(r=>Array(r.length).fill(r.sign));
    function at(m){
      if(!Number.isInteger(m)||m<1||m>length)throw new RangeError('Choose a visible prefix inside the word.');
      let visible=0,holder=null,announced=0,announcedHolder=null;
      for(const r of runs){if(r.start>m)break;const seen=Math.min(r.length,m-r.start+1);if(seen>visible){visible=seen;holder=r;}if(r.length>announced){announced=r.length;announcedHolder=r;}}
      const recognized=runs.filter(r=>r.record&&r.recognition<=m),current=runs.find(r=>r.start<=m&&m<r.start+r.length),positive=recognized.filter(r=>r.sign===1).length;
      return {m,visible,holder,announced,announcedHolder,recognized:recognized.length,positive,negative:recognized.length-positive,current,currentSeen:m-current.start+1};
    }
    return {name,length,word,runs,at};
  }
  return Object.freeze({exponentBudget,recordWord});
})();
