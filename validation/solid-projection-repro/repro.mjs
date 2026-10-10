// Minimal reproduction: a keyed createProjection reported as WASTED_RECOMPUTE although every run changes its keys.
// Run from the repository root: node --conditions=browser --conditions=development validation/solid-projection-repro/repro.mjs
import {attribution} from 'solid-js/attribution';
import {createEffect,createMemo,createProjection,createRoot,createSignal,flush} from 'solid-js';

const findings=[];
const warn=console.warn;
console.warn=(...args)=>{const text=args.map(String).join(' ');if(text.includes('WASTED_RECOMPUTE'))findings.push(text.split('\n')[0]);};
// Probe settings: Solid's default run rules with a 0ms budget, so the check depends only on run counts.
attribution.enable({log:false,wastedRecompute:{minRuns:5,ratio:0.8,budgetMs:0,windowMs:1000}});

function run(label,build){
 findings.length=0;const updates=[];
 const [active,setActive]=createSignal('a',{name:`${label}.active`});
 const dispose=createRoot(dispose=>{
  const isOpen=build(active);
  for(const key of ['a','b','c'])createEffect(()=>isOpen(key),open=>{updates.push(`${key}:${open}`);});
  return dispose;
 });
 flush();
 // Six one-of-three switches: every switch closes one key and opens another.
 for(const key of ['b','c','a','b','c','a']){setActive(key);flush();}
 dispose();
 console.log(`\n${label}: ${updates.length} effect updates`);
 console.log(findings.length?findings.map(line=>`  ${line}`).join('\n'):'  no WASTED_RECOMPUTE');
}

// 1. Keyed map, as the diagnostics guide recommends for one-of-many selection (HUGE_FAN_OUT section).
//    Each run deletes the previous key and sets the new one, so the store changes every time.
run('projection',active=>{
 const open=createProjection(draft=>{const current=active();for(const key of Object.keys(draft))if(key!==current)delete draft[key];draft[current]=true;},{},{name:'projection.open'});
 return key=>open[key]===true;
});

// 2. Control: one comparison memo per key. Reruns that keep the same answer are genuinely wasted.
run('per-key memos',active=>{
 const memos=new Map(['a','b','c'].map(key=>[key,createMemo(()=>active()===key,{name:`memo.${key}`})]));
 return key=>memos.get(key)();
});

attribution.enable()();console.warn=warn;
