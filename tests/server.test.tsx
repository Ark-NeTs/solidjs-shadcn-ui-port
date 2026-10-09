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

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Collapsible, CollapsibleTrigger, CollapsibleContent } from '../src';
it('renders disclosure state, custom ID relationships, disabled buttons and mount policy on the server',()=>{
 const html=renderToString(()=><><Accordion type="single" defaultValue="a"><AccordionItem value="a" triggerId="question" contentId="answer"><AccordionTrigger>Server question</AccordionTrigger><AccordionContent>Server answer</AccordionContent></AccordionItem><AccordionItem value="b" disabled><AccordionTrigger>Unavailable</AccordionTrigger><AccordionContent>Unmounted answer</AccordionContent></AccordionItem></Accordion><Collapsible><CollapsibleTrigger>Server details</CollapsibleTrigger><CollapsibleContent forceMount>Retained body</CollapsibleContent></Collapsible></>);
 expect(html).toContain('aria-expanded="true"');expect(html).toContain('aria-disabled="true"');expect(html).toContain('aria-controls="answer"');expect(html).toContain('aria-labelledby="question"');expect(html).toContain('role="region"');expect(html).toContain('Server answer');expect(html).not.toContain('Unmounted answer');expect(html).toContain('Retained body');expect(html).toContain('hidden');expect(html).toContain('disabled');
});

import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent, HoverCard, HoverCardTrigger, HoverCardContent } from '../src';
it('renders preview description IDs and native links without opening a browser layer',()=>{
 const html=renderToString(()=><><TooltipProvider><Tooltip defaultOpen contentId="tip-server"><TooltipTrigger aria-describedby="help">Save</TooltipTrigger><TooltipContent>Supplement</TooltipContent></Tooltip></TooltipProvider><HoverCard><HoverCardTrigger href="/profile">Profile</HoverCardTrigger><HoverCardContent forceMount>Retained profile</HoverCardContent></HoverCard></>);
 expect(html).toContain('aria-describedby="help tip-server"');expect(html).toContain('id="tip-server"');expect(html).toContain('role="tooltip"');expect(html).toContain('popover="manual"');expect(html).toContain('href="/profile"');expect(html).toContain('Retained profile');expect(html).toContain('hidden');expect(html).not.toContain('data-native-open');
});

import { RadioGroup, RadioGroupItem, Toggle, ToggleGroup, ToggleGroupItem } from '../src';
it('renders choice values, names and pressed semantics on the server',()=>{
 const html=renderToString(()=><><RadioGroup name="delivery" defaultValue="a" required><RadioGroupItem value="a" aria-label="Pickup"/><RadioGroupItem value="b" disabled aria-label="Shipping"/></RadioGroup><Toggle defaultPressed>Bold</Toggle><ToggleGroup type="multiple" defaultValue={['a']}><ToggleGroupItem value="a">Left</ToggleGroupItem><ToggleGroupItem value="b">Right</ToggleGroupItem></ToggleGroup></>);
 expect(html).toContain('role="radiogroup"');expect(html).toContain('name="delivery"');expect(html).toContain('aria-checked="true"');expect(html).toContain('required');expect(html).toContain('disabled');expect(html).toContain('aria-pressed="true"');expect(html).toContain('aria-pressed="false"');expect(html).toContain('data-state="on"');
});

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../src';
it('renders Select labels, native selected values, required state and retained closed options on the server',()=>{
 const items=[{value:'apple',label:'Apple'},{value:'cherry',label:'Cherry',disabled:true}];const html=renderToString(()=><Select items={items} name="fruit" defaultValue="apple" required><SelectTrigger aria-label="Fruit"><SelectValue placeholder="Choose"/></SelectTrigger><SelectContent>{item=><SelectItem value={item.value}/>}</SelectContent></Select>);
 expect(html).toContain('role="combobox"');expect(html).toContain('Apple');expect(html).toContain('aria-expanded="false"');expect(html).toContain('name="fruit"');expect(html).toContain('selected');expect(html).toContain('required');expect(html).toContain('disabled');expect(html).toContain('role="listbox"');expect(html).toContain('hidden');expect(html).not.toContain('data-native-open');
});

import { Slider } from '../src';
it('renders Slider bounds, thumb values, names and vertical semantics on the server',()=>{
 const html=renderToString(()=><Slider aria-label="Server range" thumbLabels={['Minimum','Maximum']} defaultValue={[20,80]} name="range" minStepsBetweenThumbs={10} orientation="vertical" disabled/>);
 expect(html).toContain('role="slider"');expect(html).toContain('aria-label="Minimum"');expect(html).toContain('aria-valuenow="20"');expect(html).toContain('aria-valuenow="80"');expect(html).toContain('aria-valuemax="70"');expect(html).toContain('aria-valuemin="30"');expect(html).toContain('aria-orientation="vertical"');expect(html.match(/name="range"/g)).toHaveLength(2);expect(html).toContain('value="20"');expect(html).toContain('value="80"');expect(html).toContain('disabled');
});

import { Progress } from '../src';
it('renders Progress values, external names, completed and unknown states on the server',()=>{
 const html=renderToString(()=><><span id="work">Work</span><Progress value={25} max={50} aria-labelledby="work"/><Progress value={50} max={50} aria-label="Done"/><Progress aria-label="Unknown"/></>);
 expect(html.match(/role="progressbar"/g)).toHaveLength(3);expect(html).toContain('aria-labelledby="work"');expect(html).toContain('aria-valuenow="25"');expect(html).toContain('aria-valuemax="50"');expect(html).toContain('aria-valuetext="50%"');expect(html).toContain('data-state="complete"');expect(html).toContain('data-state="indeterminate"');expect(html.match(/aria-valuenow=/g)).toHaveLength(2);
});


import { NativeCatalogContent } from '../playground/catalog-native';
it('renders native catalog semantics, form defaults and recovery content on the server',()=>{
 const html=renderToString(()=><NativeCatalogContent/>);for(const text of ['data-slot="alert"','data-slot="aspect-ratio"','data-slot="attachment"','data-slot="breadcrumb"','data-slot="bubble"','data-slot="button-group"','data-slot="empty"','data-slot="field"','data-slot="input-group"','data-slot="item"','data-slot="kbd"','data-slot="marker"','data-slot="message"','data-slot="native-select"','data-slot="spinner"','data-slot="table"','value="hello"','Keep this draft','role="alert"','for="catalog-address"','scope="col"','scope="row"'])expect(html).toContain(text);
});

import {DisplayCatalogContent} from '../playground/catalog-display';
it('renders Avatar fallback, Pagination current page, nested Direction and semantic prose on the server',()=>{const html=renderToString(()=><DisplayCatalogContent/>);for(const text of ['data-slot="avatar"','data-slot="avatar-fallback"','AL','aria-current="page"','aria-disabled="true"','data-slot="direction-provider"','dir="ltr"','data-slot="typography"','<blockquote','<code'])expect(html).toContain(text);expect(html).not.toContain('data-slot="avatar-image"');});

import {ModalCatalogContent} from '../playground/catalog-modal';
it('renders retained Dialog Sheet and Drawer names, closed state and drafts on the server',()=>{const html=renderToString(()=><ModalCatalogContent/>);for(const text of ['data-slot="dialog-content"','data-slot="sheet-content"','data-slot="drawer-content"','data-slot="drawer-handle"','data-state="closed"','aria-expanded="false"','editor-title-initial','Keep this draft','data-side="right"','data-vaul-drawer-direction="bottom"'])expect(html).toContain(text);});

import {MenuCatalogContent} from '../playground/catalog-menus';
it('renders menu controls, navigation links and searchable commands without opening overlays on the server',()=>{const html=renderToString(()=><MenuCatalogContent/>);for(const text of ['data-slot="dropdown-menu-trigger"','data-slot="context-menu-trigger"','role="menubar"','aria-label="Library navigation"','role="combobox"','role="listbox"','Create workspace','aria-disabled="true"'])expect(html).toContain(text);expect(html).not.toContain('data-slot="dropdown-menu-content"');expect(html).not.toContain('No matching commands');});

import {DateCatalogContent} from '../playground/catalog-dates';
it('renders deterministic calendar selection, date fields and one accessible OTP input on the server',()=>{const html=renderToString(()=><DateCatalogContent/>);for(const text of ['data-slot="calendar"','role="grid"','2026-10-07','data-slot="date-picker"','data-slot="input-otp"','autocomplete="one-time-code"','name="code"'])expect(html).toContain(text);expect(html).not.toContain('data-slot="popover-content"');});

import {LayoutCatalogContent} from '../playground/catalog-layout';
it('renders stable layout panels, scroll viewports and authored slides on the server',()=>{const html=renderToString(()=><LayoutCatalogContent/>);for(const text of ['data-slot="resizable-panel-group"','id="layout-first"','role="separator"','data-slot="scroll-area-viewport"','aria-roledescription="carousel"','Slide 1','data-slot="message-scroller-viewport"','Message 1'])expect(html).toContain(text);});

import {NotificationCatalogContent} from '../playground/catalog-notifications';
import {createToastStore} from '../src/lib/notifications';
it('renders notification regions without global server writes or client timers',()=>{const html=renderToString(()=><NotificationCatalogContent/>);expect(html).toContain('Composed notifications');expect(html).toContain('Service notifications');expect(html).not.toContain('data-slot="toast"');const store=createToastStore();store.show('Server private data');store.promise(Promise.resolve('secret'),{loading:'Loading',success:'Done',error:'Error'});expect(store.getSnapshot()).toEqual([]);});

import {SidebarCatalogContent} from '../playground/catalog-sidebar';
it('renders desktop navigation and deterministic sidebar placeholders without browser media APIs',()=>{const html=renderToString(()=><SidebarCatalogContent/>);for(const text of ['data-slot="sidebar"','<aside','role="complementary"','data-slot="sidebar-input"','aria-current="page"','--skeleton-width:70%'])expect(html).toContain(text);expect(html).not.toContain('<dialog');});

import {ChartCatalogContent} from '../playground/catalog-chart';
it('renders Chart data alternatives and scoped styles without a browser canvas',()=>{const html=renderToString(()=><ChartCatalogContent/>);for(const text of ['data-slot="chart"','<canvas','role="img"','Monthly visitors data','January','186','--color-desktop'])expect(html).toContain(text);});

import {QuestionnaireCatalogContent} from '../playground/catalog-questionnaire';
it('renders Questionnaire fieldsets and inactive answers without browser form work',()=>{const html=renderToString(()=><QuestionnaireCatalogContent/>);for(const text of ['data-slot="questionnaire"','<fieldset','<legend','type="radio"','type="checkbox"','name="role"','inert','hidden'])expect(html).toContain(text);});

import {DataTableCatalogContent} from '../playground/catalog-data-table';
it('renders Data Table headers, first-page rows and selection controls without browser work',()=>{const html=renderToString(()=><DataTableCatalogContent/>);for(const text of ['Customer accounts','Customer 01','Customer 10','Select all rows on this page','aria-sort="none"','Rows per page'])expect(html).toContain(text);expect(html).not.toContain('Customer 11');});
