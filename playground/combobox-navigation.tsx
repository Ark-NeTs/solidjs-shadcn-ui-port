// Browser fixtures for Combobox scrolling, sequential focus and native modal nesting; D19/D90.
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxValue, ComboboxContent, ComboboxList, ComboboxItem } from 'shadcn-solidjs-theme/ui/combobox';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose } from 'shadcn-solidjs-theme/ui/popover';
const options = Array.from({ length: 40 }, (_, index) => `Option ${String(index + 1).padStart(2, '0')}`);
const fruits = ['Apple', 'Banana', 'Cherry'];

/** Keep focus destinations explicit so browser tests can assert native Tab order. */
export function ComboboxNavigation() {
  return <section class="space-y-8" aria-label="Combobox navigation">
    <h2>Scrolling and keyboard navigation</h2>
    <div class="space-y-3">
      <Label for="long-options">Long option list</Label>
      <Combobox items={options}><ComboboxInput id="long-options"/><ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
    </div>
    <div class="space-y-3" role="group" aria-label="Inline focus order">
      <Button>Before inline chooser</Button><Label for="inline-navigation">Inline fruit</Label>
      <Combobox items={fruits} defaultValue="Apple"><ComboboxInput id="inline-navigation"/><ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
      <Button>After inline chooser</Button>
    </div>
    <div class="space-y-3" role="group" aria-label="Popup focus order">
      <Button>Before popup chooser</Button>
      <Combobox items={fruits} defaultValue="Apple"><ComboboxTrigger aria-label="Popup fruit"><ComboboxValue/></ComboboxTrigger><ComboboxContent><ComboboxInput aria-label="Popup fruit search" showTrigger={false}/><ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
      <Button>After popup chooser</Button>
    </div>
    <Popover modal><PopoverTrigger>Open fruit editor</PopoverTrigger><PopoverContent>
      <PopoverTitle>Fruit editor</PopoverTitle><PopoverDescription>Choose locally, then close this preview.</PopoverDescription>
      <Button>Before modal chooser</Button><Label for="modal-fruit">Modal fruit</Label>
      <Combobox items={fruits} defaultValue="Apple"><ComboboxInput id="modal-fruit" showTrigger={false}/><ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
      <Button>After modal chooser</Button><PopoverClose>Close fruit editor</PopoverClose>
    </PopoverContent></Popover>
  </section>;
}
