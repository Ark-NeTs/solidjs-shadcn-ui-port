// Solid 2 card composition with shared radix-nova spacing and slots; D19.
import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cn } from "../../lib/utils";

export type CardProps = JSX.HTMLAttributes<HTMLDivElement> & { size?: "default" | "sm" };

/** Render the card part while forwarding native attributes and children. */
export function Card(props: CardProps) {
  const rest = omit(props, 'class', 'size');
  return <div {...rest} data-slot="card" data-size={props.size ?? "default"} class={cn("group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl", props.class)} />;
}

/** Render the card-header part while forwarding native attributes and children. */
export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class');
  return <div {...rest} data-slot="card-header" class={cn("group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)", props.class)} />;
}

/** Render the card-title part while forwarding native attributes and children. */
export function CardTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class');
  return <div {...rest} data-slot="card-title" class={cn("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", props.class)} />;
}

/** Render the card-description part while forwarding native attributes and children. */
export function CardDescription(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class');
  return <div {...rest} data-slot="card-description" class={cn("text-sm text-muted-foreground", props.class)} />;
}

/** Render the card-action part while forwarding native attributes and children. */
export function CardAction(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class');
  return <div {...rest} data-slot="card-action" class={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", props.class)} />;
}

/** Render the card-content part while forwarding native attributes and children. */
export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class');
  return <div {...rest} data-slot="card-content" class={cn("px-(--card-spacing)", props.class)} />;
}

/** Render the card-footer part while forwarding native attributes and children. */
export function CardFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class');
  return <div {...rest} data-slot="card-footer" class={cn("flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)", props.class)} />;
}
