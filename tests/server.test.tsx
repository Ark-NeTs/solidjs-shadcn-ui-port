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

// Server markup keeps selected tab content and declared layer structure without DOM effects.
import { Tabs, TabsList, TabsTrigger, TabsContent, Popover, PopoverTrigger, PopoverContent, PopoverTitle, AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle } from '../src';
it('renders tabs and closed overlay triggers without a browser',()=>{
 const html=renderToString(()=><><Tabs defaultValue="one"><TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList><TabsContent value="one">Selected server panel</TabsContent><TabsContent value="two">Inactive child</TabsContent></Tabs><Popover><PopoverTrigger>Details</PopoverTrigger><PopoverContent><PopoverTitle>Popup</PopoverTitle></PopoverContent></Popover><AlertDialog><AlertDialogTrigger>Delete</AlertDialogTrigger><AlertDialogContent><AlertDialogTitle>Confirm</AlertDialogTitle></AlertDialogContent></AlertDialog></>);
 expect(html).toContain('Selected server panel');expect(html).not.toContain('Inactive child');expect(html).toContain('aria-selected="true"');expect(html).toContain('role="tabpanel"');expect(html).toContain('aria-expanded="false"');expect(html).not.toContain('role="alertdialog"');
});
it('renders forced overlay structure without opening native layers on the server',()=>{
 const html=renderToString(()=><><Popover><PopoverContent forceMount><PopoverTitle>Server popup</PopoverTitle></PopoverContent></Popover><AlertDialog><AlertDialogContent forceMount><AlertDialogTitle>Server alert</AlertDialogTitle></AlertDialogContent></AlertDialog></>);expect(html).toContain('Server popup');expect(html).toContain('Server alert');expect(html).toContain('popover="auto"');expect(html).toContain('role="alertdialog"');
});

import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from '../src';
it('renders the Combobox canonical value and form field without a browser',()=>{
 const html=renderToString(()=><form><Combobox items={['Apple','Banana']} defaultValue="Apple" name="fruit" required><ComboboxInput aria-label="Fruit"/><ComboboxContent><ComboboxList>{(item:string)=><ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></form>);expect(html).toContain('role="combobox"');expect(html).toContain('value="Apple"');expect(html).toContain('name="fruit"');expect(html).toContain('aria-expanded="false"');expect(html).not.toContain('role="listbox"');
});

it('emits real input values for native defaults and preserves explicit empty values', () => {
 const html=renderToString(()=><><Input defaultValue="server@example.com"/><Input value="current" defaultValue="baseline"/><Input value="" defaultValue="baseline"/></>);
 expect(html).not.toMatch(/defaultvalue/i);
 expect(html).toContain('value="server@example.com"');expect(html).toContain('value="current"');expect(html).toMatch(/<input value(?:=""|(?=\s))/);expect(html).not.toContain('baseline');
});
