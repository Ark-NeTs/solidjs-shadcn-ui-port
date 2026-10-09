// Guard the published documentation inventory, rendered examples and assets; D19/D90.
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {beforeAll,expect,it} from 'vitest';
const root=resolve(import.meta.dirname,'../..');const output=resolve(root,'playground/public/docs');
beforeAll(()=>{mkdirSync(resolve(output,'pages'),{recursive:true});writeFileSync(resolve(output,'pages/obsolete.json'),'{}');execFileSync('bun',['scripts/build-docs.mjs'],{cwd:root,stdio:'pipe'});});
it('publishes every component with a guide, code, screenshots and an existing preview route',()=>{
 const index=JSON.parse(readFileSync(resolve(output,'index.json'),'utf8')) as {families:{id:string;name:string;preview:string}[]};
 expect(index.families.map(family=>family.id).sort()).toEqual(readdirSync(resolve(root,'src/components/ui')).filter(name=>name.endsWith('.tsx')).map(name=>name.slice(0,-4)).sort());
 const preview=readFileSync(resolve(root,'playground/index.tsx'),'utf8');
 for(const family of index.families){const page=JSON.parse(readFileSync(resolve(output,`pages/component-${family.id}.json`),'utf8'));const doc=new DOMParser().parseFromString(page.html,'text/html');expect(page.title).toBe(family.name);expect(doc.querySelector('pre code'),family.id).not.toBeNull();const source=readFileSync(resolve(root,`src/components/ui/${family.id}.tsx`),'utf8');const names=[...source.matchAll(/export (?:function|const) ([A-Z]\w*)/g)].map(match=>match[1]);const examples=[...doc.querySelectorAll('pre code')].map(code=>code.textContent).join('\n');expect(names.some(name=>new RegExp(`<${name}\\b`).test(examples)),`${family.id} needs its own JSX example`).toBe(true);expect(doc.querySelectorAll('img').length,family.id).toBeGreaterThan(0);for(const image of doc.images)expect(existsSync(resolve(output,image.getAttribute('src')!.replace('/docs/','')))).toBe(true);if(family.preview.includes('?'))expect(preview).toContain(`query.has('${family.preview.split('?')[1]}')`);}
});
it('rewrites documentation pages and source references without publishing executable HTML',()=>{
 expect(existsSync(resolve(output,'pages/obsolete.json'))).toBe(false);expect(existsSync(resolve(output,'pages/AGENTS.md.json'))).toBe(false);
 const index=JSON.parse(readFileSync(resolve(output,'index.json'),'utf8')) as {pages:{id:string;url:string}[]};const ids=new Set(index.pages.map(page=>page.id));
 for(const page of index.pages){const content=JSON.parse(readFileSync(resolve(output,page.url.replace('/docs/','')),'utf8'));const doc=new DOMParser().parseFromString(content.html,'text/html');expect(doc.querySelectorAll('script,iframe,object,embed')).toHaveLength(0);for(const anchor of doc.querySelectorAll('a[href]')){const href=anchor.getAttribute('href')!;expect(href).not.toMatch(/^(javascript|data|vbscript):/i);if(href.startsWith('/docs.html'))expect(ids.has(new URL(href,'https://example.test').searchParams.get('doc')!)).toBe(true);else if(href.startsWith('/docs/'))expect(existsSync(resolve(output,href.split('#')[0]!.replace('/docs/','')))).toBe(true);}}
});

it('public generation excludes internal reports and clears obsolete public assets',()=>{
 const publicOutput=resolve(root,'playground/public-site/docs');mkdirSync(resolve(publicOutput,'files/docs/evidence'),{recursive:true});writeFileSync(resolve(publicOutput,'files/docs/evidence/stale.json'),'{}');execFileSync('bun',['scripts/build-docs.mjs','--public'],{cwd:root,stdio:'pipe'});
 const index=JSON.parse(readFileSync(resolve(publicOutput,'index.json'),'utf8')) as {families:{id:string;preview:string}[];pages:{id:string}[]};expect(index.families).toHaveLength(65);expect(index.pages.map(page=>page.id).sort()).toEqual(['docs/GETTING-STARTED.md','docs/PUBLIC-VERIFICATION.md','docs/components.md']);expect(existsSync(resolve(publicOutput,'files/docs/evidence'))).toBe(false);expect(existsSync(resolve(publicOutput,'pages/AGENTS.md.json'))).toBe(false);expect(readFileSync(resolve(publicOutput,'files/LICENSE.txt'),'utf8')).toBe(readFileSync(resolve(root,'LICENSE'),'utf8'));for(const family of index.families)expect(new URL(family.preview,'https://docs.test').pathname).toBe('/playground');
});

it('discovers relocated documents as navigable pages and rewrites root links to their new IDs',()=>{
 const index=JSON.parse(readFileSync(resolve(output,'index.json'),'utf8')) as {pages:{id:string;url:string}[]};
 const ids=index.pages.map(page=>page.id);
 expect(ids).toEqual(expect.arrayContaining(['docs/project/specs.md','docs/project/COMPONENT-MAP.md','docs/project/DECISIONS.md','docs/checklists/DELIVERY.md','docs/validation/KOBALTE-CHOICES.md','docs/delivery/FOUNDATION-DELIVERY.md']));
 expect(ids).not.toContain('COMPONENT-MAP.md');
 const page=JSON.parse(readFileSync(resolve(output,'pages/README.md.json'),'utf8'));
 const doc=new DOMParser().parseFromString(page.html,'text/html');
 expect([...doc.querySelectorAll('a[href]')].map(anchor=>anchor.getAttribute('href'))).toContain('/docs.html?doc=docs%2Fproject%2FDECISIONS.md');
 expect([...doc.querySelectorAll('a[href]')].map(anchor=>anchor.getAttribute('href'))).toContain('/docs.html?doc=docs%2Fdelivery%2FFOUNDATION-DELIVERY.md');
});
