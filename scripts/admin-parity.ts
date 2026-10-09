// Resolve the public source export surface without a hand-maintained component list; D19/D90.
import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {isAbsolute,relative,resolve} from 'node:path';
import ts from 'typescript';

type ImportRequest={names:Set<string>;files:Set<string>;namespace:boolean};
type ExportMap=Record<string,unknown>;

/** Inventory static imports and re-exports while retaining their authored package names. */
function collectImports(appRoot:string){
  const remaining=[appRoot];
  const imports=new Map<string,ImportRequest>();
  while(remaining.length){
    const directory=remaining.pop()!;
    for(const entry of readdirSync(directory,{withFileTypes:true})){
      const path=resolve(directory,entry.name);
      if(entry.isDirectory()){remaining.push(path);continue;}
      if(!/\.[cm]?[tj]sx?$/.test(entry.name))continue;
      const ast=ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
      for(const node of ast.statements){
        if(!ts.isImportDeclaration(node)&&!ts.isExportDeclaration(node))continue;
        if(!node.moduleSpecifier||!ts.isStringLiteral(node.moduleSpecifier))continue;
        const specifier=node.moduleSpecifier.text;
        if(specifier!=='shadcn-theme'&&!specifier.startsWith('shadcn-theme/'))continue;
        const subpath=specifier==='shadcn-theme'?'.':specifier.slice('shadcn-theme/'.length);
        const request=imports.get(subpath)??{names:new Set<string>(),files:new Set<string>(),namespace:false};
        request.files.add(relative(appRoot,path).replaceAll('\\','/'));
        if(ts.isImportDeclaration(node)){
          const bindings=node.importClause?.namedBindings;
          if(bindings&&ts.isNamedImports(bindings))for(const binding of bindings.elements)request.names.add((binding.propertyName??binding.name).text);
          if(bindings&&ts.isNamespaceImport(bindings))request.namespace=true;
          if(node.importClause?.name)request.names.add('default');
        }else if(node.exportClause&&ts.isNamedExports(node.exportClause)){
          for(const binding of node.exportClause.elements)request.names.add((binding.propertyName??binding.name).text);
        }else request.namespace=true;
        imports.set(subpath,request);
      }
    }
  }
  return imports;
}

/** Prefer the Solid source condition; public entry points still come from the manifest. */
function sourceTarget(value:unknown):string|undefined{
  let target=value;
  while(target&&typeof target==='object'&&!Array.isArray(target)){
    const conditions=target as ExportMap;
    const condition=['solid','types','import','default'].find(name=>Object.hasOwn(conditions,name));
    target=condition?conditions[condition]:undefined;
  }
  return typeof target==='string'&&target.startsWith('./')?target:undefined;
}

/** Resolve exact or wildcard public entries, rejecting absent and private source files. */
function exportedPath(packageRoot:string,exports:ExportMap,subpath:string){
  if(subpath!=='.'&&subpath.split(/[\\/]/).some(part=>part==='.'||part==='..'||part==='node_modules'))return undefined;
  const key=subpath==='.'?'.':`./${subpath}`;
  let target:string|undefined;
  if(Object.hasOwn(exports,key))target=sourceTarget(exports[key]);
  else{
    const patterns=Object.keys(exports).filter(name=>name.includes('*')).sort((a,b)=>b.indexOf('*')-a.indexOf('*')||b.length-a.length);
    for(const pattern of patterns){
      const [prefix,suffix]=pattern.split('*') as [string,string];
      if(!key.startsWith(prefix)||!key.endsWith(suffix)||key.length<prefix.length+suffix.length)continue;
      const match=key.slice(prefix.length,suffix?key.length-suffix.length:undefined);
      target=sourceTarget(exports[pattern])?.replaceAll('*',match);
      break;
    }
  }
  if(!target)return undefined;
  const path=resolve(packageRoot,target);
  const within=relative(packageRoot,path);
  if(within==='..'||within.startsWith('../')||within.startsWith('..\\')||isAbsolute(within))return undefined;
  return existsSync(path)&&statSync(path).isFile()?path:undefined;
}

/** Inspect real exported symbols, including aliases and re-exports, without executing components. */
export function auditAdminImports(packageRoot:string,appRoot:string){
  const manifest=JSON.parse(readFileSync(resolve(packageRoot,'package.json'),'utf8')) as {exports?:ExportMap};
  const imports=collectImports(appRoot);
  const paths=new Map([...imports.keys()].map(subpath=>[subpath,exportedPath(packageRoot,manifest.exports??{},subpath)]));
  const roots=[...new Set([...paths.values()].filter((path):path is string=>!!path&&/\.[cm]?[tj]sx?$/.test(path)))];
  const program=ts.createProgram(roots,{noEmit:true,skipLibCheck:true,types:[],jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,allowJs:true});
  const checker=program.getTypeChecker();
  const rows=[...imports].sort(([a],[b])=>a.localeCompare(b)).map(([subpath,request])=>{
    const path=paths.get(subpath);
    const file=path?program.getSourceFile(path):undefined;
    const module=file?checker.getSymbolAtLocation(file):undefined;
    const available=new Set(module?checker.getExportsOfModule(module).filter(symbol=>{
      const target=symbol.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(symbol):symbol;
      return !!target.declarations?.length;
    }).map(symbol=>symbol.name):[]);
    return {subpath,moduleAvailable:!!path,requested:[...request.names].sort(),namespace:request.namespace,
      files:[...request.files].sort(),missing:[...request.names].filter(name=>!available.has(name)).sort()};
  });
  return {
    scope:'Actual public package exports against static admin imports and re-exports. Checks module/name availability, not prop types, behavior, namespace member usage, dynamic imports or React-to-Solid application compatibility.',
    subpaths:rows,complete:rows.every(row=>row.moduleAvailable&&row.missing.length===0),
  };
}
