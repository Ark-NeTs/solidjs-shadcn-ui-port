// Gregorian local-day arithmetic without elapsed-millisecond DST assumptions; D19/D90.
export type DateRange={from:Date;to?:Date};
export type DateSelection=Date|Date[]|DateRange|undefined;
/** Normalize a valid local date at noon; reject invalid dates explicitly. */
export function day(value:Date){if(!Number.isFinite(value.getTime()))throw new RangeError('Calendar dates must be valid.');return new Date(value.getFullYear(),value.getMonth(),value.getDate(),12);}
/** Stable local-calendar serialization, independent of UTC offsets. */
export function dateKey(value:Date){return `${value.getFullYear().toString().padStart(4,'0')}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;}
/** Add calendar days across daylight-saving transitions. */
export function addDays(value:Date,count:number){const result=day(value);result.setDate(result.getDate()+count);return result;}
/** First day of an offset month. */
export function monthStart(value:Date,offset=0){return new Date(value.getFullYear(),value.getMonth()+offset,1,12);}
/** Add months while clamping a day such as January 31 to the destination month. */
export function addMonths(value:Date,count:number){const result=monthStart(value,count);result.setDate(Math.min(value.getDate(),new Date(result.getFullYear(),result.getMonth()+1,0).getDate()));return result;}
/** Compare dates by local calendar day. */
export function sameDay(a:Date|undefined,b:Date|undefined){return Boolean(a&&b&&dateKey(a)===dateKey(b));}
/** Extract values in stable form order. */
export function selectedDates(value:DateSelection){return value instanceof Date?[value]:Array.isArray(value)?value:value?[value.from,...(value.to?[value.to]:[])]:[];}
/** Derive selection styling without mutating host arrays or Date objects. */
export function isSelected(value:DateSelection,date:Date){if(value instanceof Date)return sameDay(value,date);if(Array.isArray(value))return value.some(item=>sameDay(item,date));return Boolean(value&&day(date)>=day(value.from)&&day(date)<=day(value.to??value.from));}
/** Produce six weeks with a configurable first weekday. */
export function monthDays(month:Date,weekStartsOn:number){const start=monthStart(month);return Array.from({length:42},(_,index)=>addDays(start,index-(start.getDay()-weekStartsOn+7)%7));}
