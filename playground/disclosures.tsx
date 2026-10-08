// Public disclosure examples: expansion, retained drafts and owner-controlled rejection; D19/D90.
import { createSignal } from 'solid-js';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from 'shadcn-solidjs-theme/ui/accordion';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from 'shadcn-solidjs-theme/ui/collapsible';
import { Button, buttonVariants } from 'shadcn-solidjs-theme/ui/button';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Label } from 'shadcn-solidjs-theme/ui/label';
/** Keep all example settings and approval decisions with the consuming application. */
export function Disclosures(){
 const [horizontal,setHorizontal]=createSignal(false);const [rtl,setRtl]=createSignal(false);
 const [disabled,setDisabled]=createSignal(false);const [required,setRequired]=createSignal(false);
 const [open,setOpen]=createSignal(false);const [requested,setRequested]=createSignal('No change requested');
 const [custom,setCustom]=createSignal(false);
 const dark=new URLSearchParams(location.search).has('dark');
 return <div class={dark?'dark min-h-screen bg-background text-foreground':'min-h-screen bg-background text-foreground'} style={custom()?{'--ring':'oklch(0.55 0.2 150)'}:{}}><main class="max-w-3xl">
  <a href="/" class="text-sm underline">All components</a><h1 class="mt-6 text-3xl font-semibold">Reveal what matters</h1>
  <p class="mt-3 text-muted-foreground">Accordion groups related questions. Collapsible opens a single area without taking focus away from your work.</p>
  <section class="demo-section" aria-labelledby="accordion-title"><h2 id="accordion-title">Accordion</h2><p>One answer at a time. Hidden drafts can stay mounted.</p>
   <div class="samples mb-4"><Button variant="outline" size="sm" onClick={()=>setHorizontal(!horizontal())}>Toggle orientation</Button><Button variant="outline" size="sm" onClick={()=>setRtl(!rtl())}>Toggle direction</Button><Button variant="outline" size="sm" onClick={()=>setDisabled(!disabled())}>Toggle disabled</Button><Button variant="outline" size="sm" onClick={()=>setRequired(!required())}>Toggle required selection</Button><Button variant="outline" size="sm" onClick={()=>setCustom(!custom())}>Custom focus color</Button></div>
   <Accordion type="single" defaultValue="workspace" collapsible={!required()} disabled={disabled()} orientation={horizontal()?'horizontal':'vertical'} dir={rtl()?'rtl':'ltr'} data-testid="single-accordion">
    <AccordionItem value="workspace" triggerId="workspace-question" contentId="workspace-answer"><AccordionTrigger>How do I personalize my workspace?</AccordionTrigger><AccordionContent forceMount><p>Keep a name that is meaningful to your team. This draft survives closing and reopening the answer.</p><Label for="disclosure-draft">Workspace draft</Label><Input id="disclosure-draft" defaultValue="North studio" class="mt-2"/></AccordionContent></AccordionItem>
    <AccordionItem value="disabled" disabled><AccordionTrigger>Unavailable answer</AccordionTrigger><AccordionContent>Not available</AccordionContent></AccordionItem>
    <AccordionItem value="access"><AccordionTrigger>Who can access these preferences?</AccordionTrigger><AccordionContent><p>Only members of your workspace. Long content wraps naturally, even with enlarged fonts and narrow screens.</p><Collapsible><CollapsibleTrigger class={buttonVariants({variant:'outline',size:'sm'})}>More access details</CollapsibleTrigger><CollapsibleContent class="pt-3">Your application decides who can change each setting.</CollapsibleContent></Collapsible></AccordionContent></AccordionItem>
   </Accordion>
  </section>
  <section class="demo-section" aria-labelledby="multiple-title"><h2 id="multiple-title">Compare several answers</h2>
   <Accordion type="multiple" defaultValue={['one']} data-testid="multiple-accordion">
    <AccordionItem value="one"><AccordionTrigger>Shared theme</AccordionTrigger><AccordionContent>Semantic colors adapt to light and dark appearances.</AccordionContent></AccordionItem>
    <AccordionItem value="two"><AccordionTrigger>Keyboard access</AccordionTrigger><AccordionContent>Tab visits each enabled trigger. Arrow keys move between questions; Enter or Space changes expansion.</AccordionContent></AccordionItem>
   </Accordion>
  </section>
  <section class="demo-section" aria-labelledby="collapsible-title"><h2 id="collapsible-title">Collapsible</h2>
   <Collapsible defaultOpen data-testid="uncontrolled-collapsible" class="rounded-xl border p-4"><CollapsibleTrigger class={buttonVariants({variant:'outline'})}>Preview details</CollapsibleTrigger><CollapsibleContent class="pt-4"><Label for="temporary-note">Temporary note</Label><Input id="temporary-note" defaultValue="A fresh start" class="mt-2"/><p class="mt-3 text-sm text-muted-foreground">This content unmounts when closed. Use forceMount when local drafts should survive.</p></CollapsibleContent></Collapsible>
   <Collapsible open={open()} onOpenChange={next=>setRequested(next?'Open requested':'Close requested')} data-testid="controlled-collapsible" class="mt-4 rounded-xl border p-4"><CollapsibleTrigger class={buttonVariants({variant:'outline'})}>Owner-controlled details</CollapsibleTrigger><CollapsibleContent class="pt-4">The owner accepted the new state.</CollapsibleContent></Collapsible>
   <p role="status" class="mt-3 text-sm">{requested()}</p><Button class="mt-3" variant="outline" onClick={()=>setOpen(!open())}>Apply owner change</Button>
  </section>
 </main></div>;
}
