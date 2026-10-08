// Focused real-layout fixtures for Popover placement and top-layer clipping; D19/D90.
import { createSignal } from 'solid-js';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Popover, PopoverAnchor, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose } from 'shadcn-solidjs-theme/ui/popover';

/** Keep geometry changes in the example owner and consume only public component exports. */
export function PopoverPlacement() {
  const mode = new URLSearchParams(location.search).get('placement-case') ?? 'scroll';
  const [moved, setMoved] = createSignal(false);
  const [wideAnchor, setWideAnchor] = createSignal(false);
  const [wideContent, setWideContent] = createSignal(false);
  const scroll = mode === 'scroll';
  const clipped = mode === 'clip';
  const edge = mode === 'edge';
  return <main style={{ 'max-width': 'none', margin: '0', padding: '24px', 'min-height': scroll ? '1800px' : '100vh' }}>
    <h1>Popover placement</h1>
    <p>Open the preview, then scroll, resize the window, or use its layout controls.</p>
    <div data-testid="placement-container" style={{
      position: edge ? 'fixed' : 'absolute',
      top: edge ? undefined : '180px', bottom: edge ? '20px' : undefined,
      left: edge ? undefined : mode === 'resize' ? '50%' : '60px', right: edge ? '20px' : undefined,
      width: scroll ? '640px' : clipped ? '200px' : 'auto',
      height: scroll ? '360px' : clipped ? '80px' : 'auto',
      overflow: scroll ? 'auto' : clipped ? 'hidden' : 'visible',
      transform: clipped ? 'translateZ(0)' : undefined,
      contain: clipped ? 'paint' : undefined,
      border: scroll || clipped ? '2px solid var(--border)' : undefined,
    }}>
      <div style={{ width: scroll ? '1100px' : undefined, height: scroll ? '850px' : undefined, padding: scroll ? '140px 0 0 240px' : clipped ? '16px' : undefined }}>
        <Popover>
          <PopoverAnchor data-testid="placement-anchor" style={{
            width: wideAnchor() ? '280px' : '160px', height: '40px',
            transform: moved() ? 'translate(90px, 60px)' : 'translate(0px, 0px)',
            transition: mode === 'motion' ? 'transform 400ms linear' : undefined,
          }}>
            <PopoverTrigger class="h-full w-full rounded border bg-background text-sm">Open placement preview</PopoverTrigger>
          </PopoverAnchor>
          <PopoverContent side="bottom" align={mode === 'resize' ? 'center' : 'start'} sideOffset={8} collisionPadding={12}
            style={{ width: edge ? '420px' : wideContent() ? '340px' : '240px' }}>
            <PopoverTitle>Placement preview</PopoverTitle>
            <PopoverDescription>Changes preserve this open preview.</PopoverDescription>
            {mode === 'motion' && <Button onClick={() => setMoved(!moved())}>Move anchor</Button>}
            {mode === 'resize' && <><Button onClick={() => setWideAnchor(!wideAnchor())}>Resize anchor</Button><Button onClick={() => setWideContent(!wideContent())}>Resize content</Button></>}
            {edge && <div style={{ height: '400px', 'flex-shrink': '0' }}>Tall content exercises viewport constraints. Scroll down to close.</div>}
            <PopoverClose class="shrink-0 rounded border p-2">Close preview</PopoverClose>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </main>;
}
