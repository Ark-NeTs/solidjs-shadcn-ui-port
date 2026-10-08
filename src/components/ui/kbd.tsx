// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps } from "@solidjs/web";
import { cn } from "../../lib/utils";

/** Render Kbd with reactive native attributes and caller-owned content. */
export function Kbd(props: ComponentProps<"kbd">) {
 const rest = omit(props, "class");
 return (<kbd data-slot="kbd" class={cn("pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3", props.class)} {...rest}/>);
}

/** Render KbdGroup with reactive native attributes and caller-owned content. */
export function KbdGroup(props: ComponentProps<"kbd">) {
 const rest = omit(props, "class");
 return (<kbd data-slot="kbd-group" class={cn("inline-flex items-center gap-1", props.class)} {...rest}/>);
}
