// Typecheck the new guide compositions against the actual public Solid APIs; D19/D90.
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const guide=await readFile(resolve(root,'docs/components.md'),'utf8');
const sections=['Toast and Sonner','Native catalog compositions','Avatar, Pagination, Direction and Typography','Dialog, Sheet and Drawer','Menus and Command','Calendar, Date Picker and Input OTP','Resizable, Scroll Area, Carousel and Message Scroller'];
const helpers=`declare const resetDraft:()=>void;declare const errors:()=>{message:string}[];declare const direction:()=> 'ltr'|'rtl';declare const person:()=>{image:string;name:string;initials:string};declare const draft:()=>string;declare const setDraft:(value:string)=>void;declare const saveDraft:()=>void;declare const editItem:()=>void;declare const newDraft:()=>void;declare const referenceRows:()=>{label:string}[];declare const dishes:()=>{name:string}[];declare const messages:()=>{text:string}[];`;
const files=new Map(sections.map((heading,index)=>{const section=guide.split(`## ${heading}\n`)[1]?.split('\n## ')[0];const example=section?.match(/```tsx\n([\s\S]*?)```/)?.[1];if(!example)throw new Error(`Missing ${heading} example`);return [resolve(root,`playground/docs-example-${index}.tsx`),example+'\n'+helpers];}));
const config=ts.readConfigFile(resolve(root,'tsconfig.json'),ts.sys.readFile);const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,root);const host=ts.createCompilerHost(parsed.options);const read=host.readFile;const exists=host.fileExists;
host.readFile=file=>files.get(file)??read(file);host.fileExists=file=>files.has(file)||exists(file);
const program=ts.createProgram([...files.keys()],parsed.options,host);const diagnostics=ts.getPreEmitDiagnostics(program);
if(diagnostics.length){console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:file=>file,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));process.exitCode=1;}else console.log(`Guide examples: ${files.size} compositions typechecked.`);
