// Evaluate unpatched Kobalte Select against the package's pinned Solid 2 runtime; D19/D90.
import { render } from '@solidjs/web';
import * as Select from '@kobalte/core/select';
/** Include a native form, disabled option and the documented list rendering API. */
function Probe(){return <form><Select.Root options={['Apple','Banana','Cherry']} defaultValue="Apple" name="fruit" optionDisabled={item=>item==='Banana'} itemComponent={props=><Select.Item item={props.item}><Select.ItemLabel>{props.item.rawValue}</Select.ItemLabel><Select.ItemIndicator>✓</Select.ItemIndicator></Select.Item>}><Select.Label>Fruit</Select.Label><Select.HiddenSelect/><Select.Trigger><Select.Value<string>>{state=>state.selectedOption()}</Select.Value><Select.Icon/></Select.Trigger><Select.Portal><Select.Content><Select.Listbox/></Select.Content></Select.Portal></Select.Root><button type="reset">Reset</button></form>;}
render(()=><Probe/>,document.getElementById('app')!);
