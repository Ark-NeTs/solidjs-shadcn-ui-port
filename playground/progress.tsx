// Public Progress examples with owner-controlled work and an actual Loading boundary; D19/D90.
import { createMemo, createSignal, Loading, Show } from 'solid-js';
import { Progress } from 'shadcn-solidjs-theme/ui/progress';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Input } from 'shadcn-solidjs-theme/ui/input';
/** Read a real promise only below its Loading boundary. */
function Ready(props:{promise:Promise<string>}){const result=createMemo(()=>props.promise);return <p data-testid="progress-ready">{result()}</p>;}
/** Keep completion controls outside the pending subtree and leave persistence to the application. */
export function ProgressExamples(){
 const dark=new URLSearchParams(location.search).has('dark');
 const [value,setValue]=createSignal<number|null>(25);const [max,setMax]=createSignal(100);const [mounted,setMounted]=createSignal(true);const [rtl,setRtl]=createSignal(false);const [custom,setCustom]=createSignal(false);
 let resolve!:(value:string)=>void;const promise=new Promise<string>(done=>{resolve=done;});const [pendingMounted,setPendingMounted]=createSignal(true);
 return <div class={dark?'dark min-h-screen bg-background text-foreground':'min-h-screen bg-background text-foreground'} style={custom()?{'--primary':dark?'oklch(0.78 0.1 285)':'oklch(0.4 0.15 285)'}:{}}><main>
  <a class="underline text-sm" href="/">All components</a><h1 class="mt-6 text-3xl font-semibold">Work in progress</h1><p class="mt-3 text-muted-foreground">Show known progress clearly, and say when the total is still unknown.</p>
  <section class="demo-section" aria-labelledby="transfer-title"><h2 id="transfer-title">File transfer</h2><p id="transfer-help">The application owns the completed amount and total.</p><div dir={rtl()?'rtl':'ltr'} class="my-6"><Show when={mounted()}><Progress id="transfer-progress" aria-labelledby="transfer-title" aria-describedby="transfer-help" value={value()} max={max()} getValueLabel={(v,m)=>`${v} of ${m} files`}/></Show></div><p data-testid="progress-value">{value()===null?'Total unknown':`${value()} of ${max()} files`}</p>
   <div class="samples mt-4"><Button onClick={()=>setValue(75)}>Advance transfer</Button><Button onClick={()=>setValue(max())}>Complete transfer</Button><Button variant="outline" onClick={()=>setValue(0)}>Restart transfer</Button><Button variant="outline" onClick={()=>setValue(null)}>Unknown total</Button><Button variant="outline" onClick={()=>setMax(200)}>Use total 200</Button><Button variant="outline" onClick={()=>setRtl(!rtl())}>Reverse direction</Button><Button variant="outline" onClick={()=>setMounted(!mounted())}>Toggle progress mounting</Button><Button variant="outline" onClick={()=>setCustom(!custom())}>Custom progress colors</Button></div>
  </section>
  <section class="demo-section" aria-labelledby="states-title"><h2 id="states-title">Every stage</h2><div class="grid gap-6"><div><p class="mb-3">Not started</p><Progress aria-label="Not started" value={0}/></div><div><p class="mb-3">Fractional work</p><Progress aria-label="Fractional work" value={2.5} max={10}/></div><div><p class="mb-3">Finished</p><Progress aria-label="Finished" value={100}/></div><div><p class="mb-3">Waiting for the total</p><Progress aria-label="Waiting for the total"/></div></div></section>
  <section class="demo-section" aria-labelledby="loading-title"><h2 id="loading-title">While content loads</h2><label for="progress-draft">Keep your draft</label><Input id="progress-draft" class="my-3" defaultValue="My unsaved notes"/><Show when={pendingMounted()}><Loading fallback={<Progress aria-label="Loading report" class="my-6"/>}><Ready promise={promise}/></Loading></Show><div class="samples mt-4"><Button onClick={()=>resolve('Report is ready')}>Resolve report</Button><Button variant="outline" onClick={()=>setPendingMounted(false)}>Unmount report</Button></div></section>
  <Button variant="outline">After progress examples</Button>
 </main></div>;
}
