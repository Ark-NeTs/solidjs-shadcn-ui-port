/* Dev-only visual playground (not part of the library build or published files).
   Renders a slice of the set in light and a `.dark` panel to confirm the theme
   tokens paint in a real browser — accent, radius, dark. */
import { render } from 'solid-js/web';
import './index.css';
import { Badge } from 'shadcn-solidjs-theme/badge';
import { Button } from 'shadcn-solidjs-theme/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'shadcn-solidjs-theme/card';
import { Switch, SwitchControl, SwitchThumb } from 'shadcn-solidjs-theme/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'shadcn-solidjs-theme/tabs';

function Showcase() {
  return (
    <div class="grid gap-5">
      <div class="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Badge>Soon</Badge>
        <Badge variant="secondary">Current</Badge>
        <Badge variant="outline">rank 100</Badge>
        <Badge variant="success">Ready</Badge>
        <Badge variant="warning">Preparing</Badge>
        <Badge variant="error">Cancelled</Badge>
      </div>
      <Card class="max-w-sm">
        <CardHeader>
          <CardTitle>Bella Vista</CardTitle>
          <CardDescription>Italian restaurant · rank 100</CardDescription>
        </CardHeader>
        <CardContent class="flex items-center gap-3">
          <Switch>
            <SwitchControl>
              <SwitchThumb />
            </SwitchControl>
          </Switch>
          <span class="text-sm text-muted-foreground">Menu enabled</span>
        </CardContent>
      </Card>
      <Tabs defaultValue="items" class="max-w-sm">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>
        <TabsContent value="items" class="text-sm text-muted-foreground">
          Menu items live here.
        </TabsContent>
        <TabsContent value="extras" class="text-sm text-muted-foreground">
          Extras live here.
        </TabsContent>
      </Tabs>
    </div>
  );
}

function App() {
  return (
    <div class="min-h-screen bg-background p-8 font-sans text-foreground">
      <h1 class="mb-6 text-xl font-semibold">shadcn-solidjs-theme — light</h1>
      <Showcase />
      <div class="dark mt-10 rounded-lg border bg-background p-8 text-foreground">
        <h1 class="mb-6 text-xl font-semibold">dark (via .dark)</h1>
        <Showcase />
      </div>
    </div>
  );
}

render(() => <App />, document.getElementById('root')!);
