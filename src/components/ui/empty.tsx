// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/** Render Empty with reactive native attributes and caller-owned content. */
export function Empty(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="empty" class={cn("flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance", props.class)} {...rest}/>);
}

/** Render EmptyHeader with reactive native attributes and caller-owned content. */
export function EmptyHeader(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="empty-header" class={cn("flex max-w-sm flex-col items-center gap-2", props.class)} {...rest}/>);
}
export const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/** Render EmptyMedia with reactive native attributes and caller-owned content. */
export function EmptyMedia(props: ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
 const rest = omit(props, "class", "variant");
 return (<div data-slot="empty-icon" data-variant={(props.variant ?? "default")} class={cn(emptyMediaVariants({ variant: (props.variant ?? "default"), class: props.class }))} {...rest}/>);
}

/** Render EmptyTitle with reactive native attributes and caller-owned content. */
export function EmptyTitle(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="empty-title" class={cn("font-heading text-sm font-medium tracking-tight", props.class)} {...rest}/>);
}

/** Render EmptyDescription with reactive native attributes and caller-owned content. */
export function EmptyDescription(props: ComponentProps<"p">) {
 const rest = omit(props, "class");
 return (<div data-slot="empty-description" class={cn("text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", props.class)} {...rest}/>);
}

/** Render EmptyContent with reactive native attributes and caller-owned content. */
export function EmptyContent(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="empty-content" class={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance", props.class)} {...rest}/>);
}
