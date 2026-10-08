// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps, Dynamic } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import type { NativePartProps } from "../../lib/native";
import { cn } from "../../lib/utils";
export const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: "",
        separator:
          "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
        border: "border-b border-border pb-2",
      },
    },
  }
);

/** Render Marker with reactive native attributes and caller-owned content. */
export function Marker(props: NativePartProps & VariantProps<typeof markerVariants>) {
 const rest = omit(props, "class", "variant", "as");
 return (<Dynamic component={props.as ?? "div"} {...(props.as === "button" ? {type:props.type ?? "button"} : {})} data-slot="marker" data-variant={(props.variant ?? "default")} class={cn(markerVariants({ variant: (props.variant ?? "default"), class: props.class }))} {...rest}/>);
}

/** Render MarkerIcon with reactive native attributes and caller-owned content. */
export function MarkerIcon(props: ComponentProps<"span">) {
 const rest = omit(props, "class");
 return (<span data-slot="marker-icon" aria-hidden="true" class={cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", props.class)} {...rest}/>);
}

/** Render MarkerContent with reactive native attributes and caller-owned content. */
export function MarkerContent(props: ComponentProps<"span">) {
 const rest = omit(props, "class");
 return (<span data-slot="marker-content" class={cn("min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", props.class)} {...rest}/>);
}
