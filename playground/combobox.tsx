// Searchable chooser examples with form and owner-controlled recovery; D19/D90.
import { createSignal, Show } from 'solid-js';
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxValue, ComboboxChips, ComboboxChip, ComboboxChipsInput } from 'shadcn-solidjs-theme/ui/combobox';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Button } from 'shadcn-solidjs-theme/ui/button';
const fruits=['Apple','Banana','Cherry','Dragon fruit — a longer option label for narrow screens'];
/** Exercise single selection, disabled options, multiple chips, controlled rejection and empty search. */
export function ComboboxExamples(){
 const [selection,setSelection]=createSignal<string[]>(['Apple']);const [submitted,setSubmitted]=createSignal('');const [rejected,setRejected]=createSignal(false);
 return <div class="demo-grid"><form class="space-y-3" data-testid="fruit-form" onSubmit={event=>{event.preventDefault();setSubmitted(String(new FormData(event.currentTarget).get('fruit')));}}>
 <Label for="fruit">Favorite fruit</Label><Combobox items={fruits} defaultValue="Apple" name="fruit" required isItemDisabled={item=>item==='Cherry'}><ComboboxInput id="fruit" showClear/><ComboboxContent><ComboboxList>{(item:string)=><ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList><ComboboxEmpty>No matching fruit. Try another search.</ComboboxEmpty></ComboboxContent></Combobox>
 <div class="samples"><Button type="submit">Submit fruit</Button><Button type="reset" variant="outline">Reset fruit</Button></div><p role="status">{submitted()?`Submitted fruit: ${submitted()}`:'Choose a fruit, then submit.'}</p></form>
 <div class="space-y-3"><Label for="fruits">Fruit collection</Label><Combobox items={fruits} multiple value={selection()} onValueChange={value=>setSelection(value)} name="fruits"><ComboboxChips><ComboboxValue<string>>{value=>(value as readonly string[]).map(item=><ComboboxChip value={item}/>)}</ComboboxValue><ComboboxChipsInput id="fruits" placeholder="Add fruit"/></ComboboxChips><ComboboxContent><ComboboxList>{(item:string)=><ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList><ComboboxEmpty>No matching fruit.</ComboboxEmpty></ComboboxContent></Combobox></div>
 <div class="space-y-3"><p id="chooser-label">Search inside a popup</p><Combobox items={fruits} defaultValue="Banana"><ComboboxTrigger aria-labelledby="chooser-label"><ComboboxValue placeholder="Choose fruit"/></ComboboxTrigger><ComboboxContent><ComboboxInput aria-label="Search fruit" showTrigger={false}/><ComboboxList>{(item:string)=><ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList><ComboboxEmpty>Nothing found.</ComboboxEmpty></ComboboxContent></Combobox></div>
 <div class="space-y-3"><Label for="restricted-fruit">Restricted fruit</Label><Combobox items={fruits} value="Apple" onValueChange={()=>setRejected(true)}><ComboboxInput id="restricted-fruit"/><ComboboxContent><ComboboxList>{(item:string)=><ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList><ComboboxEmpty>No matching fruit.</ComboboxEmpty></ComboboxContent></Combobox><Show when={rejected()}><p role="alert">This preview keeps Apple. Your selection was not changed.</p></Show></div>
 </div>;
}
