// Searchable documentation, theme previews and published acceptance records; D19/D90.
import {createSignal,createMemo,For,Show,onSettled,onCleanup} from 'solid-js';
import {render} from '@solidjs/web';
import {Button} from 'shadcn-solidjs-theme/ui/button';
import {Input} from 'shadcn-solidjs-theme/ui/input';
import {Label} from 'shadcn-solidjs-theme/ui/label';
import {NativeSelect,NativeSelectOption} from 'shadcn-solidjs-theme/ui/native-select';
import './index.css';
import './docs.css';
import {DocsPreview} from './docs-preview';
const publicSite=import.meta.env.VITE_PUBLIC_SITE==='1';
const docsPath=publicSite?'/':'/docs.html';
const galleryPath=publicSite?'/playground':'/';
type Family={id:string;name:string;preview:string;heading:string};
type Registry={families:Family[];pages:{id:string;title:string;url:string}[]};
type Page={title:string;html:string};
const palettes:Record<'default'|'forest'|'ocean',Record<string,string>>={default:{},forest:{'--primary':'oklch(0.46 0.15 155)','--primary-foreground':'oklch(0.99 0 0)'},ocean:{'--primary':'oklch(0.45 0.15 255)','--primary-foreground':'oklch(0.99 0 0)'}};
/** Give each catalog link its own reactive owner and retain its DOM while searching. */
function ComponentLink(props:{item:Family;visible:boolean;href:string;selected:boolean}){return <li hidden={!props.visible}><a href={props.href} aria-current={props.selected?'page':undefined}>{props.item.name}</a></li>;}
/** Bound list reconciliation by alphabet group rather than one catalog-wide owner. */
function ComponentGroup(props:{letter:string;items:Family[];matches:(item:Family)=>boolean;href:(key:string,value:string)=>string;selected:string|null}){return <li hidden={!props.items.some(props.matches)}><h3 class="docs-letter">{props.letter}</h3><ul><For each={props.items}>{item=><ComponentLink item={item} visible={props.matches(item)} href={props.href('component',item.id)} selected={props.selected===item.id}/>}</For></ul></li>;}
/** Keep native URL navigation and independent page requests separate from theme state. */
function Documentation(){
 const params=new URLSearchParams(location.search);const component=params.get('component');const doc=params.get('doc')??'docs/GETTING-STARTED.md';
 const [registry,setRegistry]=createSignal<Registry|null>(null);const [page,setPage]=createSignal<Page|null>(null);const [error,setError]=createSignal('');const [loading,setLoading]=createSignal(true);
 const [query,setQuery]=createSignal('');const [dark,setDark]=createSignal(params.has('dark'));const [palette,setPalette]=createSignal<keyof typeof palettes>('default');const [radius,setRadius]=createSignal('0.45');const [copied,setCopied]=createSignal('');
 let request:AbortController|undefined;let alive=true;
 onCleanup(()=>{alive=false;request?.abort();});
 /** Accept only current requests so retry or disposal cannot publish stale content. */
 async function load(){request?.abort();const current=new AbortController();request=current;setLoading(true);setError('');
  try{const indexResponse=await fetch('/docs/index.json',{signal:current.signal});if(!indexResponse.ok)throw new Error('index');const index=await indexResponse.json() as Registry;if(!alive||current.signal.aborted)return;const family=index.families.find(item=>item.id===component);const document=index.pages.find(item=>item.id===doc);if(component&&!family||!component&&!document){setRegistry(index);setError('This documentation page does not exist. Choose a component or open Getting started.');return;}
   const response=await fetch(family?`/docs/pages/component-${family.id}.json`:document!.url,{signal:current.signal});if(!response.ok)throw new Error('page');const content=await response.json() as Page;if(!alive||current.signal.aborted)return;setRegistry(index);setPage(content);documentTitle(content.title);
   requestAnimationFrame(()=>{if(!alive||current.signal.aborted)return;const anchor=location.hash.slice(1);if(anchor)documentElement(anchor)?.scrollIntoView();});
  }catch{if(alive&&!current.signal.aborted)setError('Could not load the documentation. Your theme settings are retained. Try again.');}
  finally{if(alive&&!current.signal.aborted)setLoading(false);}
 }
 /** Give browser history and tabs the current article's accessible title. */
 function documentTitle(title:string){document.title=`${title} — Solid UI`;}
 /** Resolve only literal heading IDs, without interpreting selectors from the URL. */
 function documentElement(id:string){try{return document.getElementById(decodeURIComponent(id));}catch{return null;}}
 /** Preserve the selected appearance in links without replacing native navigation. */
 function href(key:string,value:string){return `${docsPath}?${key}=${encodeURIComponent(value)}${dark()?'&dark':''}`;}
 /** Copy the complete displayed code; denied clipboard access leaves it selectable. */
 async function copy(event:MouseEvent){const target=event.target;if(!(target instanceof HTMLElement)||!target.matches('[data-copy]'))return;const code=target.parentElement?.querySelector('code');if(!code)return;try{await navigator.clipboard.writeText(code.textContent??'');if(alive)setCopied('Code copied.');}catch{if(alive)setCopied('Clipboard unavailable. Select the code to copy it.');}}
 onSettled(()=>{void load();});
 const family=()=>registry()?.families.find(item=>item.id===component);
 const search=createMemo(()=>query().trim().toLowerCase());
 /** Preserve link identity during filtering instead of recreating the catalog. */
 const matches=(item:Family)=>`${item.name} ${item.heading}`.toLowerCase().includes(search());
 const filtered=createMemo(()=>registry()?.families.filter(matches)??[]);
 const groups=createMemo(()=>{const grouped=new Map<string,Family[]>();for(const item of registry()?.families??[]){const letter=item.name[0]!;if(!grouped.has(letter))grouped.set(letter,[]);grouped.get(letter)!.push(item);}return Array.from(grouped,([letter,items])=>({letter,items}));});
 return <div class={`docs-site${dark()?' dark':''}`} style={{...palettes[palette()],'--radius':`${radius()}rem`}}>
  <a class="docs-skip" href="#docs-content">Skip to documentation</a>
  <header class="docs-header"><a class="docs-brand" href={href('doc','docs/GETTING-STARTED.md')}><span aria-hidden="true" class="docs-mark">S</span> Solid UI <span class="docs-version">Solid 2</span></a><nav aria-label="Website"><a href={galleryPath}>Playground</a><a href={`${galleryPath}?admin-menu`}>Admin example</a><a href={href('doc',publicSite?'docs/PUBLIC-VERIFICATION.md':'docs/TEST-MATRIX.md')}>Test coverage</a></nav><Button variant="outline" size="sm" aria-pressed={dark()?'true':'false'} onClick={()=>setDark(value=>!value)}>Dark mode</Button></header>
  <div class="docs-layout"><aside class="docs-sidebar"><nav aria-label="Documentation"><a class="docs-start" href={href('doc','docs/GETTING-STARTED.md')}>Getting started</a><Label for="component-search">Find a component</Label><Input id="component-search" type="search" value={query()} onInput={event=>setQuery(event.currentTarget.value)} placeholder="Search 65 components…"/><p class="docs-count" role="status">{registry()?`${filtered().length} components`:'Loading catalog…'}</p><ul class="docs-components"><For each={groups()}>{group=><ComponentGroup letter={group.letter} items={group.items} matches={matches} href={href} selected={component}/>}</For></ul><Show when={registry()&&filtered().length===0}><p>No matching components.</p><Button variant="outline" onClick={()=>setQuery('')}>Clear search</Button></Show></nav></aside>
  <main id="docs-content" class="docs-main" tabindex="-1" aria-busy={loading()?'true':undefined}>
   <div class="docs-eyebrow">COMPONENTS FOR SOLID 2</div><Show when={loading()}><p role="status">Loading documentation…</p></Show><Show when={error()}><div role="alert"><h1>Documentation unavailable</h1><p>{error()}</p><Button onClick={()=>void load()}>Try again</Button></div></Show>
   <Show when={!loading()&&!error()&&page()}><div class="docs-title-row"><h1>{page()!.title}</h1><Show when={family()}><Button as="a" href={`${family()!.preview}${dark()?(family()!.preview.includes('?')?'&dark':'?dark'):''}`} variant="outline">Open live example <span aria-hidden="true">↗</span></Button></Show></div>
    <Show when={family()}><p class="docs-import"><code>shadcn-solidjs-theme/ui/{family()!.id}</code></p></Show>
    <Show when={family()}>{item=><DocsPreview id={item().id} name={item().name}/>}</Show>
    <article class="docs-prose" onClick={copy} innerHTML={page()!.html}/><p class="docs-copy-status" role="status">{copied()}</p>
   </Show>
   <footer class="docs-footer">Built with Solid signals. Documented contracts and reproducible tests.<br/>Solid 2 rc.13 · Kobalte evaluated first · Application data stays with your app.</footer>
  </main>
  <aside class="docs-theme" aria-label="Theme preview"><h2>Make it yours</h2><p>Preview semantic colors and corner shapes.</p><Label for="docs-palette">Palette</Label><NativeSelect id="docs-palette" value={palette()} onChange={event=>setPalette(event.currentTarget.value as keyof typeof palettes)}><NativeSelectOption value="default">Neutral</NativeSelectOption><NativeSelectOption value="forest">Forest</NativeSelectOption><NativeSelectOption value="ocean">Ocean</NativeSelectOption></NativeSelect><Label for="docs-radius">Corners</Label><NativeSelect id="docs-radius" value={radius()} onChange={event=>setRadius(event.currentTarget.value)}><NativeSelectOption value="0">Square</NativeSelectOption><NativeSelectOption value="0.45">Soft</NativeSelectOption><NativeSelectOption value="0.8">Round</NativeSelectOption></NativeSelect><div class="docs-sample"><span>Theme preview</span><Button>Primary action</Button><Button variant="outline">Secondary action</Button></div><pre aria-label="Theme variables" tabindex="0"><code>{`:root {\n  --radius: ${radius()}rem;${palette()==='default'?'':`\n  --primary: ${palettes[palette()]['--primary']};\n  --primary-foreground: oklch(0.99 0 0);`}\n}`}</code></pre></aside>
  </div>
 </div>;
}
render(()=><Documentation/>,document.getElementById('app')!);
