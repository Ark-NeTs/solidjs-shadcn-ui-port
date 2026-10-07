// Confirm the foundation can be server-rendered without DOM setup; D19.
import { it, expect } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Separator, Skeleton } from '../src';
it('renders semantic foundation markup on the server',()=>{
  const html=renderToString(()=><Card><CardHeader><CardTitle>Server card</CardTitle></CardHeader><CardContent><Badge>Ready</Badge><Button>Save</Button><Button as="a" href="/docs">Docs</Button><Separator decorative={false} orientation="vertical" /><Skeleton /></CardContent></Card>);
  expect(html).toContain('Server card');expect(html).toContain('type="button"');expect(html).toContain('href="/docs"');expect(html).toContain('role="separator"');expect(html).toContain('aria-orientation="vertical"');expect(html).toContain('data-slot="skeleton"');
});
