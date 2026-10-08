// Evaluate Kobalte Image loading and cleanup before Avatar adoption; D19/D90.
import {createSignal,Show} from 'solid-js';
import {render} from '@solidjs/web';
import * as Image from '@kobalte/core/image';
/** Use real image decoding with owner-driven replacement and unmount. */
function Probe(){const [src,setSrc]=createSignal('data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="red"/></svg>'));const [mounted,setMounted]=createSignal(true);return <><Show when={mounted()}><Image.Root><Image.Img src={src()} alt="Avatar preview"/><Image.Fallback>AL</Image.Fallback></Image.Root></Show><button onClick={()=>setSrc('data:image/png;base64,broken')}>Break image</button><button onClick={()=>setSrc('data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="9" fill="blue"/></svg>'))}>Recover image</button><button onClick={()=>setMounted(!mounted())}>Mount image</button></>;}
render(()=><Probe/>,document.getElementById('app')!);
