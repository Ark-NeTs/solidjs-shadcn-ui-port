// Step-grid normalization shared by Slider display, forms and interaction; D19/D90.
export type SliderModel={min:number;max:number;step:number;gap:number;ticks:number[];last:number;values:number[]};
/** Normalize without mutating the caller's array or writing corrected state from an effect. */
export function sliderModel(raw:readonly number[],min:number,max:number,step:number,gap:number):SliderModel{
 if(!Number.isFinite(min)||!Number.isFinite(max)||max<min||!Number.isFinite(step)||step<=0||!Number.isInteger(gap)||gap<0||raw.some(value=>!Number.isFinite(value)))throw new RangeError('Slider requires finite values, ordered bounds, a positive step and a nonnegative integer gap.');
 const last=Math.floor((max-min)/step+1e-9);
 if(!Number.isSafeInteger(last))throw new RangeError('Slider step grid exceeds safe numeric precision.');
 if(gap*Math.max(0,raw.length-1)>last)throw new RangeError('Slider bounds cannot fit the requested thumb gap.');
 const ticks=[...raw].sort((a,b)=>a-b).map((value,index)=>Math.max(index*gap,Math.min(last-(raw.length-index-1)*gap,Math.round((value-min)/step))));
 for(let i=1;i<ticks.length;i++)ticks[i]=Math.max(ticks[i]!,ticks[i-1]!+gap);
 return {min,max,step,gap,ticks,last,values:ticks.map(tick=>sliderNumber(min+tick*step))};
}
/** Remove ordinary floating-point step noise from labels and submitted values. */
export function sliderNumber(value:number){return Number.isInteger(value)?value:Number(value.toPrecision(15));}
/** Value arrays are snapshots, never a writable view of the caller's data. */
export function sameSliderValues(a:readonly number[],b:readonly number[]){return a.length===b.length&&a.every((value,index)=>value===b[index]);}
