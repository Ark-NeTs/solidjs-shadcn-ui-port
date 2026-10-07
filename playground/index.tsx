// Interactive examples exercise public package exports and app-owned state; D19.
import { createSignal, Show } from 'solid-js';
import { render } from '@solidjs/web';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Badge } from 'shadcn-solidjs-theme/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from 'shadcn-solidjs-theme/ui/card';
import { Separator } from 'shadcn-solidjs-theme/ui/separator';
import { Skeleton } from 'shadcn-solidjs-theme/ui/skeleton';
import './index.css';
const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
/** Keep demonstration state in the application, with no data layer in components. */
function Playground() {
  const [dark, setDark] = createSignal(new URLSearchParams(location.search).has('dark'));
  const [pending, setPending] = createSignal(false);
  const [saved, setSaved] = createSignal(0);
  const [compact, setCompact] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [vertical, setVertical] = createSignal(false);
  const [custom, setCustom] = createSignal(false);
  return <div class={dark() ? 'dark min-h-screen bg-background text-foreground' : 'min-h-screen bg-background text-foreground'}
    style={custom() ? {'--primary':'oklch(0.46 0.15 155)','--primary-foreground':'oklch(0.99 0 0)','--radius':'0.8rem'} : {}} data-testid="theme">
    <main>
      <header class="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <a href="#top" class="text-sm font-semibold tracking-wide">SOLID / FOUNDATIONS</a>
        <nav aria-label="Preview settings" class="samples">
          <Button variant="outline" aria-pressed={custom() ? "true" : "false"} onClick={() => setCustom(!custom())}>Custom theme</Button>
          <Button variant="outline" aria-pressed={dark() ? "true" : "false"} onClick={() => setDark(!dark())}>{dark() ? 'Light mode' : 'Dark mode'}</Button>
        </nav>
      </header>
      <section id="top" class="py-12">
        <Badge variant="secondary">Solid 2 · First release</Badge>
        <h1 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">A shared language,<br />five building blocks.</h1>
        <p class="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">Familiar shadcn styling. Reactive Solid components. Shared light and dark tokens, ready to compose into your next screen.</p>
        <div class="mt-6 samples"><Button as="a" href="#components">Explore components</Button><span class="text-xs text-muted-foreground">Button / Badge / Card / Separator / Skeleton</span></div>
      </section>
      <Separator />
      <section id="components" class="demo-section" aria-labelledby="button-heading">
        <h2 id="button-heading">01 / Button</h2><p>Actions with clear hierarchy. Native keyboard, form, and disabled behavior.</p>
        <div class="samples">{variants.map(variant => <Button variant={variant} disabled={disabled()}>{variant}</Button>)}</div>
        <div class="samples mt-4"><Button size="xs">Extra small</Button><Button size="sm">Small</Button><Button>Default</Button><Button size="lg">Large</Button><Button size="icon" aria-label="Add item">+</Button><Button variant="outline" aria-pressed={disabled() ? "true" : "false"} onClick={() => setDisabled(!disabled())}>Disable examples</Button></div>
        <div class="snippet"><code>{'<Button variant="outline" onClick={save}>Save changes</Button>'}</code></div>
      </section>
      <section class="demo-section" aria-labelledby="badge-heading"><h2 id="badge-heading">02 / Badge</h2><p>Compact labels for status, categories, and navigation.</p><div class="samples">{variants.map(variant => <Badge variant={variant}>{variant}</Badge>)}<Badge as="a" href="#composition" variant="outline">View composition →</Badge></div></section>
      <section id="composition" class="demo-section" aria-labelledby="card-heading"><h2 id="card-heading">03 / Card</h2><p>Seven composable parts. The application owns submission and pending state.</p>
        <div class="demo-grid">
          <Card size={compact() ? 'sm' : 'default'} data-testid="example-card">
            <CardHeader><CardTitle><h3>Workspace preferences</h3></CardTitle><CardDescription>Keep your team’s workspace easy to recognize.</CardDescription><CardAction><Badge variant="outline">Preview</Badge></CardAction></CardHeader>
            <CardContent><form id="preferences" onSubmit={event => {event.preventDefault();setPending(true);}}>
              <label for="workspace-name" class="text-sm font-medium">Workspace name</label><input id="workspace-name" name="workspace" required value="North studio" class="mt-2 w-full min-w-0 rounded-md border bg-background px-3 py-2" />
              <p class="mt-3 text-xs text-muted-foreground">Preview only. No information leaves this page.</p>
            </form></CardContent>
            <CardFooter class="flex-wrap justify-between gap-3"><span role="status" class="text-xs text-foreground">{pending() ? 'Saving preview…' : `Saved changes: ${saved()}`}</span><Button type="submit" form="preferences" disabled={pending()} aria-busy={pending() ? "true" : "false"}>Save changes</Button></CardFooter>
          </Card>
          <Card><CardHeader><CardTitle><h3>Compose, don’t duplicate</h3></CardTitle><CardDescription>Slots stay consistent across layouts.</CardDescription></CardHeader><CardContent class="space-y-4"><p class="leading-relaxed text-muted-foreground">Use your own headings, form controls, and application state. Every part forwards native attributes and refs.</p><code>CardHeader → CardContent → CardFooter</code></CardContent><CardFooter class="gap-3 flex-wrap"><Button variant="outline" aria-pressed={compact() ? "true" : "false"} onClick={() => setCompact(!compact())}>Toggle compact card</Button><Button variant="secondary" disabled={!pending()} onClick={() => {setPending(false);setSaved(saved()+1);}}>Complete preview save</Button></CardFooter></Card>
        </div>
      </section>
      <section class="demo-section" aria-labelledby="separator-heading"><h2 id="separator-heading">04 / Separator</h2><p>Decorative by default; opt into semantic separation when it adds meaning.</p><div class="samples h-16"><span>Overview</span><Separator decorative={false} orientation={vertical() ? 'vertical' : 'horizontal'} class={vertical() ? 'h-6 self-center' : 'max-w-24'} data-testid="live-separator" /><span>Activity</span><Button variant="outline" onClick={() => setVertical(!vertical())}>Change orientation</Button></div></section>
      <section class="demo-section" aria-labelledby="skeleton-heading"><h2 id="skeleton-heading">05 / Skeleton</h2><p>Quiet loading placeholders. Reduced motion is respected automatically.</p><div class="demo-grid"><Card aria-busy={pending() ? "true" : "false"}><CardContent class="pt-4"><Show when={pending()} fallback={<p>Content is ready. Save the preview above to see its loading state.</p>}><div role="status" class="sr-only">Loading preview</div><div class="samples"><Skeleton class="size-12 rounded-full" /><div class="flex-1 space-y-3"><Skeleton class="h-4 w-3/4" /><Skeleton class="h-4 w-1/2" /></div></div></Show></CardContent></Card><div class="snippet m-0"><code>{'<Loading fallback={<Skeleton class="h-24 w-full" />}><Content /></Loading>'}</code></div></div></section>
      <footer class="mt-16 border-t pt-6 text-xs text-muted-foreground">Five components · Shared semantic tokens · No application services</footer>
    </main>
  </div>;
}
render(() => <Playground />, document.getElementById('app')!);
