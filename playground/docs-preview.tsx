// Load interactive examples only on component pages and own their reset lifecycle; D19/D90.
import {createSignal,Show,onSettled,onCleanup} from 'solid-js';
import {Dynamic,type JSX} from '@solidjs/web';
import {Button} from 'shadcn-solidjs-theme/ui/button';
type Examples=Record<string,()=>JSX.Element>;
/** A reset replaces the example owner, disposing its drafts, listeners and overlays. */
export function DocsPreview(props:{id:string;name:string}){
 const [examples,setExamples]=createSignal<Examples>();const [error,setError]=createSignal(false);const [generation,setGeneration]=createSignal(1);let alive=true;
 onCleanup(()=>{alive=false;});
 onSettled(()=>{void import('./component-previews').then(module=>{if(!alive)return;if(!module.componentPreviews[props.id]){setError(true);return;}setExamples(module.componentPreviews);}).catch(()=>{if(alive)setError(true);});});
 return <section id="live-preview" class="docs-live" aria-label={`${props.name} live preview`}>
  <div class="docs-live-header"><h2>Live preview</h2><Button size="sm" variant="ghost" disabled={!examples()} onClick={()=>setGeneration(value=>value+1)}>Reset preview</Button></div>
  <div class="docs-live-body" aria-busy={!examples()&&!error()?'true':undefined}>
   <Show when={error()}><div role="alert"><p>The preview could not load. Reload this page to try again.</p><Button variant="outline" onClick={()=>location.reload()}>Reload page</Button></div></Show>
   <Show when={!examples()&&!error()}><p role="status">Loading live preview…</p></Show>
   <Show when={examples()}><Show when={generation()} keyed>{generation=> <div data-live-component={props.id} data-preview-generation={generation}><Dynamic component={examples()?.[props.id]}/></div>}</Show></Show>
  </div>
 </section>;
}
