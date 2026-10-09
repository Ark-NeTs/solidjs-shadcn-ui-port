// Produce a curated, portable static website without publishing it; D19/D90.
import {spawnSync} from 'node:child_process';
import {copyFile,rename,mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
/** Stop before packaging stale output when a build step fails. */
function run(command,args,env={}){const result=spawnSync(command,args,{cwd:root,stdio:'inherit',env:{...process.env,...env}});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);}
run('bun',['run','build']);
run('bun',['scripts/build-docs.mjs','--public']);
run('bun',['x','--no-install','vite','build','--config','playground/vite.config.ts'],{THEME_BUILT:'1',VITE_PUBLIC_SITE:'1'});
const out=resolve(root,'site-dist');
await rename(resolve(out,'index.html'),resolve(out,'playground.html'));
await copyFile(resolve(out,'docs.html'),resolve(out,'index.html'));
for(const file of ['404.html','_headers','robots.txt'])await copyFile(resolve(root,'deployment',file),resolve(out,file));
await mkdir(resolve(out,'legal'),{recursive:true});
await copyFile(resolve(root,'LICENSE'),resolve(out,'legal/LICENSE.txt'));
const license=await readFile(resolve(root,'LICENSE'),'utf8');
if(!license.includes('Copyright (c) 2026 ArkNeT'))throw new Error('Review the public license notice before deploying.');
await writeFile(resolve(out,'deployment.json'),JSON.stringify({format:1,components:65,license:'MIT',copyright:'2026 ArkNeT',entry:'/',playground:'/playground'})+'\n');
run('bun',['scripts/site-notices.mjs']);
run('bun',['scripts/check-site.mjs']);
