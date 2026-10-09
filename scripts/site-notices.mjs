// Preserve notices for the installed production dependency graph; D19/D90.
import {readFile,readdir,realpath,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const fallbacks={
 'solid-js@2.0.0-rc.13':{file:'solid-LICENSE',source:'https://raw.githubusercontent.com/solidjs/solid/5efaf260becb32293f2bcb4d32f8be72be6de674/LICENSE'},
 '@solidjs/web@2.0.0-rc.13':{file:'solid-LICENSE',source:'https://raw.githubusercontent.com/solidjs/solid/5efaf260becb32293f2bcb4d32f8be72be6de674/LICENSE'},
 'embla-carousel@8.6.0':{file:'embla-LICENSE',source:'https://raw.githubusercontent.com/davidjerleke/embla-carousel/v8.6.0/LICENSE'},
};
/** Follow the requesting package's actual dependency, including nested Bun installs. */
async function locate(name,from){for(let directory=from;;directory=dirname(directory)){const path=resolve(directory,'node_modules',name);if(existsSync(resolve(path,'package.json')))return realpath(path);if(directory===dirname(directory))throw new Error(`Missing installed dependency: ${name}`);}}
const entries=new Map();
async function visit(name,from){const directory=await locate(name,from);const pkg=JSON.parse(await readFile(resolve(directory,'package.json'),'utf8'));const key=`${pkg.name}@${pkg.version}`;if(entries.has(key))return;entries.set(key,'');
 const files=(await readdir(directory,{withFileTypes:true})).filter(file=>file.isFile()&&/^(licen[cs]e|copying|ofl|notice)(\.|$)/i.test(file.name)).map(file=>file.name).sort();let notice='';
 for(const file of files)notice+=`\n${file}\n${await readFile(resolve(directory,file),'utf8')}\n`;
 if(!notice){const fallback=fallbacks[key];if(!fallback)throw new Error(`Missing license notice for ${key}; review before publishing`);notice=`\nSource: ${fallback.source}\n${await readFile(resolve(root,'deployment/licenses',fallback.file),'utf8')}\n`;}
 entries.set(key,`${key}\nLicense: ${pkg.license??'See notice'}\n${notice}`);
 for(const dependency of Object.keys({...pkg.dependencies,...pkg.peerDependencies}).sort()){if(pkg.peerDependenciesMeta?.[dependency]?.optional&&!pkg.dependencies?.[dependency])continue;await visit(dependency,directory);}
}
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
for(const name of Object.keys({...pkg.dependencies,...pkg.peerDependencies}).sort())await visit(name,root);
await writeFile(resolve(root,'site-dist/legal/THIRD-PARTY-NOTICES.txt'),'Third-party notices\n\nThis site includes third-party software and fonts. This inventory conservatively\ncovers the installed production dependency graph, including tree-shaken packages.\nThe following upstream notices are preserved without modification.\n\n'+[...entries].sort(([a],[b])=>a.localeCompare(b)).map(([,notice])=>notice).join('\n'+'='.repeat(72)+'\n\n'));
console.log(`Third-party notices: ${entries.size} package versions`);
