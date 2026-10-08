// Evaluate unpatched Progress state, naming and fill updates on the pinned runtime; D19/D90.
import { createSignal,Show } from 'solid-js';
import { render } from '@solidjs/web';
import * as Progress from '@kobalte/core/progress';
/** Drive lifecycle and range changes with ordinary controls. */
function Probe(){
 const [value,setValue]=createSignal(25);const [indeterminate,setIndeterminate]=createSignal(false);const [max,setMax]=createSignal(100);const [mounted,setMounted]=createSignal(true);
 return <><span id="external-label">External progress</span><Show when={mounted()}><Progress.Root id="probe" value={value()} maxValue={max()} indeterminate={indeterminate()} aria-label="Transfer"><Progress.Track style={{width:'300px',height:'8px',background:'#ddd'}}><Progress.Fill data-testid="fill" style={{height:'100%',width:'var(--kb-progress-fill-width)',background:'#333'}}/></Progress.Track></Progress.Root><Progress.Root id="external" value={value()} aria-labelledby="external-label"><Progress.Track><Progress.Fill/></Progress.Track></Progress.Root></Show><button onClick={()=>setValue(75)}>Advance</button><button onClick={()=>setValue(200)}>Complete</button><button onClick={()=>setMax(200)}>Scale</button><button onClick={()=>setIndeterminate(!indeterminate())}>Unknown</button><button onClick={()=>setMounted(!mounted())}>Mount</button></>;
}
render(()=><Probe/>,document.getElementById('app')!);
