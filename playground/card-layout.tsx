// Public-export Card and Separator layouts for geometry and visual acceptance; D19/D90.
import { createSignal, For } from 'solid-js';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from 'shadcn-solidjs-theme/ui/card';
import { Separator } from 'shadcn-solidjs-theme/ui/separator';
import { Button } from 'shadcn-solidjs-theme/ui/button';
const filename = 'DeliveryScheduleForAllNeighborhoodLocationsAndWeekendServiceUpdates'.repeat(2) + '.pdf';

/** Compare native card slots with caller-owned wrapping and explicit separator height. */
export function CardLayout() {
  const dark = new URLSearchParams(location.search).has('dark');
  const [reviews, setReviews] = createSignal(0);
  const [vertical, setVertical] = createSignal(true);
  return <main class={dark ? 'dark bg-background text-foreground' : undefined}>
    <h1 class="mb-6 text-xl font-semibold">Card layouts and separators</h1>
    <div class="grid grid-cols-1 items-start gap-6 md:grid-cols-2" data-testid="card-layout">
      <For each={['default', 'sm'] as const}>{size => <Card size={size} data-testid={`card-${size}`}>
        <CardHeader>
          <CardTitle class="min-w-0 break-words"><h2>{size === 'sm' ? 'Compact' : 'Default'} monthly operations and delivery schedule for neighborhood locations</h2></CardTitle>
          <CardDescription class="min-w-0 break-words">Coordinate opening hours, delivery instructions and weekend service changes across every location.</CardDescription>
          <CardAction><Button variant="outline" size="sm" aria-label={`Edit ${size} schedule`} onClick={() => setReviews(reviews() + 1)}>Edit</Button></CardAction>
        </CardHeader>
        <CardContent class="min-w-0 break-words space-y-3">
          <p>Review this document before confirming the updated service schedule with the team.</p>
          <p data-testid={`filename-${size}`} class="font-mono text-xs">{filename}</p>
          <div class="flex h-12 items-center gap-3" data-testid={`separator-row-${size}`}>
            <span>Open</span><Separator orientation="vertical" decorative={false} aria-label={`${size} status boundary`} data-testid={`separator-${size}`}/><span>Ready</span>
          </div>
        </CardContent>
        <CardFooter class="flex-wrap gap-3">
          <span class="min-w-0 flex-1 break-words">Your draft remains available while you review the service schedule.</span>
          <Button size="sm" onClick={() => setReviews(reviews() + 1)} aria-label={`Review ${size} schedule`}>Review</Button>
        </CardFooter>
      </Card>}</For>
    </div>
    <section class="mt-8 space-y-4" aria-label="Separator variations">
      <h2 class="font-medium">Vertical boundaries</h2>
      <div class="flex h-16 items-center gap-4" data-testid="decorative-row">
        <Button variant="ghost" size="sm">Previous</Button><Separator orientation="vertical" data-testid="decorative-separator"/><Button variant="ghost" size="sm">Next</Button>
      </div>
      <div class="flex h-20 items-center gap-4" data-testid="custom-row">
        <span>Custom</span><Separator orientation="vertical" decorative={false} aria-label="Custom boundary" class="h-8 data-vertical:w-0.5 data-vertical:self-center bg-primary" data-testid="custom-separator"/><span>Boundary</span>
      </div>
      <Button variant="outline" onClick={() => setVertical(!vertical())}>Change separator orientation</Button>
      <div class="flex h-12 items-center gap-3" data-testid="changing-row"><Separator orientation={vertical() ? 'vertical' : 'horizontal'} decorative={false} aria-label="Changing boundary" data-testid="changing-separator"/></div>
    </section>
    <p class="mt-4">Actions: <output data-testid="layout-actions">{reviews()}</output></p>
  </main>;
}
