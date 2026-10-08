// Locale-independent direction for native components and nested compositions; D19/D90.
import { createContext, omit, useContext, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
export type Direction='ltr'|'rtl';
const DirectionContext=createContext<Accessor<Direction>>(()=> 'ltr');
/** Read explicit reactive direction before the closest provider or the LTR default. */
export function useDirection(local?:Accessor<Direction|undefined>):Accessor<Direction>{const inherited=useContext(DirectionContext);return ()=>local?.()??inherited();}
/** Supply both reactive context and a DOM inheritance boundary for native keyboard/placement behavior. */
export function DirectionProvider(props:Omit<JSX.HTMLAttributes<HTMLDivElement>,'dir'> & {dir?:Direction;direction?:Direction}){
 const inherited=useDirection();const direction=()=>props.direction??props.dir??inherited();const rest=omit(props,'dir','direction','children');
 return <DirectionContext value={direction}><div {...rest} dir={direction()} data-slot="direction-provider">{props.children}</div></DirectionContext>;
}
