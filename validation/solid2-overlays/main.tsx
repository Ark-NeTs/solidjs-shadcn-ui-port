// Evaluate unpatched Kobalte through public compositions before adopting it; D19/D90.
import { render } from '@solidjs/web';
import * as Tabs from '@kobalte/core/tabs';
import * as Popover from '@kobalte/core/popover';
import * as Alert from '@kobalte/core/alert-dialog';
/** Isolate each primitive so diagnostics can be attributed without filtering. */
function Probe() {
  const kind=new URLSearchParams(location.search).get('kind');
  if(kind==='tabs')return <Tabs.Root defaultValue="one"><Tabs.List><Tabs.Trigger value="one">One</Tabs.Trigger><Tabs.Trigger value="two">Two</Tabs.Trigger></Tabs.List><Tabs.Content value="one">First panel</Tabs.Content><Tabs.Content value="two">Second panel</Tabs.Content></Tabs.Root>;
  if(kind==='popover')return <Popover.Root><Popover.Trigger>Open popover</Popover.Trigger><Popover.Portal><Popover.Content><Popover.Title>Popover probe</Popover.Title><Popover.Description>Description</Popover.Description><Popover.CloseButton>Close</Popover.CloseButton></Popover.Content></Popover.Portal></Popover.Root>;
  return <Alert.Root><Alert.Trigger>Open alert</Alert.Trigger><Alert.Portal><Alert.Overlay/><Alert.Content><Alert.Title>Alert probe</Alert.Title><Alert.Description>Description</Alert.Description><Alert.CloseButton>Cancel</Alert.CloseButton></Alert.Content></Alert.Portal></Alert.Root>;
}
render(()=><Probe/>,document.getElementById('app')!);
