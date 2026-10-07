// Evaluate unmodified Kobalte controls before production adoption; D19/D90.
import { createSignal } from 'solid-js';
import { render } from '@solidjs/web';
import * as Checkbox from '@kobalte/core/checkbox';
import * as Switch from '@kobalte/core/switch';
/** Exercise each control's checked state, native form, label and reset behavior. */
function Probe() {
  const [checked,setChecked]=createSignal(false);
  return <form><Checkbox.Root name="check" checked={checked()} onChange={setChecked}><Checkbox.Input /><Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control><Checkbox.Label>Checkbox probe</Checkbox.Label></Checkbox.Root><Switch.Root name="switch" defaultChecked><Switch.Input /><Switch.Control><Switch.Thumb>Thumb</Switch.Thumb></Switch.Control><Switch.Label>Switch probe</Switch.Label></Switch.Root><button type="reset">Reset</button></form>;
}
render(()=><Probe />,document.getElementById('app')!);
