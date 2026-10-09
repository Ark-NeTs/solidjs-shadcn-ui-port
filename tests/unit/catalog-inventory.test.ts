// Keep the dated catalog, public modules and sibling export names in sync; D19/D90.
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import ts from 'typescript';
import {expect,it} from 'vitest';
import * as library from '../../src/index';

const root=resolve(import.meta.dirname,'../..');
const componentDirectory=resolve(root,'src/components/ui');
const families=readdirSync(componentDirectory).filter(name=>name.endsWith('.tsx')).map(name=>name.slice(0,-4)).sort();

it('delivers every dated catalog family through a public subpath and the root barrel',async()=>{
  const map=readFileSync(resolve(root,'COMPONENT-MAP.md'),'utf8');
  const catalog=[...map.matchAll(/^\| \[[^\]]+\]\(https:\/\/ui\.shadcn\.com\/docs\/components\/(?:radix\/)?([^/)]+)\) \|/gm)].map(match=>match[1]!).sort();
  expect(catalog).toHaveLength(65);
  expect(new Set(catalog).size).toBe(catalog.length);
  expect(families).toEqual(catalog);
  const manifest=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
  expect(manifest.exports['./ui/*']).toBe('./src/components/ui/*.tsx');
  for(const family of catalog){
    const module=await import(`../../src/components/ui/${family}.tsx`);
    expect(Object.keys(module).length,`${family} has runtime exports`).toBeGreaterThan(0);
    for(const [name,value] of Object.entries(module)){
      expect(library,`${family}/${name} is public`).toHaveProperty(name);
      expect(library[name as keyof typeof library],`${family}/${name} retains its implementation`).toBe(value);
    }
  }
});

it('covers sibling value export names with only the documented React ref-hook exception',()=>{
  const sibling=resolve(root,'../shadcn-theme/src/components/ui');
  const files=readdirSync(sibling).filter(name=>name.endsWith('.tsx')).sort();
  expect(files.length).toBeGreaterThan(0);
  const program=ts.createProgram(files.flatMap(name=>[resolve(sibling,name),resolve(componentDirectory,name)]),{
    noEmit:true,skipLibCheck:true,types:[],jsx:ts.JsxEmit.Preserve,
    module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,
  });
  const checker=program.getTypeChecker();
  /** Follow aliases without loading the sibling React runtime. */
  function values(path:string){
    const file=program.getSourceFile(path);
    expect(file,`${path} exists`).toBeDefined();
    const module=checker.getSymbolAtLocation(file!);
    expect(module,`${path} is a module`).toBeDefined();
    return checker.getExportsOfModule(module!).filter(symbol=>{
      const target=symbol.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(symbol):symbol;
      return Boolean(target.flags&ts.SymbolFlags.Value);
    }).map(symbol=>symbol.name);
  }
  const missing=files.flatMap(file=>{
    const available=new Set(values(resolve(componentDirectory,file)));
    return values(resolve(sibling,file)).filter(name=>!available.has(name)).map(name=>`${file}:${name}`);
  }).sort();
  // This React ref-object API is explicitly excluded in the component guide.
  expect(missing).toEqual(['combobox.tsx:useComboboxAnchor']);
  expect(readFileSync(resolve(root,'docs/components.md'),'utf8')).toContain('object `useComboboxAnchor`');
});
