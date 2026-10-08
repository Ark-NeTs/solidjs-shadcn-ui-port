// Unpatched Kobalte selection primitives on the pinned Solid 2 runtime; D19/D90.
import { render } from '@solidjs/web';
import * as Radio from '@kobalte/core/radio-group';
import * as Toggle from '@kobalte/core/toggle-button';
import * as Group from '@kobalte/core/toggle-group';
/** Isolate one primitive so diagnostics have an attributable owner. */
function Probe(){
 const kind=new URLSearchParams(location.search).get('kind');
 if(kind==='toggle')return <><Toggle.Root>Bold</Toggle.Root><Toggle.Root onClick={event=>event.preventDefault()}>Canceled</Toggle.Root></>;
 if(kind==='group')return <Group.Root multiple defaultValue={['a']}><Group.Item value="a">Alpha</Group.Item><Group.Item value="b" disabled>Beta</Group.Item><Group.Item value="c">Gamma</Group.Item></Group.Root>;
 return <form><Radio.Root name="choice" defaultValue="a"><Radio.Label>Delivery</Radio.Label><Radio.Item value="a"><Radio.ItemInput/><Radio.ItemControl/><Radio.ItemLabel>Alpha</Radio.ItemLabel></Radio.Item><Radio.Item value="b" disabled><Radio.ItemInput/><Radio.ItemControl/><Radio.ItemLabel>Beta</Radio.ItemLabel></Radio.Item><Radio.Item value="c"><Radio.ItemInput/><Radio.ItemControl/><Radio.ItemLabel>Gamma</Radio.ItemLabel></Radio.Item></Radio.Root><button type="reset">Reset</button></form>;
}
render(()=><Probe/>,document.getElementById('app')!);
