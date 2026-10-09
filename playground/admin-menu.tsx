// A realistic menu editor composes public components with an injected application service.
import {createSignal,For,Show,onSettled,untrack} from 'solid-js';
import {Button} from 'shadcn-solidjs-theme/ui/button';
import {Badge} from 'shadcn-solidjs-theme/ui/badge';
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from 'shadcn-solidjs-theme/ui/card';
import {DataTable,type ColumnDef} from 'shadcn-solidjs-theme/ui/data-table';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from 'shadcn-solidjs-theme/ui/dialog';
import {Input} from 'shadcn-solidjs-theme/ui/input';
import {Textarea} from 'shadcn-solidjs-theme/ui/textarea';
import {Label} from 'shadcn-solidjs-theme/ui/label';
import {Field,FieldError} from 'shadcn-solidjs-theme/ui/field';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from 'shadcn-solidjs-theme/ui/select';
import {NativeSelect,NativeSelectOption} from 'shadcn-solidjs-theme/ui/native-select';
import {Checkbox} from 'shadcn-solidjs-theme/ui/checkbox';
import {Switch} from 'shadcn-solidjs-theme/ui/switch';
import {createAdminMenu,createDemoMenuApi,type MenuApi,type MenuItem} from './admin-menu-model';
const categories=['Kitchen','Desserts','Drinks'].map(value=>({value,label:value}));
/** Render confirmed table rows and a separately owned edit dialog. */
export function AdminMenuContent(props:{api:MenuApi}){
 const menu=createAdminMenu(untrack(()=>props.api));let openedId='';let nameInput:HTMLInputElement|undefined;let filterContainer:HTMLDivElement|undefined;
 const columns:ColumnDef<MenuItem,unknown>[]=[
  {accessorKey:'name',header:'Menu item',enableHiding:false},
  {accessorKey:'category',header:'Category'},
  {accessorKey:'priceCents',header:'Price',cell:cell=><span class="tabular-nums">${(cell.getValue<number>()/100).toFixed(2)}</span>},
  {accessorKey:'available',header:'Availability',cell:cell=><Badge variant={cell.getValue<boolean>()?'secondary':'outline'}>{cell.getValue<boolean>()?'Available':'Unavailable'}</Badge>},
  {id:'actions',header:'Actions',enableHiding:false,cell:cell=><Button variant="outline" size="sm" data-menu-edit={cell.row.original.id} aria-label={`Edit ${cell.row.original.name}`} onClick={()=>{openedId=cell.row.original.id;menu.edit(cell.row.original);}}>Edit</Button>},
 ];
 /** Focus the first invalid native field once the controlled error nodes have rendered. */
 async function submit(event:SubmitEvent){event.preventDefault();await menu.save();if(menu.errors().name)nameInput?.focus();else if(menu.errors().price)document.getElementById('menu-price')?.focus();else if(menu.errors().notes)document.getElementById('menu-notes')?.focus();}
 return <section aria-label="Menu management" aria-busy={menu.loading()?'true':undefined} class="grid min-w-0 gap-5">
 <Card><CardHeader><CardTitle><h2>Today’s menu</h2></CardTitle><CardDescription>Edit a dish, review its details, and save it before changes appear in the table.</CardDescription></CardHeader><CardContent class="grid min-w-0 gap-4">
 <div class="flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-muted-foreground">{menu.rows().length} items · Prices in USD</p><Button variant="outline" disabled={menu.loading()||!!menu.draft()} onClick={()=>void menu.refresh()}>Refresh menu</Button></div>
 <p role="status" aria-live="polite" data-testid="menu-notice" class="text-sm">{menu.loading()?'Refreshing menu…':menu.notice()}</p>
 <div ref={filterContainer}><DataTable data={menu.rows()} columns={columns} getRowId={row=>row.id} caption="Restaurant menu items" selectable initialState={{pagination:{pageSize:5,pageIndex:0}}} pageSizes={[5,10,20]} filterPlaceholder="Search menu items…" error={menu.loadError()} onRetry={()=>void menu.refresh()}/></div>
 </CardContent></Card>
 <Dialog open={!!menu.draft()} dismissible={!menu.saving()} onOpenChange={open=>{if(!open)menu.close();}}><DialogContent showCloseButton={false} class="sm:max-w-lg" onOpenAutoFocus={event=>{event.preventDefault();nameInput?.focus();}} onCloseAutoFocus={event=>{event.preventDefault();onSettled(()=>{if(!filterContainer?.isConnected)return;const destination=filterContainer.querySelector<HTMLButtonElement>(`[data-menu-edit="${CSS.escape(openedId)}"]`)??filterContainer.querySelector<HTMLInputElement>('input');destination?.focus();});}}>
 <DialogHeader><DialogTitle>Edit menu item</DialogTitle><DialogDescription>Changes stay in your draft until the save succeeds.</DialogDescription></DialogHeader>
 <form id="menu-editor" novalidate onSubmit={submit} onReset={event=>{event.preventDefault();menu.reset();}} class="grid gap-4" aria-busy={menu.saving()?'true':undefined}>
 <fieldset disabled={menu.saving()} class="grid min-w-0 gap-4"><legend class="sr-only">Menu item details</legend>
 <Field data-invalid={!!menu.errors().name}><Label for="menu-name">Item name</Label><Input ref={nameInput} id="menu-name" name="name" required maxlength={80} value={menu.draft()?.name??''} onInput={event=>menu.update({name:event.currentTarget.value})} aria-invalid={menu.errors().name?'true':undefined} aria-describedby={menu.errors().name?'menu-name-error':undefined}/><Show when={menu.errors().name}><FieldError id="menu-name-error">{menu.errors().name}</FieldError></Show></Field>
 <div class="grid min-w-0 gap-4 sm:grid-cols-2"><Field data-invalid={!!menu.errors().price}><Label for="menu-price">Price (USD)</Label><Input id="menu-price" name="price" inputmode="decimal" required value={menu.draft()?.price??''} onInput={event=>menu.update({price:event.currentTarget.value})} aria-invalid={menu.errors().price?'true':undefined} aria-describedby={menu.errors().price?'menu-price-error':undefined}/><Show when={menu.errors().price}><FieldError id="menu-price-error">{menu.errors().price}</FieldError></Show></Field>
 <Field><Label for="menu-category">Category</Label><Select items={categories} name="category" value={menu.draft()?.category??'Kitchen'} onValueChange={category=>menu.update({category})} disabled={menu.saving()}><SelectTrigger id="menu-category" class="w-full"><SelectValue/></SelectTrigger><SelectContent aria-label="Menu categories"><For each={categories}>{item=><SelectItem value={item.value}/>}</For></SelectContent></Select></Field></div>
 <Field data-invalid={!!menu.errors().notes}><Label for="menu-notes">Kitchen notes</Label><Textarea id="menu-notes" name="notes" rows={3} maxlength={240} value={menu.draft()?.notes??''} onInput={event=>menu.update({notes:event.currentTarget.value})} aria-invalid={menu.errors().notes?'true':undefined} aria-describedby={menu.errors().notes?'menu-notes-error':undefined}/><Show when={menu.errors().notes}><FieldError id="menu-notes-error">{menu.errors().notes}</FieldError></Show></Field>
 <div class="flex flex-wrap gap-x-6 gap-y-4"><div class="flex items-center gap-2"><Checkbox id="menu-vegetarian" name="vegetarian" checked={menu.draft()?.vegetarian??false} onCheckedChange={checked=>menu.update({vegetarian:checked===true})}/><Label for="menu-vegetarian">Vegetarian</Label></div><div class="flex items-center gap-2"><Switch id="menu-available" name="available" checked={menu.draft()?.available??false} onCheckedChange={available=>menu.update({available})}/><Label for="menu-available">Available to order</Label></div></div>
 </fieldset>
 <Show when={menu.saveError()}><p role="alert" class="text-sm text-destructive-emphasis">{menu.saveError()}</p></Show><p role="status" class="text-sm">{menu.saving()?'Saving changes…':''}</p>
 <DialogFooter class="flex-wrap"><Button type="reset" variant="ghost" disabled={menu.saving()}>Reset draft</Button><Button variant="outline" disabled={menu.saving()} onClick={menu.close}>Cancel</Button><Button type="submit" disabled={menu.saving()}>{menu.saving()?'Saving…':'Save changes'}</Button></DialogFooter>
 </form></DialogContent></Dialog>
 </section>;
}
/** Keep service simulation controls separate from the actual admin workflow. */
export function AdminMenuExamples(){
 const dark=new URLSearchParams(location.search).has('dark');const [outcome,setOutcome]=createSignal('accept');const [saves,setSaves]=createSignal(0);const [reads,setReads]=createSignal(0);
 const api=createDemoMenuApi(()=>{const next=outcome();setOutcome('accept');return next;},kind=>kind==='save'?setSaves(count=>count+1):setReads(count=>count+1));
 return <div class={dark?'dark min-h-screen bg-background text-foreground':'min-h-screen bg-background text-foreground'}><main><a href="/" class="text-sm underline">All components</a><h1 class="mt-6 text-3xl font-semibold">Menu management</h1><p class="mt-3 mb-6 text-muted-foreground">A restaurant admin example. All changes stay in this local preview.</p><AdminMenuContent api={api}/><details class="mt-8 rounded-lg border p-4 text-sm"><summary class="cursor-pointer font-medium">Demo service controls</summary><div class="mt-4 grid gap-3"><Label for="menu-outcome">Next request outcome</Label><NativeSelect id="menu-outcome" value={outcome()} onChange={event=>setOutcome(event.currentTarget.value)}><NativeSelectOption value="accept">Accept</NativeSelectOption><NativeSelectOption value="reject">Reject once</NativeSelectOption><NativeSelectOption value="slow">Slow save</NativeSelectOption></NativeSelect><p>Each request restores the next outcome to Accept. Reloading resets all preview records.</p><p data-testid="menu-requests">Reads: {reads()} · Saves: {saves()}</p></div></details></main></div>;
}
