// Real router/query consumers with explicitly settled local requests; D19/D90.
import {createMemo,createSignal,Loading,isPending,onCleanup} from 'solid-js';
import {render} from '@solidjs/web';
import {createRouter} from '@solidjs/router';
import {QueryClient,QueryClientProvider,useQuery} from '@tanstack/solid-query';
import {Button} from 'shadcn-solidjs-theme/ui/button';
import {Input} from 'shadcn-solidjs-theme/ui/input';
import {Label} from 'shadcn-solidjs-theme/ui/label';
import {Skeleton} from 'shadcn-solidjs-theme/ui/skeleton';
import {Tabs,TabsList,TabsTrigger,TabsContent} from 'shadcn-solidjs-theme/ui/tabs';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from 'shadcn-solidjs-theme/ui/dialog';
import '../../playground/index.css';
type Data={title:string};
const waiting=new Map<string,()=>void>();let requests=0;
/** Query owns caching; this deterministic service owns transport and cancellation. */
function fetchData(key:string,signal:AbortSignal){requests++;return new Promise<Data>((resolve,reject)=>{const abort=()=>{waiting.delete(key);reject(new Error('Aborted'));};waiting.set(key,()=>{signal.removeEventListener('abort',abort);waiting.delete(key);resolve({title:`${key} is ready`});});signal.addEventListener('abort',abort,{once:true});});}
/** Read the query's suspending value only within an actual Solid Loading owner. */
function QueryText(props:{name:string}){const result=useQuery(()=>({queryKey:['consumer',props.name],queryFn:({signal})=>fetchData(props.name,signal),staleTime:Infinity,retry:false}));return <p>{result.data.title}</p>;}
/** Keep the committed tab and its data together until the next query has settled. */
function MenuTabs(){const [selected,setSelected]=createSignal('overview');const result=useQuery(()=>({queryKey:['consumer',selected()],queryFn:({queryKey,signal})=>fetchData(String(queryKey[1]),signal),staleTime:Infinity,retry:false}));const ready=createMemo(()=>({tab:selected(),title:result.data.title}));return <><p role="status">{isPending(ready)?'Updating menu…':'Menu ready'}</p><Tabs value={ready().tab} onValueChange={setSelected}><TabsList aria-label="Menu views"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="inventory">Inventory</TabsTrigger></TabsList><TabsContent value="overview"><p>{ready().title}</p></TabsContent><TabsContent value="inventory"><p>{ready().title}</p></TabsContent></Tabs></>;}
/** Compose a data-backed page and a independently loading modal using public UI parts. */
function Menu(){return <section><h2>Menu route</h2><Loading fallback={<div role="status">Loading menu…<Skeleton class="h-8 w-48"/></div>}><MenuTabs/></Loading><Dialog><DialogTrigger>Inspect details</DialogTrigger><DialogContent><DialogTitle>Menu details</DialogTitle><DialogDescription>Query-backed content inside the modal.</DialogDescription><Loading fallback={<div role="status">Loading details…<Skeleton class="h-8 w-48"/></div>}><QueryText name="details"/></Loading><Button onClick={()=>waiting.get('details')?.()}>Resolve details</Button></DialogContent></Dialog></section>;}
/** A second route exercises unmounting, native links, history and cached remounts. */
function Settings(){return <section><h2>Settings route</h2><p>Your menu draft remains in the application shell.</p></section>;}
const Router=createRouter({preloadLinks:false,routes:[{path:'/',component:Menu},{path:'/settings',component:Settings}]});
/** Keep query cache and shell form ownership above route-level component disposal. */
function App(){const client=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false,gcTime:Infinity}}});const [count,setCount]=createSignal(0);onCleanup(()=>client.clear());return <QueryClientProvider client={client}><Router>{props=><main class="grid gap-5"><h1>Solid consumer compatibility</h1><nav aria-label="Application"><Button as="a" href="/">Menu page</Button><Button as="a" href="/settings" variant="outline">Settings page</Button></nav><Label for="consumer-draft">Persistent draft</Label><Input id="consumer-draft" defaultValue="Initial draft"/><div class="flex gap-2"><Button onClick={()=>{for(const settle of [...waiting.values()])settle();setCount(requests);}}>Resolve requests</Button><output data-testid="request-count">Requests: {count()}</output></div>{props.children}</main>}</Router></QueryClientProvider>;}
render(()=><App/>,document.getElementById('app')!);
