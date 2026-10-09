// Real export audit regressions with isolated package/application files; D19/D90.
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {afterEach,expect,it} from 'vitest';
import {auditAdminImports} from '../../scripts/admin-parity';
const directories:string[]=[];
/** Use real modules so TypeScript resolves exports instead of a mocked symbol list. */
function fixture(files:Record<string,string>,exports:Record<string,unknown>={'./ui/*':'./src/*.tsx'}){
  const root=mkdtempSync(join(tmpdir(),'solid-parity-'));directories.push(root);
  for(const [name,content] of Object.entries({'package/package.json':JSON.stringify({exports}),...files})){
    const path=join(root,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,content);
  }
  return ()=>auditAdminImports(join(root,'package'),join(root,'app'));
}
afterEach(()=>{for(const directory of directories.splice(0))rmSync(directory,{recursive:true,force:true});});

it('discovers new components and aliases without an inventory update',()=>{
  const check=fixture({'app/screen.tsx':"import { Slider as Range, type SliderProps } from 'shadcn-theme/ui/slider';",'package/src/slider.tsx':'export function Slider(){}; export type SliderProps={value:number};'});
  expect(check()).toMatchObject({complete:true,subpaths:[{requested:['Slider','SliderProps'],missing:[],files:['screen.tsx']}]});
});
it('detects a removed or misspelled export even when the public file exists',()=>{
  const check=fixture({'app/screen.tsx':"import { Slider, Missing } from 'shadcn-theme/ui/slider';",'package/src/slider.tsx':'export const Slider=1;'});
  expect(check()).toMatchObject({complete:false,subpaths:[{moduleAvailable:true,missing:['Missing']}]});
});
it('follows real default and named re-exports but rejects unresolved aliases',()=>{
  const check=fixture({'app/screen.tsx':"import Default, { PublicName, Ghost } from 'shadcn-theme/ui/barrel';",'package/src/barrel.tsx':"export { Actual as PublicName, default } from './actual'; export { Ghost } from './absent';",'package/src/actual.tsx':'export const Actual=1; export default function Component(){}'});
  expect(check()).toMatchObject({complete:false,subpaths:[{missing:['Ghost']}]});
});
it('checks the manifest boundary for side-effect and namespace imports',()=>{
  const check=fixture({'app/screen.tsx':"import 'shadcn-theme/private'; import * as Slider from 'shadcn-theme/ui/missing';",'package/private.ts':'export const Secret=1;'});
  expect(check()).toMatchObject({complete:false,subpaths:[{subpath:'private',moduleAvailable:false},{subpath:'ui/missing',moduleAvailable:false,namespace:true}]});
});
it('prefers an exact denied export over a public wildcard',()=>{
  const check=fixture({'app/screen.tsx':"import { Secret } from 'shadcn-theme/ui/private';",'package/src/private.tsx':'export const Secret=1;'}, {'./ui/*':'./src/*.tsx','./ui/private':null});
  expect(check()).toMatchObject({complete:false,subpaths:[{moduleAvailable:false,missing:['Secret']}]});
});
it('checks root Solid exports, static app re-exports and stylesheet existence',()=>{
  const check=fixture({'app/index.ts':"export { Button as PublicButton } from 'shadcn-theme'; export * from 'shadcn-theme/ui/slider'; import 'shadcn-theme/theme.css';",'package/src/index.ts':'export const Button=1;','package/src/slider.tsx':'export const Slider=1;','package/src/theme.css':':root {}'}, {'.':{solid:'./src/index.ts',types:'./dist/missing.d.ts'},'./ui/*':'./src/*.tsx','./theme.css':'./src/theme.css'});
  expect(check()).toMatchObject({complete:true,subpaths:[{subpath:'.',requested:['Button']},{subpath:'theme.css',moduleAvailable:true},{subpath:'ui/slider',namespace:true}]});
});
it('aggregates nested imports deterministically and ignores other packages',()=>{
  const check=fixture({'app/z.ts':"import { B } from 'shadcn-theme/ui/parts';",'app/nested/a.ts':"import { A, B as Renamed } from 'shadcn-theme/ui/parts'; import { Nope } from 'elsewhere';",'package/src/parts.tsx':'export const A=1,B=2;'});
  expect(check()).toMatchObject({complete:true,subpaths:[{requested:['A','B'],files:['nested/a.ts','z.ts']}]});
});
it('cannot resolve a wildcard outside the package directory',()=>{
  const check=fixture({'app/screen.ts':"import { Secret } from 'shadcn-theme/ui/../../outside';",'outside.tsx':'export const Secret=1;'});
  expect(check()).toMatchObject({complete:false,subpaths:[{moduleAvailable:false}]});
});
it('does not turn traversal within a package into an exported private module',()=>{
  const check=fixture({'app/screen.ts':"import { Secret } from 'shadcn-theme/ui/../private';",'package/private.tsx':'export const Secret=1;'});
  expect(check()).toMatchObject({complete:false,subpaths:[{moduleAvailable:false}]});
});
it('honors an explicit denied Solid condition rather than falling through to types',()=>{
  const check=fixture({'app/screen.ts':"import { Secret } from 'shadcn-theme';",'package/src/types.d.ts':'export declare const Secret:number;'}, {'.':{solid:null,types:'./src/types.d.ts'}});
  expect(check()).toMatchObject({complete:false,subpaths:[{moduleAvailable:false}]});
});
it('resolves every static admin import against the actual package public exports',()=>{
  const packageRoot=resolve(import.meta.dirname,'../..');
  const report=auditAdminImports(packageRoot,resolve(packageRoot,'../../apps/admin/src'));
  expect(report.subpaths.filter(row=>!row.moduleAvailable||row.missing.length)).toEqual([]);
  expect(report.subpaths.length).toBeGreaterThan(0);
});
