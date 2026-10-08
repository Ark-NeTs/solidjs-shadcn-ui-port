// Evaluate unpatched Kobalte disclosures with the selected Solid 2 runtime; D19/D90.
import { render } from '@solidjs/web';
import * as Accordion from '@kobalte/core/accordion';
import * as Collapsible from '@kobalte/core/collapsible';
/** Isolate each primitive's diagnostics and open/close behavior. */
function Probe() {
 if(new URLSearchParams(location.search).get('kind')==='accordion')return <Accordion.Root collapsible><Accordion.Item value="one"><Accordion.Header><Accordion.Trigger>Toggle details</Accordion.Trigger></Accordion.Header><Accordion.Content><input aria-label="Draft" value="Preserve me"/></Accordion.Content></Accordion.Item><Accordion.Item value="two"><Accordion.Header><Accordion.Trigger>Second details</Accordion.Trigger></Accordion.Header><Accordion.Content>Second panel</Accordion.Content></Accordion.Item></Accordion.Root>;
 return <Collapsible.Root><Collapsible.Trigger>Toggle details</Collapsible.Trigger><Collapsible.Content><input aria-label="Draft" value="Preserve me"/></Collapsible.Content></Collapsible.Root>;
}
render(()=><Probe/>,document.getElementById('app')!);
