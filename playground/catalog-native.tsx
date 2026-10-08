// App-owned examples for native catalog compositions, shared with hydration tests; D19/D90.
import { createMemo, createSignal, Loading, Show } from 'solid-js';
import { Alert, AlertTitle, AlertDescription, AlertAction } from 'shadcn-solidjs-theme/ui/alert';
import { AspectRatio } from 'shadcn-solidjs-theme/ui/aspect-ratio';
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction, AttachmentTrigger, AttachmentGroup } from 'shadcn-solidjs-theme/ui/attachment';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from 'shadcn-solidjs-theme/ui/breadcrumb';
import { Bubble, BubbleGroup, BubbleContent, BubbleReactions } from 'shadcn-solidjs-theme/ui/bubble';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from 'shadcn-solidjs-theme/ui/button-group';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from 'shadcn-solidjs-theme/ui/empty';
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError, FieldSet, FieldLegend, FieldGroup, FieldSeparator, FieldTitle } from 'shadcn-solidjs-theme/ui/field';
import { InputGroup, InputGroupInput, InputGroupTextarea, InputGroupAddon, InputGroupButton, InputGroupText } from 'shadcn-solidjs-theme/ui/input-group';
import { Item, ItemGroup, ItemHeader, ItemFooter, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemSeparator } from 'shadcn-solidjs-theme/ui/item';
import { Kbd, KbdGroup } from 'shadcn-solidjs-theme/ui/kbd';
import { Marker, MarkerIcon, MarkerContent } from 'shadcn-solidjs-theme/ui/marker';
import { Message, MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter } from 'shadcn-solidjs-theme/ui/message';
import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from 'shadcn-solidjs-theme/ui/native-select';
import { Spinner } from 'shadcn-solidjs-theme/ui/spinner';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableCell, TableRow, TableCaption } from 'shadcn-solidjs-theme/ui/table';
/** Exercise content, forms, recovery and semantic compositions without services. */
export function NativeCatalogContent(){
 const [failed,setFailed]=createSignal(true);
 const [result,setResult]=createSignal('Nothing submitted');
 const [disabled,setDisabled]=createSignal(false);
 const [orientation,setOrientation]=createSignal<'horizontal'|'vertical'>('horizontal');
 return <div class="grid grid-cols-1 min-w-0 gap-8" data-testid="native-catalog">
 <Breadcrumb aria-label="Catalog path"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#native-catalog-heading">Catalog</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbEllipsis/></BreadcrumbItem><BreadcrumbSeparator> / </BreadcrumbSeparator><BreadcrumbItem><BreadcrumbPage>Native compositions</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
 <Alert variant={failed()?'destructive':'default'}><AlertTitle>{failed()?'Preview could not be saved':'Preview is ready'}</AlertTitle><AlertDescription>Your draft stays here. Retry this local preview.</AlertDescription><AlertAction><Button size="xs" onClick={()=>setFailed(false)}>Retry preview</Button></AlertAction></Alert>
 <div class="grid grid-cols-1 min-w-0 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
 <FieldSet disabled={disabled()}><FieldLegend>Contact preferences</FieldLegend><form id="catalog-form" onSubmit={event=>{event.preventDefault();setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));}}><FieldGroup>
 <Field><FieldContent><FieldLabel for="catalog-address">Contact address</FieldLabel><InputGroup><InputGroupAddon><InputGroupText>@</InputGroupText></InputGroupAddon><InputGroupInput id="catalog-address" name="address" defaultValue="hello" aria-describedby="catalog-address-help"/><InputGroupAddon align="inline-end"><InputGroupButton aria-label="Clear address" onClick={()=>{const field=document.getElementById('catalog-address') as HTMLInputElement;field.value='';field.focus();}}>×</InputGroupButton></InputGroupAddon></InputGroup><FieldDescription id="catalog-address-help">A local draft with an explicit label.</FieldDescription></FieldContent></Field>
 <Field orientation="responsive"><FieldLabel for="catalog-notes">Contact notes</FieldLabel><InputGroup><InputGroupTextarea id="catalog-notes" name="notes" defaultValue="Keep this draft"/><InputGroupAddon align="block-end"><InputGroupText>Plain text</InputGroupText></InputGroupAddon></InputGroup></Field>
 <Field><FieldLabel for="catalog-language">Language</FieldLabel><NativeSelect id="catalog-language" name="language"><NativeSelectOptGroup label="Languages"><NativeSelectOption value="en">English</NativeSelectOption><NativeSelectOption value="tr">Turkish</NativeSelectOption><NativeSelectOption value="xx" disabled>Unavailable</NativeSelectOption></NativeSelectOptGroup></NativeSelect><FieldError id="catalog-error" errors={failed()?[{message:'Retry to clear this preview error'},{message:'Retry to clear this preview error'}]:[]}/></Field>
 <FieldSeparator>Actions</FieldSeparator><ButtonGroup class="max-w-full flex-wrap" aria-label="Form actions" orientation={orientation()}><Button type="submit" aria-label="Submit catalog form">Save</Button><ButtonGroupSeparator/><Button type="reset" variant="outline" aria-label="Reset catalog form">Reset</Button><ButtonGroupText>Local only</ButtonGroupText></ButtonGroup><FieldTitle><output aria-live="polite" data-testid="catalog-result">{result()}</output></FieldTitle>
 </FieldGroup></form></FieldSet>
 <div class="space-y-6"><Button onClick={()=>setDisabled(!disabled())}>{disabled()?'Enable fields':'Disable fields'}</Button><Button variant="outline" onClick={()=>setOrientation(orientation()==='horizontal'?'vertical':'horizontal')}>Change group orientation</Button>
 <Empty class="border"><EmptyHeader><EmptyMedia variant="icon">◎</EmptyMedia><EmptyTitle>No saved previews</EmptyTitle><EmptyDescription>Finish a local draft to see a completed state.</EmptyDescription></EmptyHeader><EmptyContent><KbdGroup aria-label="Example shortcut"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></KbdGroup><span class="text-muted-foreground text-xs">Display only; no shortcut installed.</span></EmptyContent></Empty>
 <AspectRatio ratio={16/9} class="flex items-center justify-center rounded-lg bg-muted"><span>16:9 preview area</span></AspectRatio></div>
 </div>
 <section aria-label="Attachments"><AttachmentGroup><Attachment state={failed()?'error':'done'}><AttachmentMedia>↥</AttachmentMedia><AttachmentContent><AttachmentTitle>quarterly-report-with-a-long-file-name.pdf</AttachmentTitle><AttachmentDescription>{failed()?'Upload failed — retry below':'Ready • 240 KB'}</AttachmentDescription></AttachmentContent><AttachmentTrigger aria-label="Preview report" onClick={()=>setResult('Report preview opened')}/><AttachmentActions><AttachmentAction aria-label="Retry attachment" onClick={()=>setFailed(false)}>↻</AttachmentAction></AttachmentActions></Attachment><Attachment state="processing" size="sm" orientation="vertical"><AttachmentMedia><Spinner aria-label="Processing attachment"/></AttachmentMedia><AttachmentContent><AttachmentTitle>photo.png</AttachmentTitle><AttachmentDescription>Processing</AttachmentDescription></AttachmentContent></Attachment></AttachmentGroup></section>
 <ItemGroup aria-label="Preview items"><Item role="listitem" variant="outline"><ItemHeader>Available preview</ItemHeader><ItemMedia variant="icon">□</ItemMedia><ItemContent><ItemTitle>Example document</ItemTitle><ItemDescription>Long descriptions stay readable when text is enlarged.</ItemDescription></ItemContent><ItemActions><Button variant="outline" onClick={()=>setResult('Item opened')}>Open item</Button></ItemActions><ItemFooter>Updated just now</ItemFooter></Item><ItemSeparator/><Item role="listitem" variant="muted" size="sm"><ItemContent><ItemTitle>Another document</ItemTitle></ItemContent></Item></ItemGroup>
 <Table><TableCaption>Local preview summary</TableCaption><TableHeader><TableRow><TableHead scope="col">Document</TableHead><TableHead scope="col">Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableHead scope="row">Quarterly report</TableHead><TableCell>{failed()?'Needs retry':'Ready'}</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell colspan={2}>One document</TableCell></TableRow></TableFooter></Table>
 <MessageGroup><Marker variant="separator"><MarkerIcon>◷</MarkerIcon><MarkerContent>Today</MarkerContent></Marker><Message><MessageAvatar aria-label="Author initials">AL</MessageAvatar><MessageContent><MessageHeader>Alex</MessageHeader><BubbleGroup><Bubble variant="secondary"><BubbleContent>Your draft is preserved during retries.</BubbleContent><BubbleReactions aria-label="One positive reaction">+1</BubbleReactions></Bubble></BubbleGroup><MessageFooter>12:30</MessageFooter></MessageContent></Message><Message align="end"><MessageContent><Bubble align="end"><BubbleContent>Thanks, I’ll retry it.</BubbleContent></Bubble><MessageFooter>12:31</MessageFooter></MessageContent></Message></MessageGroup>
 <Show when={failed()}><p class="text-sm text-muted-foreground">All errors are local examples. Retry preserves your edits.</p></Show>
 </div>;
}
/** Show light/dark, RTL and custom colors without changing the shared component data. */
export function NativeCatalogExamples(){
 const [dark,setDark]=createSignal(new URLSearchParams(location.search).has('dark'));const [rtl,setRtl]=createSignal(false);const [custom,setCustom]=createSignal(false);
 return <div class={dark()?'dark min-h-screen bg-background text-foreground':'min-h-screen bg-background text-foreground'} dir={rtl()?'rtl':'ltr'} style={custom()?{'--primary':dark()?'oklch(0.8 0.1 285)':'oklch(0.4 0.15 285)','--radius':'1rem'}:{}}><main class="mx-auto max-w-4xl space-y-8 p-6"><header class="flex flex-wrap gap-3"><a href="/">All components</a><Button onClick={()=>setDark(!dark())}>Change theme</Button><Button onClick={()=>setRtl(!rtl())}>Change direction</Button><Button onClick={()=>setCustom(!custom())}>Custom colors</Button></header><h1 id="native-catalog-heading" class="text-3xl font-semibold">Native compositions</h1><NativeCatalogContent/><SpinnerLoadingExample/></main></div>;
}

/** Resolve application work under a real Solid Loading boundary. */
function SpinnerResult(props:{promise:Promise<string>}) { const result=createMemo(()=>props.promise);return <p data-testid="spinner-result">{result()}</p>; }
/** Demonstrate pending unmount and late resolution without component-owned work. */
function SpinnerLoadingExample(){
 let resolve!:(value:string)=>void;const promise=new Promise<string>(done=>{resolve=done;});const [mounted,setMounted]=createSignal(true);
 return <section class="space-y-4" aria-label="Loading example"><Show when={mounted()}><Loading fallback={<Spinner aria-label="Loading document"/>}><SpinnerResult promise={promise}/></Loading></Show><div class="flex flex-wrap gap-2"><Button onClick={()=>resolve('Document ready')}>Resolve document</Button><Button onClick={()=>setMounted(false)}>Unmount document</Button></div></section>;
}
