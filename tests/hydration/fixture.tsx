// Server/client shared acceptance composition through public source exports; D19/D90.
import { Progress } from 'shadcn-solidjs-theme/ui/progress';
import { Slider } from 'shadcn-solidjs-theme/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'shadcn-solidjs-theme/ui/select';
import { createSignal } from 'solid-js';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Badge } from 'shadcn-solidjs-theme/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from 'shadcn-solidjs-theme/ui/card';
import { Separator } from 'shadcn-solidjs-theme/ui/separator';
import { Skeleton } from 'shadcn-solidjs-theme/ui/skeleton';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Textarea } from 'shadcn-solidjs-theme/ui/textarea';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Checkbox } from 'shadcn-solidjs-theme/ui/checkbox';
import { Switch } from 'shadcn-solidjs-theme/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'shadcn-solidjs-theme/ui/tabs';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose } from 'shadcn-solidjs-theme/ui/popover';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from 'shadcn-solidjs-theme/ui/alert-dialog';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from 'shadcn-solidjs-theme/ui/combobox';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from 'shadcn-solidjs-theme/ui/accordion';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from 'shadcn-solidjs-theme/ui/collapsible';

import { RadioGroup, RadioGroupItem } from 'shadcn-solidjs-theme/ui/radio-group';
import { Toggle } from 'shadcn-solidjs-theme/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from 'shadcn-solidjs-theme/ui/toggle-group';
import { Tooltip, TooltipTrigger, TooltipContent } from 'shadcn-solidjs-theme/ui/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from 'shadcn-solidjs-theme/ui/hover-card';

/** Keep request data deterministic across SSR and hydration; user changes belong to this owner. */
export function HydrationFixture(props: { initiallyOpen: false | 'popover' | 'alert' }) {
  const [suffix, setSuffix] = createSignal('server');
  const [notes, setNotes] = createSignal('Server notes');
  const [submitted, setSubmitted] = createSignal('Nothing submitted');
  const [submissions, setSubmissions] = createSignal(0);
  const [progress, setProgress] = createSignal<number|null>(25);
  const [confirmed, setConfirmed] = createSignal(0);
  /** Serialize native values and count submits to detect duplicate hydration handlers. */
  function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
    setSubmissions(value => value + 1);
  }
  return <main class="mx-auto grid max-w-xl gap-4 p-6">
    <Card><CardHeader><CardTitle>Hydrated preferences</CardTitle></CardHeader><CardContent>
      <Badge>Server content</Badge><Separator decorative={false}/><Skeleton class="h-2 w-16"/>
      <form data-testid="hydration-form" onSubmit={submit} onReset={() => setNotes('Server notes')} class="grid gap-3">
        <Label for={`email-${suffix()}`}>Email</Label><Input id={`email-${suffix()}`} name="email" type="email" required defaultValue="server@example.com"/>
        <Label for="notes">Notes</Label><Textarea id="notes" name="notes" value={notes()} onInput={event => setNotes(event.currentTarget.value)}/>
        <Label for="terms">Terms</Label><Checkbox id="terms" name="terms" defaultChecked="indeterminate"/>
        <Label for="updates">Updates</Label><Switch id="updates" name="updates" defaultChecked/>
        <Combobox items={['Apple', 'Banana']} defaultValue="Apple" name="fruit"><ComboboxInput aria-label="Fruit"/><ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
        <Button type="submit">Submit preferences</Button><Button type="reset">Reset preferences</Button>
      </form>
      <output data-testid="submitted">{submitted()}</output><output data-testid="submissions">{submissions()}</output>
    </CardContent></Card>
    <Button onClick={() => setSuffix(value => value === 'server' ? 'client' : 'server')}>Change IDs</Button>
    <Tabs id={`preferences-${suffix()}`} defaultValue="profile">
      <TabsList aria-label="Preference sections"><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="locked" disabled>Locked</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
      <TabsContent value="profile" forceMount><Input aria-label="Panel draft" defaultValue="Server panel draft"/></TabsContent>
      <TabsContent value="history">History content</TabsContent>
    </Tabs>
    <Popover defaultOpen={props.initiallyOpen === 'popover'}><PopoverTrigger>Open details</PopoverTrigger><PopoverContent forceMount id={`details-${suffix()}`}>
      <PopoverTitle id={`details-title-${suffix()}`}>Preference details</PopoverTitle><PopoverDescription>Local hydration preview</PopoverDescription>
      <Input aria-label="Popup draft" defaultValue="Server popup draft"/><PopoverClose>Close details</PopoverClose>
    </PopoverContent></Popover>
    <AlertDialog defaultOpen={props.initiallyOpen === 'alert'}><AlertDialogTrigger>Open confirmation</AlertDialogTrigger><AlertDialogContent forceMount id={`confirmation-${suffix()}`}>
      <AlertDialogTitle id={`confirmation-title-${suffix()}`}>Confirm preferences</AlertDialogTitle><AlertDialogDescription>Confirm this local preview</AlertDialogDescription>
      <Input aria-label="Confirmation draft" defaultValue="Server confirmation draft"/>
      <AlertDialogCancel>Cancel confirmation</AlertDialogCancel><AlertDialogAction onClick={() => setConfirmed(value => value + 1)}>Confirm changes</AlertDialogAction>
    </AlertDialogContent></AlertDialog>
    <Accordion type="single" collapsible defaultValue="draft">
      <AccordionItem value="draft" triggerId={`disclosure-trigger-${suffix()}`} contentId={`disclosure-content-${suffix()}`}><AccordionTrigger>Hydrated draft section</AccordionTrigger><AccordionContent forceMount><Input aria-label="Accordion draft" defaultValue="Server accordion draft"/></AccordionContent></AccordionItem>
      <AccordionItem value="other"><AccordionTrigger>Hydrated other section</AccordionTrigger><AccordionContent>Other disclosure content</AccordionContent></AccordionItem>
    </Accordion>
    <Collapsible defaultOpen><CollapsibleTrigger>Hydrated optional section</CollapsibleTrigger><CollapsibleContent><Input aria-label="Collapsible draft" defaultValue="Server collapsible draft"/></CollapsibleContent></Collapsible>
    <Tooltip contentId={`hydrated-tip-${suffix()}`}><TooltipTrigger>Hydrated help</TooltipTrigger><TooltipContent forceMount>Hydrated description</TooltipContent></Tooltip>
    <HoverCard contentId={`hydrated-card-${suffix()}`} openDelay={0}><HoverCardTrigger href="#hydrated-profile">Hydrated profile</HoverCardTrigger><HoverCardContent forceMount><a href="#hydrated-profile">View hydrated profile</a></HoverCardContent></HoverCard>
    <p id="hydrated-profile">Hydrated destination</p>
    <RadioGroup aria-label="Hydrated delivery" defaultValue="a"><label><RadioGroupItem value="a"/>Hydrated pickup</label><label><RadioGroupItem value="b"/>Hydrated shipping</label></RadioGroup>
    <Toggle defaultPressed>Hydrated bold</Toggle>
    <ToggleGroup type="multiple" aria-label="Hydrated styles" defaultValue={["a"]}><ToggleGroupItem value="a">Hydrated left</ToggleGroupItem><ToggleGroupItem value="b">Hydrated right</ToggleGroupItem></ToggleGroup>
    <form id="hydrated-select-form"><Select items={[{value:"apple",label:"Apple"},{value:"cherry",label:"Cherry"}]} name="fruit" defaultValue="apple"><SelectTrigger aria-label="Hydrated fruit"><SelectValue/></SelectTrigger><SelectContent>{item=><SelectItem value={item.value}/>}</SelectContent></Select><button type="reset">Reset hydrated fruit</button></form>
    <form id="hydrated-slider-form"><Slider aria-label="Hydrated range" thumbLabels={["Hydrated minimum","Hydrated maximum"]} name="range" defaultValue={[20,80]} minStepsBetweenThumbs={10}/><button type="reset">Reset hydrated range</button></form>
    <span id={`progress-label-${suffix()}`}>Hydrated progress</span><Progress aria-labelledby={`progress-label-${suffix()}`} value={progress()}/><Button onClick={()=>setProgress(100)}>Complete hydrated progress</Button><Button onClick={()=>setProgress(null)}>Unknown hydrated progress</Button>
    <output data-testid="confirmed">{confirmed()}</output>
  </main>;
}
