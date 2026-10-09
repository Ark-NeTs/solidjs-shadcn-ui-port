// Measure retained production JS for real public import paths; D19/D90.
import {build} from 'vite';
import solid from 'vite-plugin-solid';
import {gzipSync} from 'node:zlib';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const cases={button:{button:['Button']},form:{button:['Button'],input:['Input'],textarea:['Textarea'],label:['Label'],checkbox:['Checkbox'],switch:['Switch']},overlays:{dialog:['Dialog','DialogTrigger','DialogContent'],select:['Select','SelectTrigger','SelectContent','SelectItem']},table:{'data-table':['DataTable']},chart:{chart:['Chart','ChartContainer']}};
const results=[];
for(const mode of ['source','built'])for(const [name,modules] of Object.entries(cases)){
 const entry='\0consumer-size';const imports=Object.entries(modules).map(([module,names])=>`import {${names.join(',')}} from ${JSON.stringify(mode==='source'?resolve(root,`src/components/ui/${module}.tsx`):resolve(root,'dist/shadcn-solidjs-theme.js'))};`).join('\n');
 const code=`${imports}\nglobalThis.__themeConsumer={${Object.values(modules).flat().join(',')}};`;
 const result=await build({configFile:false,root,logLevel:'error',plugins:[solid(),{name:'consumer-size-entry',resolveId(id){if(id===entry)return entry;},load(id){if(id===entry)return code;}}],build:{write:false,minify:true,target:'es2022',rolldownOptions:{input:entry,output:{format:'es'}}}});
 const outputs=Array.isArray(result)?result:[result];const chunks=outputs.flatMap(output=>output.output).filter(file=>file.type==='chunk');const joined=chunks.map(chunk=>chunk.code).join('\n');
 results.push({mode,name,bytes:Buffer.byteLength(joined),gzipBytes:gzipSync(joined).byteLength,modules:[...new Set(chunks.flatMap(chunk=>Object.keys(chunk.modules)))].map(id=>id.replace(root+'/', '').replace(/.*node_modules\//,'node_modules/')).sort()});
}
const evidence={description:'Minified production JavaScript retaining listed public component functions, with Solid and dependencies bundled. No CSS, fonts or application data. Gzip compresses concatenated chunks; request-level compression may differ.',vite:'8.3.3',solid:'2.0.0-rc.13',results};
await writeFile(resolve(root,'docs/evidence/consumer-bundles.json'),JSON.stringify(evidence,null,2)+'\n');
console.table(results.map(({mode,name,bytes,gzipBytes})=>({mode,name,bytes,gzipBytes})));
