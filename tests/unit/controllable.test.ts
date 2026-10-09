// Controlled values gate unrelated owner updates before notifying UI consumers.
import {createEffect,createRoot,createSignal,flush} from 'solid-js';
import {expect,it,vi} from 'vitest';
import {createControllable} from '../../src/lib/controllable';

it('notifies consumers only when the effective controlled or local value changes',()=>{
 const values:boolean[]=[];const changed=vi.fn();
 const state=createRoot(dispose=>{
  const [draft,setDraft]=createSignal({open:false,name:'Initial'});
  const [controlled,setControlled]=createSignal(true);
  const [value,request]=createControllable(()=>controlled()?draft().open:undefined,()=>false,changed);
  createEffect(value,next=>{values.push(next);});
  return {dispose,setDraft,setControlled,value,request};
 });
 try{
  flush();expect(values).toEqual([false]);
  state.setDraft({open:true,name:'Initial'});flush();expect(values).toEqual([false,true]);
  for(const name of ['A','B','C','D','E','F']){state.setDraft({open:true,name});flush();}
  expect(values).toEqual([false,true]);
  state.request(false);flush();expect(changed).toHaveBeenCalledWith(false);expect(state.value()).toBe(true);expect(values).toEqual([false,true]);
  state.setControlled(false);flush();expect(values).toEqual([false,true,false]);
  state.request(true);flush();expect(values).toEqual([false,true,false,true]);
 }finally{state.dispose();}
});
