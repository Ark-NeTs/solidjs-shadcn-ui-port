// Unpatched Kobalte menu-family evaluation at the production pins; D19/D90.
import {Show,createSignal} from 'solid-js';
import {render} from '@solidjs/web';
import * as D from '@kobalte/core/dropdown-menu';
import * as C from '@kobalte/core/context-menu';
import * as M from '@kobalte/core/menubar';
import * as N from '@kobalte/core/navigation-menu';
/** Isolate each primitive so one failed owner cannot hide another result. */
function Probe(){const mode=new URLSearchParams(location.search).get('mode');const [mounted,setMounted]=createSignal(true);return <><Show when={mounted()}>{mode==='context'?<C.Root><C.Trigger>Context target</C.Trigger><C.Content><C.Item onSelect={()=>{}}>First action</C.Item><C.Item disabled>Disabled action</C.Item><C.Item>Last action</C.Item></C.Content></C.Root>:mode==='menubar'?<M.Root><M.Menu value="file"><M.Trigger>File menu</M.Trigger><M.Content><M.Item>First action</M.Item><M.Item>Last action</M.Item></M.Content></M.Menu></M.Root>:mode==='navigation'?<N.Root><N.Menu value="learn"><N.Trigger>Learn menu</N.Trigger><N.Content><N.Item as="a" href="#guide">Guide link</N.Item></N.Content></N.Menu><N.Viewport/></N.Root>:<D.Root><D.Trigger>Actions menu</D.Trigger><D.Content><D.Item>First action</D.Item><D.Item disabled>Disabled action</D.Item><D.Item>Last action</D.Item></D.Content></D.Root>}</Show><button onClick={()=>setMounted(false)}>Unmount</button></>;}
render(()=><Probe/>,document.getElementById('app')!);
