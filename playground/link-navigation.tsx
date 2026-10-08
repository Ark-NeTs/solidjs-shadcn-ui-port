// Public-export fixtures for native link navigation and disabled anchors; D19/D90.
import { createSignal } from 'solid-js';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Badge } from 'shadcn-solidjs-theme/ui/badge';

/** Keep link availability and callback counts in the example owner. */
export function LinkNavigation() {
  const query = new URLSearchParams(location.search);
  const [disabled, setDisabled] = createSignal(query.has('disabled'));
  const [buttonClicks, setButtonClicks] = createSignal(0);
  const [badgeClicks, setBadgeClicks] = createSignal(0);
  const [bubbledClicks, setBubbledClicks] = createSignal(0);
  return <main class={query.has('dark') ? 'dark bg-background text-foreground' : undefined}>
    <h1>Button and Badge links</h1>
    <p>Press D while the Button link is focused to disable it. Use the availability control to enable it again.</p>
    <Button onClick={() => setDisabled(!disabled())}>{disabled() ? 'Enable link' : 'Disable link'}</Button>
    <div class="samples my-6" onClick={() => setBubbledClicks(bubbledClicks() + 1)}>
      <Button as="a" href="#button-destination" disabled={disabled()}
        aria-describedby="availability" data-testid="button-link"
        onKeyDown={event => { if (event.key.toLowerCase() === 'd') setDisabled(true); }}
        onClick={() => setButtonClicks(buttonClicks() + 1)}>Button destination</Button>
      <Badge>Informational badge</Badge>
      <Badge as="a" href="#badge-destination" onClick={() => setBadgeClicks(badgeClicks() + 1)}>Badge destination</Badge>
    </div>
    <Button>After links</Button>
    <p id="availability">{disabled() ? 'Button destination is unavailable in this example.' : 'Both destinations are available.'}</p>
    <p>Button activations: <output data-testid="button-clicks">{buttonClicks()}</output></p>
    <p>Badge activations: <output data-testid="badge-clicks">{badgeClicks()}</output></p>
    <p>Bubbled activations: <output data-testid="bubbled-clicks">{bubbledClicks()}</output></p>
    <section id="button-destination" tabindex={-1}><h2>Button destination content</h2></section>
    <section id="badge-destination" tabindex={-1}><h2>Badge destination content</h2></section>
  </main>;
}
