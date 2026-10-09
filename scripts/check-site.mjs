// Reject incomplete or internal-only files before a static artifact can be deployed; D19/D90.
import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');const out=resolve(root,'site-dist');
/** Inspect every file, including files absent from the generated navigation. */
async function walk(directory){const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const file=resolve(directory,entry.name);assert(!entry.isSymbolicLink(),`Unexpected symlink: ${file}`);if(entry.isDirectory())result.push(...await walk(file));else result.push(file);}return result;}
const index=JSON.parse(await readFile(resolve(out,'docs/index.json'),'utf8'));
const families=new Set(index.families.map(item=>item.id));const pages=new Set(index.pages.map(item=>item.id));
assert.equal(families.size,65);assert.deepEqual([...pages].sort(),['docs/GETTING-STARTED.md','docs/PUBLIC-VERIFICATION.md','docs/components.md']);
assert.equal(await readFile(resolve(out,'legal/LICENSE.txt'),'utf8'),await readFile(resolve(root,'LICENSE'),'utf8'));
const notices=await readFile(resolve(out,'legal/THIRD-PARTY-NOTICES.txt'),'utf8');
for(const notice of ['SIL OPEN FONT LICENSE','Apache License','Ryan Carniato','David Jerleke'])assert(notices.includes(notice),`Missing upstream notice: ${notice}`);
for(const entry of ['index.html','docs.html','playground.html','404.html','_headers','robots.txt'])assert(existsSync(resolve(out,entry)),`Missing ${entry}`);
for(const family of index.families){assert.equal(new URL(family.preview,'https://docs.test').pathname,'/playground');const page=JSON.parse(await readFile(resolve(out,`docs/pages/component-${family.id}.json`),'utf8'));assert(page.html.includes('<code'),`${family.id} needs code`);assert(page.html.includes('<img'),`${family.id} needs screenshots`);}
const files=await walk(out);
const expectedPages=[...[...pages].map(source=>`docs/pages/${source.replaceAll('/','--')}.json`),...[...families].map(id=>`docs/pages/component-${id}.json`)];
assert.deepEqual(files.map(file=>relative(out,file)).filter(path=>path.startsWith('docs/pages/')).sort(),expectedPages.sort(),'Public page files must exactly match the approved documentation inventory');
let bytes=0;
for(const file of files){const path=relative(out,file);const size=(await stat(file)).size;bytes+=size;assert(size<=25*1024*1024,`Asset exceeds 25 MiB: ${path}`);assert(!/(^|\/)(evidence|tests|validation|node_modules|AGENTS\.md|CLAUDE\.md)(\/|\.|$)/i.test(path),`Internal asset: ${path}`);assert(!path.endsWith('.map'),`Source map: ${path}`);
 assert(/^(assets\/[^/]+|docs\/index\.json|docs\/pages\/[^/]+\.json|docs\/files\/(LICENSE\.txt|docs\/screenshots\/[^/]+\.(png|jpe?g|webp|svg|gif))|legal\/(LICENSE|THIRD-PARTY-NOTICES)\.txt|index\.html|docs\.html|playground\.html|404\.html|_headers|robots\.txt|deployment\.json)$/.test(path),`Unapproved public file: ${path}`);
 if(!/\.(png|jpe?g|gif|webp|woff2?)$/.test(path)){const text=await readFile(file,'utf8');assert(!/\/Users\/|\/private\/tmp\/|\/home\/[^\s/]+\//.test(text),`Local filesystem path in ${path}`);
  if(path.startsWith('docs/pages/')){const {html}=JSON.parse(text);const links=[];await new HTMLRewriter().on('a[href],img[src]',{element(element){links.push(element.getAttribute(element.tagName==='img'?'src':'href'));}}).transform(new Response(html)).text();for(const link of links){if(!link.startsWith('/'))continue;const url=new URL(link,'https://docs.test');if(url.pathname==='/'){if(url.searchParams.has('doc'))assert(pages.has(url.searchParams.get('doc')),`Unpublished page ${link}`);if(url.searchParams.has('component'))assert(families.has(url.searchParams.get('component')),`Unknown component ${link}`);}else assert(existsSync(resolve(out,url.pathname.slice(1))),`Missing public asset ${link}`);}}
 }
}
assert(files.length<=20000,'Asset count exceeds the free-plan limit');
console.log(JSON.stringify({components:families.size,guides:pages.size,files:files.length,bytes,largestFile:Math.max(...await Promise.all(files.map(async file=>(await stat(file)).size))),internalAssets:0}));
