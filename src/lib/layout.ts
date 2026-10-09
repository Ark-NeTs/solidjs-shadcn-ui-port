// Percentage layout constraints and browser scrollbar geometry; D19/D90.
export interface PanelLimits { minSize?:number;maxSize?:number;collapsible?:boolean;collapsedSize?:number }
/** Keep adjacent panels within their constraints without changing other panels. */
export function resizePair(sizes:readonly number[],index:number,next:number,limits:readonly PanelLimits[]){const a=limits[index]!;const b=limits[index+1]!;const total=sizes[index]!+sizes[index+1]!;const lower=Math.max(a.minSize??0,total-(b.maxSize??100));const upper=Math.min(a.maxSize??100,total-(b.minSize??0));const value=Math.max(lower,Math.min(upper,next));const result=[...sizes];result[index]=value;result[index+1]=total-value;return result;}
/** Express authored relative weights as percentages for constraints and ARIA. */
export function percentages(weights:readonly number[]){const total=weights.reduce((sum,value)=>sum+value,0);return weights.map(value=>total>0?value*100/total:100/weights.length);}
/** Map native scrolling to a visible thumb with a practical minimum grab target. */
export function scrollbarGeometry(view:number,content:number,track:number,offset:number){const maximum=Math.max(0,content-view);const thumb=Math.min(track,Math.max(20,content>0?track*view/content:track));const travel=track-thumb;return {maximum,thumb,travel,position:maximum>0?Math.max(0,Math.min(maximum,offset))/maximum*travel:0};}
