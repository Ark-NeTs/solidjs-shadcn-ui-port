// Confirm the foundation can be server-rendered without DOM setup; D19.
import { it, expect } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Separator, Skeleton, Input, Textarea, Label, Checkbox, Switch } from '../src';
it('renders semantic foundation markup on the server',()=>{
  const html=renderToString(()=><Card><CardHeader><CardTitle>Server card</CardTitle></CardHeader><CardContent><Badge>Ready</Badge><Button>Save</Button><Button as="a" href="/docs">Docs</Button><Separator decorative={false} orientation="vertical" /><Skeleton /></CardContent></Card>);
  expect(html).toContain('Server card');expect(html).toContain('type="button"');expect(html).toContain('href="/docs"');expect(html).toContain('role="separator"');expect(html).toContain('aria-orientation="vertical"');expect(html).toContain('data-slot="skeleton"');
});

it('renders named fields with labels, native values and validation attributes',()=>{
  const html=renderToString(()=><form><Label for="email">Email</Label><Input id="email" name="email" type="email" required defaultValue="hello@example.com" /><Label for="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue="Delivery instructions" aria-describedby="help" /><p id="help">Keep it short</p></form>);
  expect(html).toContain('for="email"');expect(html).toContain('type="email"');expect(html).toContain('name="email"');expect(html).toContain('hello@example.com');expect(html).toContain('required');expect(html).toContain('for="notes"');expect(html).toContain('Delivery instructions');expect(html).toContain('aria-describedby="help"');
});

it('server-renders toggle state, native forms and accessible roles',()=>{
  const html=renderToString(()=><form><Checkbox id="terms" name="terms" defaultChecked="indeterminate" aria-label="Terms" required/><Switch id="alerts" name="alerts" defaultChecked aria-label="Alerts" size="sm"/></form>);
  expect(html).toContain('aria-checked="mixed"');expect(html).toContain('data-indeterminate');expect(html).toContain('role="switch"');expect(html).toContain('aria-checked="true"');expect(html).toContain('name="terms"');expect(html).toContain('name="alerts"');expect(html).toContain('data-size="sm"');
});
