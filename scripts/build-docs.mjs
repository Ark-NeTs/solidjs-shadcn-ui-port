// Compile maintained Markdown into the standalone documentation website; D19/D90.
// Bun is build tooling only: no Markdown parser ships with the component library.
import {readFile,writeFile,mkdir,readdir,copyFile,stat,rm} from 'node:fs/promises';
import {resolve,relative,dirname,extname} from 'node:path';
import {existsSync,statSync} from 'node:fs';
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'playground/public/docs');
const markdown=globalThis.Bun?.markdown;
if(!markdown?.html)throw new Error('Documentation generation requires Bun 1.4.2 or later with Bun.markdown.');
const groups=JSON.parse(await readFile(resolve(root,'playground/docs-groups.json'),'utf8'));
const catalog=await readFile(resolve(root,'COMPONENT-MAP.md'),'utf8');
const sources=(await Promise.all(['','docs'].map(async directory=>(await readdir(resolve(root,directory))).filter(name=>name.endsWith('.md')&&name!=='AGENTS.md').map(name=>`${directory?`${directory}/`:''}${name}`)))).flat();
const documents=new Set(sources);const copied=new Map();const omitted=new Set();
// Rebuild this generated directory so removed pages/assets cannot remain in a release.
await rm(output,{recursive:true,force:true});
await mkdir(resolve(output,'pages'),{recursive:true});
/** Keep published assets inside this package and never expose dotfiles or directories. */
function packageFile(source,href){const file=resolve(root,dirname(source),decodeURIComponent(href));const path=relative(root,file);return path.startsWith('..')||path.split('/').some(part=>part.startsWith('.'))||path.split('/').at(-1)==='AGENTS.md'?null:{file,path};}
/** Rewrite maintained links to website pages or explicit source/evidence downloads. */
function link(source,href){
 if(/^(https?:|mailto:)/i.test(href))return href;
 if(href.startsWith('#'))return `/docs.html?doc=${encodeURIComponent(source)}${href}`;
 if(/^[a-z][\w+.-]*:/i.test(href)||href.startsWith('//')||href.startsWith('/'))return null;
 const [pathname,fragment]=href.split('#');const target=packageFile(source,pathname);
 if(!target||!existsSync(target.file)||!statSync(target.file).isFile()){omitted.add(`${source}: ${href}`);return null;}
 if(documents.has(target.path))return `/docs.html?doc=${encodeURIComponent(target.path)}${fragment?`#${fragment}`:''}`;
 const suffix=['.png','.jpg','.jpeg','.webp','.svg','.gif','.json','.txt'].includes(extname(target.path))?'':'.txt';
 const asset=`files/${target.path}${suffix}`;copied.set(asset,target.file);return `/docs/${asset}${fragment?`#${fragment}`:''}`;
}
/** Render only checked-in Markdown, escape raw HTML and reject executable URL schemes. */
async function compile(source,text){
 const html=markdown.html(text,{noHtmlBlocks:true,noHtmlSpans:true,headings:{ids:true}});
 return new globalThis.HTMLRewriter()
 .on('a',{element(element){const href=link(source,element.getAttribute('href')??'');if(href)element.setAttribute('href',href);else{element.removeAttribute('href');element.setAttribute('title','Repository reference; not part of this standalone website');}}})
 .on('img',{element(element){const src=link(source,element.getAttribute('src')??'');if(src){element.setAttribute('src',src);element.setAttribute('loading','lazy');}else element.remove();}})
 .on('pre',{element(element){element.setAttribute('tabindex','0');element.setAttribute('aria-label','Code example');element.prepend('<button type="button" data-copy>Copy code</button>',{html:true});}})
 .on('table',{element(element){element.before('<div class="docs-table" tabindex="0" role="region" aria-label="Reference table">',{html:true});element.after('</div>',{html:true});}})
 .transform(new Response(html)).text();
}
const guide=await readFile(resolve(root,'docs/components.md'),'utf8');
const sections=new Map([...guide.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(match=>[match[1],`## ${match[1]}\n${match[2]}`]));
const families=[];
for(const match of catalog.matchAll(/^\| \[([^\]]+)\]\(https:\/\/ui\.shadcn\.com\/docs\/components\/(?:radix\/)?([^/)]+)\) \|/gm)){
 const [,name,id]=match;const matches=groups.filter(group=>group.families.includes(id));if(matches.length!==1)throw new Error(`Expected one guide group for ${id}`);
 const group=matches[0];let section=sections.get(group.heading);if(!section)throw new Error(`Missing guide section ${group.heading}`);
 if(!section.includes('![')){const stem={'sheet':'sheet','drawer':'drawer','context-menu':'context-menu','dropdown-menu':'dropdown','menubar':'menubar','navigation-menu':'navigation-menu','command':'command-dialog'}[id];const screenshots=stem?[`${stem}-light.png`,`${stem}-dark.png`]:group.screenshots;section+='\n### Screenshots\n\n'+screenshots.map(file=>`![${name} in the ${file.includes('dark')?'dark':'light'} example gallery](screenshots/${file})`).join('\n\n');}
 families.push({id,name,preview:group.preview,heading:group.heading});
 await writeFile(resolve(output,`pages/component-${id}.json`),JSON.stringify({title:name,html:await compile('docs/components.md',section)}));
}
if(families.length!==65||groups.flatMap(group=>group.families).length!==65)throw new Error('The website must cover all 65 catalog families.');
const pages=[];
for(const source of sources){const text=await readFile(resolve(root,source),'utf8');const title=text.match(/^# (.+)$/m)?.[1]??source;const file=`pages/${source.replaceAll('/','--')}.json`;pages.push({id:source,title,url:`/docs/${file}`});await writeFile(resolve(output,file),JSON.stringify({title,html:await compile(source,text)}));}
for(const [asset,file] of copied){if(!(await stat(file)).isFile())throw new Error(`Documentation asset is not a file: ${file}`);const target=resolve(output,asset);await mkdir(dirname(target),{recursive:true});await copyFile(file,target);}
await writeFile(resolve(output,'index.json'),JSON.stringify({families:families.sort((a,b)=>a.name.localeCompare(b.name)),pages}));
console.log(`Documentation: ${families.length} components, ${pages.length} pages, ${copied.size} assets; ${omitted.size} repository-only references remain labeled.`);
