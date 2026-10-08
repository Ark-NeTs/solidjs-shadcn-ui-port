// Owned single/range Slider with stable thumb identity, pointer capture and native form values; D19/D90.
import { createEffect, createMemo, For, omit, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControllable, callHandler } from '../../lib/controllable';
import { createRegistration } from '../../lib/registration';
import { sameSliderValues, sliderModel, sliderNumber } from '../../lib/slider';
import { cn } from '../../lib/utils';
export type SliderProps=Omit<JSX.HTMLAttributes<HTMLDivElement>,'onChange'|'children'> & {
 value?:number[];defaultValue?:number[];onValueChange?:(value:number[])=>void;onValueCommit?:(value:number[])=>void;
 min?:number;max?:number;step?:number;minStepsBetweenThumbs?:number;orientation?:'horizontal'|'vertical';inverted?:boolean;
 disabled?:boolean;readOnly?:boolean;name?:string;form?:string;thumbLabels?:readonly string[];getValueText?:(value:number,index:number)=>string;
};
const stepKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'];
/** Keep normalized state derived and commit only accepted values after each completed gesture. */
export function Slider(props:SliderProps){
 const initial=untrack(()=>[...(props.defaultValue??[props.min??0,props.max??100])]);
 const [raw,request]=createControllable(()=>props.value,()=>initial,next=>props.onValueChange?.([...next]));
 const model=createMemo(()=>sliderModel(raw(),props.min??0,props.max??100,props.step??1,props.minStepsBetweenThumbs??0));
 const count=createMemo(()=>model().values.length);
 // Thumb identities depend on count; changing a value must not rebuild the collection.
 const indices=createMemo(()=>Array.from({length:count()},(_,index)=>index));
 const [element,setElement]=createRegistration<HTMLDivElement|undefined>(undefined);
 const vertical=()=>props.orientation==='vertical';const blocked=()=>Boolean(props.disabled||props.readOnly);let alive=true;
 let drag:{id:number;index:number;start:number[]}|undefined;let keyboard:number[]|undefined;
 const bounds=(index:number)=>{const m=model();return [index===0?0:m.ticks[index-1]!+m.gap,index===m.ticks.length-1?m.last:m.ticks[index+1]!-m.gap] as const;};
 const percent=(index:number)=>{const m=model();const value=m.max===m.min?0:(m.values[index]!-m.min)/(m.max-m.min);return (props.inverted?1-value:value)*100;};
 const range=createMemo(()=>{const values=model().values;if(!values.length)return {start:0,size:0};const a=values.length===1?(props.inverted?100:0):percent(0);const b=percent(values.length-1);return {start:Math.min(a,b),size:Math.abs(b-a)};});
 /** Avoid repeated callbacks at a bound; changing one thumb cannot cross its neighbours. */
 function change(index:number,tick:number){const m=model();const [low,high]=bounds(index);const next=[...m.values];next[index]=sliderNumber(m.min+Math.max(low,Math.min(high,Math.round(tick)))*m.step);if(!sameSliderValues(next,m.values))request(next);}
 /** Solid batches owner acceptance; report canonical state only after that batch settles. */
 function commit(start:number[]){queueMicrotask(()=>{if(alive&&!sameSliderValues(start,model().values))props.onValueCommit?.([...model().values]);});}
 /** End capture before releasing it so lostpointercapture cannot complete the gesture twice. */
 function cancelDrag(){const previous=drag;drag=undefined;const node=untrack(element);if(previous&&node?.hasPointerCapture(previous.id))node.releasePointerCapture(previous.id);}
 onCleanup(()=>{alive=false;cancelDrag();keyboard=undefined;});
 createEffect(()=>[props.disabled,props.readOnly,props.orientation,props.inverted,props.min,props.max,props.step,props.minStepsBetweenThumbs,count()] as const,()=>{cancelDrag();keyboard=undefined;});
 createEffect(()=>[element(),props.form] as const,([node,owner])=>{
  if(!node||owner==='')return;const form=owner===undefined?node.closest('form'):node.ownerDocument.getElementById(owner);if(!(form instanceof HTMLFormElement))return;
  const pending=new Set<ReturnType<typeof setTimeout>>();
  /** Honor cancellation from every bubbling listener and cancel pending work on reassociation. */
  function reset(event:Event){const timer=setTimeout(()=>{pending.delete(timer);if(!event.defaultPrevented){cancelDrag();keyboard=undefined;const next=sliderModel(initial,props.min??0,props.max??100,props.step??1,props.minStepsBetweenThumbs??0).values;if(!sameSliderValues(next,model().values))request(next);}},0);pending.add(timer);}
  form.addEventListener('reset',reset);return()=>{form.removeEventListener('reset',reset);for(const timer of pending)clearTimeout(timer);};
 });
 /** Resolve direction at interaction time so inherited RTL changes need no global observer. */
 function reversed(){return (getComputedStyle(element()!).direction==='rtl')!==Boolean(props.inverted);}
 function pointerTick(event:PointerEvent){const rect=element()!.getBoundingClientRect();const length=vertical()?rect.height:rect.width;if(!length)return undefined;let ratio=vertical()?1-(event.clientY-rect.top)/length:(event.clientX-rect.left)/length;if(vertical()?props.inverted:reversed())ratio=1-ratio;return ratio*(model().max-model().min)/model().step;}
 /** Track clicks select the nearest thumb; direct thumb drags keep their index and focus. */
 function pointerdown(event:PointerEvent & {currentTarget:HTMLDivElement;target:Element}){
  callHandler(props.onPointerDown,event);if(event.defaultPrevented||blocked()||event.button!==0||event.isPrimary===false||drag||!model().values.length)return;
  const tick=pointerTick(event);if(tick===undefined)return;const node=event.currentTarget;const thumb=event.target.closest<HTMLButtonElement>('[data-slot="slider-thumb"]');
  const focused=node.ownerDocument.activeElement;let index=thumb?Number(thumb.dataset.index):Math.max(0,Array.from(node.querySelectorAll('[data-slot="slider-thumb"]')).indexOf(focused!));
  if(!thumb)model().ticks.forEach((value,i)=>{if(Math.abs(value-tick)<Math.abs(model().ticks[index]!-tick))index=i;});
  event.preventDefault();keyboard=undefined;drag={id:event.pointerId,index,start:[...model().values]};node.querySelectorAll<HTMLButtonElement>('[data-slot="slider-thumb"]')[index]!.focus();node.setPointerCapture(event.pointerId);if(!thumb)change(index,tick);
 }
 function pointermove(event:PointerEvent & {currentTarget:HTMLDivElement;target:Element}){callHandler(props.onPointerMove,event);if(event.defaultPrevented||!drag||event.pointerId!==drag.id||blocked())return;const tick=pointerTick(event);if(tick!==undefined)change(drag.index,tick);}
 function pointerup(event:PointerEvent & {currentTarget:HTMLDivElement;target:Element}){callHandler(props.onPointerUp,event);if(!drag||event.pointerId!==drag.id)return;const start=drag.start;cancelDrag();if(!event.defaultPrevented)commit(start);}
 /** Native button focus supplies Tab order; only slider keys change its numeric value. */
 function keydown(event:KeyboardEvent & {currentTarget:HTMLDivElement;target:Element}){
  callHandler(props.onKeyDown,event);if(event.defaultPrevented||blocked()||!stepKeys.includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;
  const thumb=event.target.closest<HTMLButtonElement>('[data-slot="slider-thumb"]');if(!thumb)return;event.preventDefault();const index=Number(thumb.dataset.index);keyboard??=[...model().values];const [low,high]=bounds(index);let tick=model().ticks[index]!;const amount=event.shiftKey||event.key.startsWith('Page')?10:1;
  if(event.key==='Home')tick=low;else if(event.key==='End')tick=high;else {let direction=event.key==='ArrowLeft'||event.key==='ArrowDown'||event.key==='PageDown'?-1:1;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){if(reversed())direction*=-1;}else if(!event.key.startsWith('Page')&&props.inverted)direction*=-1;tick+=direction*amount;}
  change(index,tick);
 }
 function finishKeyboard(canceled=false){const start=keyboard;keyboard=undefined;if(start&&!canceled)commit(start);}
 const rest=omit(props,'value','defaultValue','onValueChange','onValueCommit','min','max','step','minStepsBetweenThumbs','orientation','inverted','disabled','readOnly','name','form','thumbLabels','getValueText','class','ref','onKeyDown','onKeyUp','onFocusOut','onPointerDown','onPointerMove','onPointerUp','onPointerCancel','onLostPointerCapture');
 return <div {...rest} ref={node=>{setElement(node);if(typeof props.ref==='function')props.ref(node);}} role="group" data-slot="slider" data-orientation={vertical()?'vertical':'horizontal'} data-vertical={vertical()?'':undefined} data-disabled={props.disabled?'':undefined} aria-disabled={props.disabled?'true':undefined} class={cn('relative flex h-5 w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-40 data-vertical:w-5 data-vertical:flex-col',props.class)}
 onPointerDown={pointerdown} onPointerMove={pointermove} onPointerUp={pointerup} onPointerCancel={event=>{callHandler(props.onPointerCancel,event);cancelDrag();}} onLostPointerCapture={event=>{callHandler(props.onLostPointerCapture,event);cancelDrag();}} onKeyDown={keydown} onKeyUp={event=>{callHandler(props.onKeyUp,event);if(stepKeys.includes(event.key))finishKeyboard(event.defaultPrevented);}} onFocusOut={event=>untrack(()=>{callHandler(props.onFocusOut,event);finishKeyboard(event.defaultPrevented);})}>
  <div data-slot="slider-track" aria-hidden="true" class={vertical()?'relative h-full w-1 rounded-full bg-muted':'relative h-1 w-full rounded-full bg-muted'}><div data-slot="slider-range" class="absolute rounded-full bg-primary" style={vertical()?{bottom:`${range().start}%`,height:`${range().size}%`,width:'100%'}:{'inset-inline-start':`${range().start}%`,width:`${range().size}%`,height:'100%'}}/></div>
  <For each={indices()}>{index=><span class="contents"><button type="button" role="slider" data-slot="slider-thumb" data-index={index} disabled={props.disabled} aria-readonly={props.readOnly?'true':undefined} aria-label={props.thumbLabels?.[index]??props['aria-label']} aria-labelledby={props.thumbLabels?.[index]?undefined:props['aria-labelledby']} aria-describedby={props['aria-describedby']} aria-invalid={props['aria-invalid']} aria-orientation={vertical()?'vertical':'horizontal'} aria-valuenow={model().values[index]} aria-valuemin={sliderNumber(model().min+bounds(index)[0]*model().step)} aria-valuemax={sliderNumber(model().min+bounds(index)[1]*model().step)} aria-valuetext={props.getValueText?.(model().values[index]!,index)} class={cn('absolute block size-3 shrink-0 rounded-full border border-ring bg-background p-0 ring-ring/50 transition-[color,box-shadow] outline-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 active:ring-3 disabled:pointer-events-none',vertical()?'-translate-x-1/2 translate-y-1/2':'-translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2')} style={vertical()?{left:'50%',bottom:`${percent(index)}%`}:{top:'50%','inset-inline-start':`${percent(index)}%`}}/><input type="hidden" name={props.name} form={props.form} {...{value:String(model().values[index])}} disabled={props.disabled} data-slot="slider-input"/></span>}</For>
 </div>;
}
