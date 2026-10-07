// Inventory the remaining admin import surface without pretending this batch completes it; D19/D90.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
const root=resolve(import.meta.dirname,'..');
const remaining=[resolve(root,'../../apps/admin/src')];
const imports=new Map<string,Set<string>>();
while(remaining.length){
  const directory=remaining.pop()!;
  for(const entry of readdirSync(directory,{withFileTypes:true})){
    const path=resolve(directory,entry.name);
    if(entry.isDirectory()){remaining.push(path);continue;}
    if(!/\.[tj]sx?$/.test(entry.name))continue;
    const ast=ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
    for(const node of ast.statements){
      if(!ts.isImportDeclaration(node)||!ts.isStringLiteral(node.moduleSpecifier))continue;
      const specifier=node.moduleSpecifier.text;if(!specifier.startsWith('shadcn-theme/'))continue;
      const subpath=specifier.slice('shadcn-theme/'.length);const names=imports.get(subpath)||new Set<string>();
      const bindings=node.importClause?.namedBindings;
      if(bindings&&ts.isNamedImports(bindings))for(const binding of bindings.elements)names.add((binding.propertyName||binding.name).text);
      if(node.importClause?.name)names.add('default');
      imports.set(subpath,names);
    }
  }
}
const delivered:Record<string,string[]>={
  'ui/button':['Button','buttonVariants'],'ui/badge':['Badge','badgeVariants'],
  'ui/card':['Card','CardHeader','CardTitle','CardDescription','CardAction','CardContent','CardFooter'],
  'ui/tabs':['Tabs','TabsList','TabsTrigger','TabsContent'],
  'ui/popover':['Popover','PopoverTrigger','PopoverContent','PopoverAnchor','PopoverHeader','PopoverTitle','PopoverDescription'],
  'ui/alert-dialog':['AlertDialog','AlertDialogTrigger','AlertDialogPortal','AlertDialogOverlay','AlertDialogContent','AlertDialogHeader','AlertDialogTitle','AlertDialogDescription','AlertDialogFooter','AlertDialogAction','AlertDialogCancel','AlertDialogMedia'],
  'ui/checkbox':['Checkbox'],'ui/switch':['Switch'],
  'ui/input':['Input'],'ui/textarea':['Textarea'],'ui/label':['Label'],
  'ui/separator':['Separator'],'ui/skeleton':['Skeleton'],'utils':['cn'],
};
const rows=[...imports].sort(([a],[b])=>a.localeCompare(b)).map(([subpath,names])=>({subpath,requested:[...names].sort(),missing:[...names].filter(name=>!delivered[subpath]?.includes(name)).sort()}));
const report={scope:'Thirteen components only; full admin parity is a later gate.',subpaths:rows,complete:rows.every(row=>row.missing.length===0)};
writeFileSync(resolve(root,'docs/evidence/admin-parity.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--strict')&&!report.complete)process.exitCode=1;
