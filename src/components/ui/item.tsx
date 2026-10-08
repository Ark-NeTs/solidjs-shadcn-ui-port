// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps, Dynamic } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import type { NativePartProps } from "../../lib/native";
import { cn } from "../../lib/utils";
import { Separator } from "./separator";

/** Render ItemGroup with reactive native attributes and caller-owned content. */
export function ItemGroup(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div role="list" data-slot="item-group" class={cn("group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2", props.class)} {...rest}/>);
}

/** Render ItemSeparator with reactive native attributes and caller-owned content. */
export function ItemSeparator(props: ComponentProps<typeof Separator>) {
 const rest = omit(props, "class");
 return (<Separator data-slot="item-separator" orientation="horizontal" class={cn("my-2", props.class)} {...rest}/>);
}
export const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/** Render Item with reactive native attributes and caller-owned content. */
export function Item(props: NativePartProps & VariantProps<typeof itemVariants>) {
 const rest = omit(props, "class", "variant", "size", "as");
 return (<Dynamic component={props.as ?? "div"} {...(props.as === "button" ? {type:props.type ?? "button"} : {})} data-slot="item" data-variant={(props.variant ?? "default")} data-size={(props.size ?? "default")} class={cn(itemVariants({ variant: (props.variant ?? "default"), size: (props.size ?? "default"), class: props.class }))} {...rest}/>);
}
export const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/** Render ItemMedia with reactive native attributes and caller-owned content. */
export function ItemMedia(props: ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
 const rest = omit(props, "class", "variant");
 return (<div data-slot="item-media" data-variant={(props.variant ?? "default")} class={cn(itemMediaVariants({ variant: (props.variant ?? "default"), class: props.class }))} {...rest}/>);
}

/** Render ItemContent with reactive native attributes and caller-owned content. */
export function ItemContent(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="item-content" class={cn("flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none", props.class)} {...rest}/>);
}

/** Render ItemTitle with reactive native attributes and caller-owned content. */
export function ItemTitle(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="item-title" class={cn("line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4", props.class)} {...rest}/>);
}

/** Render ItemDescription with reactive native attributes and caller-owned content. */
export function ItemDescription(props: ComponentProps<"p">) {
 const rest = omit(props, "class");
 return (<p data-slot="item-description" class={cn("line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", props.class)} {...rest}/>);
}

/** Render ItemActions with reactive native attributes and caller-owned content. */
export function ItemActions(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="item-actions" class={cn("flex items-center gap-2", props.class)} {...rest}/>);
}

/** Render ItemHeader with reactive native attributes and caller-owned content. */
export function ItemHeader(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="item-header" class={cn("flex basis-full items-center justify-between gap-2", props.class)} {...rest}/>);
}

/** Render ItemFooter with reactive native attributes and caller-owned content. */
export function ItemFooter(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="item-footer" class={cn("flex basis-full items-center justify-between gap-2", props.class)} {...rest}/>);
}
