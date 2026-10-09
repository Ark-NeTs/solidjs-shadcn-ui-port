// Unpatched pinned Kobalte toast probe before selecting an implementation; D19/D90.
import {createSignal,Show} from 'solid-js';
import {render} from '@solidjs/web';
import {Toast,toaster} from '@kobalte/core/toast';
/** Show, update, dismiss, expire and remove a region with real notification content. */
function Probe(){const [mounted,setMounted]=createSignal(true);let id=0;return <main><h1>Kobalte toast evaluation</h1><button onClick={()=>{id=toaster.show(props=><Toast toastId={props.toastId} persistent><Toast.Title>Saved draft</Toast.Title><Toast.Description>Changes remain local</Toast.Description><Toast.CloseButton aria-label="Dismiss notice">Close</Toast.CloseButton></Toast>);}}>Show notice</button><button onClick={()=>toaster.update(id,props=><Toast toastId={props.toastId} persistent><Toast.Title>Updated draft</Toast.Title><Toast.CloseButton aria-label="Dismiss notice">Close</Toast.CloseButton></Toast>)}>Update notice</button><button onClick={()=>toaster.show(props=><Toast toastId={props.toastId} duration={1000}><Toast.Title>Temporary notice</Toast.Title></Toast>)}>Show timed notice</button><button onClick={()=>setMounted(false)}>Unmount</button><Show when={mounted()}><Toast.Region aria-label="Notifications"><Toast.List/></Toast.Region></Show></main>;}
render(()=><Probe/>,document.getElementById('app')!);
