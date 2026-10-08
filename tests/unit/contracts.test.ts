// Guard D19 exports, React variant parity and byte-identical theme token blocks.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { cva } from 'class-variance-authority';
import { buttonVariants } from '../../src/components/ui/button';
import { badgeVariants } from '../../src/components/ui/badge';
import { cn } from '../../src/lib/utils';
import * as library from '../../src/index';
const root=resolve(import.meta.dirname,'../..');
/** Extract only canonical token blocks; formatting drift must fail as well as value drift. */
function tokens(css:string,selector:string){const start=css.indexOf(`${selector} {`);if(start<0)throw new Error(`Missing ${selector}`);return css.slice(start,css.indexOf('}',start)+1);}
/** Execute only the local reference package's cva declaration, without importing React. */
function referenceVariants(name:string){const source=readFileSync(resolve(root,`../shadcn-theme/src/components/ui/${name}.tsx`),'utf8');const start=source.indexOf(`const ${name}Variants = `)+`const ${name}Variants = `.length;return new Function('cva',`return ${source.slice(start,source.indexOf('\nfunction ',start))}`)(cva);}
describe('foundation contracts',()=>{
  it('matches both shared theme blocks byte for byte',()=>{const solid=readFileSync(resolve(root,'src/theme.css'),'utf8');const react=readFileSync(resolve(root,'../shadcn-theme/src/theme.css'),'utf8');for(const selector of [':root','.dark'])expect(tokens(solid,selector)).toBe(tokens(react,selector));});
  it('retains React button classes except the documented contrast correction',()=>{const reference=referenceVariants('button');for(const variant of ['default','outline','secondary','ghost','link','destructive'] as const)for(const size of ['default','xs','sm','lg','icon','icon-xs','icon-sm','icon-lg'] as const)expect(buttonVariants({variant,size})).toBe(reference({variant,size}).replace(" text-destructive ", " text-destructive-emphasis "));});
  it('retains React badge classes except the documented contrast correction',()=>{const reference=referenceVariants('badge');for(const variant of ['default','outline','secondary','ghost','link','destructive'] as const)expect(badgeVariants({variant})).toBe(reference({variant}).replace(" text-destructive ", " text-destructive-emphasis "));});
  it.each(['input','textarea','label','checkbox','switch'])('preserves the reference %s class contract',name=>{
    const reference=readFileSync(resolve(root,`../shadcn-theme/src/components/ui/${name}.tsx`),'utf8');
    const source=readFileSync(resolve(root,`src/components/ui/${name}.tsx`),'utf8');
    expect(source.match(/cn\(\s*'([^']+)'/)?.[1]).toBe(reference.match(/cn\(\s*"([^"]+)"/)?.[1]);
  });
  it('combines conditionals and Tailwind 4 overrides',()=>{expect(cn('p-2',false,null,undefined,['font-medium'],{'text-sm':true},'p-4')).toBe('font-medium text-sm p-4');expect(cn('rounded-xl','rounded-none')).toBe('rounded-none');expect(cn()).toBe('');});
  it('exports every delivered component through the barrel and source subpaths',async()=>{for(const name of ['Button','buttonVariants','Badge','badgeVariants','Card','CardHeader','CardTitle','CardDescription','CardAction','CardContent','CardFooter','Separator','Skeleton','Input','Textarea','Label','Checkbox','Switch','Tabs','TabsList','TabsTrigger','TabsContent','tabsListVariants','Popover','PopoverTrigger','PopoverAnchor','PopoverContent','PopoverClose','PopoverHeader','PopoverTitle','PopoverDescription','AlertDialog','AlertDialogTrigger','AlertDialogPortal','AlertDialogOverlay','AlertDialogContent','AlertDialogHeader','AlertDialogFooter','AlertDialogMedia','AlertDialogTitle','AlertDialogDescription','AlertDialogAction','AlertDialogCancel','RadioGroup','RadioGroupItem','Toggle','toggleVariants','ToggleGroup','ToggleGroupItem','Slider','Progress','Select','SelectTrigger','SelectValue','SelectContent','SelectItem','SelectGroup','SelectLabel','SelectSeparator','SelectScrollUpButton','SelectScrollDownButton','Tooltip','TooltipProvider','TooltipTrigger','TooltipContent','HoverCard','HoverCardTrigger','HoverCardContent','Accordion','AccordionItem','AccordionTrigger','AccordionContent','Collapsible','CollapsibleTrigger','CollapsibleContent','Combobox','ComboboxInput','ComboboxContent','ComboboxList','ComboboxItem','ComboboxGroup','ComboboxLabel','ComboboxCollection','ComboboxEmpty','ComboboxSeparator','ComboboxChips','ComboboxChip','ComboboxChipsInput','ComboboxTrigger','ComboboxValue','ComboboxClear','cn'])expect(library).toHaveProperty(name);for(const name of ['button','badge','card','separator','skeleton','input','textarea','label','checkbox','switch','tabs','popover','alert-dialog','combobox','accordion','collapsible','tooltip','hover-card','radio-group','toggle','toggle-group','select','slider','progress']){expect(existsSync(resolve(root,`src/components/ui/${name}.tsx`))).toBe(true);expect(await import(`../../src/components/ui/${name}.tsx`)).toBeTruthy();}const manifest=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));expect(manifest.exports['./ui/*']).toBe('./src/components/ui/*.tsx');expect(manifest.dependencies['@kobalte/core']).toBe('2.0.0-alpha.2');});
});


it('exports the native catalog family APIs through source subpaths and the build barrel',async()=>{
 const families=['alert','aspect-ratio','attachment','breadcrumb','bubble','button-group','empty','field','input-group','item','kbd','marker','message','native-select','spinner','table','avatar','pagination','direction','dialog','sheet','drawer'];
 for(const family of families){const module=await import(`../../src/components/ui/${family}.tsx`);const reference=readFileSync(resolve(root,`../shadcn-theme/src/components/ui/${family}.tsx`),'utf8');const exports=reference.slice(reference.lastIndexOf('export {')+8).split('}')[0]!.split(',').map(name=>name.trim()).filter(Boolean);for(const name of exports){expect(module).toHaveProperty(name);expect(library).toHaveProperty(name);}}
});

it('exports semantic typography through the public barrel',()=>{for(const name of ['Typography','TypographyH1','TypographyH2','TypographyH3','TypographyH4','TypographyP','TypographyBlockquote','TypographyList','TypographyInlineCode','TypographyLead','TypographyLarge','TypographySmall','TypographyMuted'])expect(library).toHaveProperty(name);});
