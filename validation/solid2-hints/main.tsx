// Evaluate unpatched Kobalte pointer/focus previews on Solid 2; D19/D90.
import { render } from '@solidjs/web';
import * as Tooltip from '@kobalte/core/tooltip';
import * as HoverCard from '@kobalte/core/hover-card';
/** Isolate each preview and all development diagnostics. */
function Probe(){
 if(new URLSearchParams(location.search).get('kind')==='tooltip')return <Tooltip.Root openDelay={50} closeDelay={50}><Tooltip.Trigger>Preview trigger</Tooltip.Trigger><Tooltip.Content>Preview content</Tooltip.Content></Tooltip.Root>;
 return <HoverCard.Root openDelay={50} closeDelay={50}><HoverCard.Trigger href="#target">Preview trigger</HoverCard.Trigger><HoverCard.Content>Preview content</HoverCard.Content></HoverCard.Root>;
}
render(()=><><Probe/><button>Outside</button></>,document.getElementById('app')!);
