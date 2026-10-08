// Public pointer/focus preview examples with deliberate owner decisions; D19/D90.
import { createSignal, Show } from 'solid-js';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from 'shadcn-solidjs-theme/ui/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from 'shadcn-solidjs-theme/ui/hover-card';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from 'shadcn-solidjs-theme/ui/popover';
import { Button, buttonVariants } from 'shadcn-solidjs-theme/ui/button';
/** Make delay, dismissal, owner rejection and cleanup reproducible through visible controls. */
export function Hints(){
 const query=new URLSearchParams(location.search);const dark=query.has('dark');const visual=query.has('visual');
 const [disabled,setDisabled]=createSignal(false);const [mounted,setMounted]=createSignal(true);const [open,setOpen]=createSignal(false);const [requested,setRequested]=createSignal('No preview change requested');const [moved,setMoved]=createSignal(false);const [custom,setCustom]=createSignal(false);
 return <div class={dark?'dark min-h-screen bg-background text-foreground':'min-h-screen bg-background text-foreground'} style={custom()?{'--popover':'oklch(0.3 0.06 250)','--popover-foreground':'oklch(0.98 0 0)'}:{}}><main>
  <a href="/" class="underline text-sm">All components</a><h1 class="mt-6 text-3xl font-semibold">A little more context</h1><p class="mt-3 text-muted-foreground">Helpful descriptions and link previews, available by pointer and keyboard.</p>
  <section class="demo-section" aria-labelledby="tooltip-title"><h2 id="tooltip-title">Quick descriptions</h2><p>Pause over a button or focus it with your keyboard. Escape dismisses the description.</p>
   <TooltipProvider delayDuration={160} skipDelayDuration={500}><div class="samples">
    <Tooltip defaultOpen={visual} disabled={disabled()} contentId="save-hint"><TooltipTrigger class={buttonVariants({variant:'outline'})} aria-describedby="save-help">Save draft</TooltipTrigger><TooltipContent side="bottom" sideOffset={12}>Keep your work without publishing it.</TooltipContent></Tooltip>
    <Tooltip><TooltipTrigger class={buttonVariants({variant:'outline'})}>Publish draft</TooltipTrigger><TooltipContent>Make this draft visible to your team.</TooltipContent></Tooltip>
    <Tooltip><TooltipTrigger class={buttonVariants({variant:'outline'})}>Read publishing details</TooltipTrigger><TooltipContent>Publishing makes your draft available to everyone in your workspace. Review the title, description and any attached information before you publish. You can return to your draft and make changes while keeping the original content available to your team.</TooltipContent></Tooltip>
   </div></TooltipProvider><p id="save-help" class="mt-3 text-sm text-muted-foreground">Your draft stays private.</p>
  </section>
  <section class="demo-section pt-12" aria-labelledby="hover-title"><h2 id="hover-title">People and links</h2><p>A preview keeps the link usable. Move into the card to read it or follow its profile link.</p>
   <div data-testid="preview-clip" class="overflow-hidden rounded-lg border p-6" style={{transform:moved()?'translateX(24px)':'none'}}>
    <Show when={mounted()}><HoverCard defaultOpen={visual} disabled={disabled()} openDelay={160} closeDelay={120} contentId="person-preview"><HoverCardTrigger href="#profile" class="rounded-sm font-medium underline outline-none focus-visible:ring-3 focus-visible:ring-ring/50">Maya Chen</HoverCardTrigger><HoverCardContent side="bottom" align="start" sideOffset={16} forceMount class="space-y-2"><p class="font-semibold">Maya Chen · Design</p><p>Creates welcoming spaces and helps teams make thoughtful decisions.</p><a href="#profile" class="underline" data-testid="profile-link">View Maya’s profile</a></HoverCardContent></HoverCard></Show>
   </div><div class="samples mt-44"><Button variant="outline" onClick={()=>setDisabled(!disabled())}>Toggle preview availability</Button><Button variant="outline" onClick={()=>setMounted(!mounted())}>Toggle person preview</Button><Button variant="outline" onClick={()=>setMoved(!moved())}>Move person link</Button><Button variant="outline" onClick={()=>setCustom(!custom())}>Custom preview colors</Button></div>
  </section>
  <section class="demo-section pt-16" aria-labelledby="owner-title"><h2 id="owner-title">An owner decides</h2><HoverCard open={open()} onOpenChange={next=>setRequested(next?'Open requested':'Close requested')} openDelay={0}><HoverCardTrigger href="#profile" class="underline">Review profile</HoverCardTrigger><HoverCardContent>Approved preview</HoverCardContent></HoverCard><p role="status" class="mt-3">{requested()}</p><Button class="mt-3" variant="outline" onClick={()=>setOpen(!open())}>Apply preview change</Button></section>
  <section class="demo-section" aria-labelledby="nested-title"><h2 id="nested-title">Descriptions inside a dialog</h2><Popover modal><PopoverTrigger class={buttonVariants({variant:'outline'})}>Open workspace dialog</PopoverTrigger><PopoverContent><PopoverTitle>Workspace preferences</PopoverTitle><Tooltip><TooltipTrigger class={buttonVariants({variant:'outline'})}>Workspace help</TooltipTrigger><TooltipContent>These preferences belong to your workspace.</TooltipContent></Tooltip><Button>Continue editing</Button></PopoverContent></Popover></section>
  <section id="profile" class="demo-section"><h2>Profile destination</h2><p>Profile details remain available here without relying on a hover preview.</p><Button variant="outline">Outside preview</Button></section>
 </main></div>;
}
