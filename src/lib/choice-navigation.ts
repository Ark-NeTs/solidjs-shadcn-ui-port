// Shared roving focus for native selection controls, without mirroring selection; D19/D90.
import { createSignal, onCleanup, type Accessor } from 'solid-js';
import { createRegistration } from './registration';
type Entry={value:Accessor<string>;disabled:Accessor<boolean>;selected:Accessor<boolean>;node:Accessor<HTMLElement|undefined>};
/** Register reactive item metadata; navigation always follows the current DOM order. */
export function createChoiceNavigation(options:{orientation:()=> 'horizontal'|'vertical'|undefined;loop:()=>boolean;roving:()=>boolean;activate?:(node:HTMLElement)=>void}){
 const [entries,,update]=createRegistration<Entry[]>([]);
 const [focused,setFocused]=createSignal<string>();
 /** Remove metadata with the item scope so hidden/removed choices cannot retain a tab stop. */
 function register(entry:Entry){update(items=>[...items,entry]);onCleanup(()=>update(items=>items.filter(item=>item!==entry)));}
 /** Keep focus independent from selection when an owner rejects a requested value. */
 function tabIndex(value:string){
  const enabled=entries().filter(item=>!item.disabled());
  if(!enabled.some(item=>item.value()===value))return -1;
  if(!options.roving())return 0;
  const target=enabled.find(item=>item.value()===focused())??enabled.find(item=>item.selected())??enabled[0];
  return target?.value()===value?0:-1;
 }
 /** Ignore nested groups and unrelated keys; callers may cancel before invoking this handler. */
 function keydown(event:KeyboardEvent & {currentTarget:HTMLDivElement;target:Element}){
  if(!options.roving()||event.defaultPrevented)return;
  const root=event.currentTarget;const target=event.target.closest<HTMLElement>('[data-choice-item]');
  if(!target||target.closest('[data-choice-root]')!==root)return;
  const orientation=options.orientation();const rtl=getComputedStyle(root).direction==='rtl';
  const forward=['End',...(orientation!=='vertical'?[rtl?'ArrowLeft':'ArrowRight']:[]),...(orientation!=='horizontal'?['ArrowDown']:[])];
  const backward=['Home',...(orientation!=='vertical'?[rtl?'ArrowRight':'ArrowLeft']:[]),...(orientation!=='horizontal'?['ArrowUp']:[])];
  if(!forward.includes(event.key)&&!backward.includes(event.key))return;
  const nodes=Array.from(root.querySelectorAll<HTMLElement>('[data-choice-item]')).filter(node=>!node.matches(':disabled')&&node.closest('[data-choice-root]')===root);
  if(!nodes.length)return;
  let index=event.key==='Home'?0:event.key==='End'?nodes.length-1:nodes.indexOf(target)+(forward.includes(event.key)?1:-1);
  index=options.loop()?(index+nodes.length)%nodes.length:Math.max(0,Math.min(index,nodes.length-1));
  event.preventDefault();const next=nodes[index]!;next.focus();options.activate?.(next);
 }
 return {entries,register,tabIndex,setFocused,keydown};
}
