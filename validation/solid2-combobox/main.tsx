// Unpatched Kobalte Combobox adoption probe on the selected Solid 2 runtime; D19/D90.
import { render } from '@solidjs/web';
import * as C from '@kobalte/core/combobox';
/** Exercise the published composition, including its native form bridge. */
function Probe(){return <form><C.Root options={['Apple','Banana','Cherry']} defaultValue="Apple" name="fruit" itemComponent={props=><C.Item item={props.item}><C.ItemLabel>{props.item.rawValue}</C.ItemLabel><C.ItemIndicator>✓</C.ItemIndicator></C.Item>}><C.Label>Fruit</C.Label><C.HiddenSelect/><C.Control><C.Input/><C.Trigger>Choose</C.Trigger></C.Control><C.Portal><C.Content><C.Listbox/></C.Content></C.Portal></C.Root><button type="reset">Reset</button></form>;}
render(()=><Probe/>,document.getElementById('app')!);
