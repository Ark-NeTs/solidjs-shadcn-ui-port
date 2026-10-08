// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps, Dynamic } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import type { NativePartProps } from "../../lib/native";
import { cn } from "../../lib/utils";
import { Separator } from "./separator";
export const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
);

/** Render ButtonGroup with reactive native attributes and caller-owned content. */
export function ButtonGroup(props: ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
 const rest = omit(props, "class", "orientation");
 return (<div role="group" data-slot="button-group" data-orientation={props.orientation} class={cn(buttonGroupVariants({ orientation: props.orientation }), props.class)} {...rest}/>);
}

/** Render ButtonGroupText with reactive native attributes and caller-owned content. */
export function ButtonGroupText(props: NativePartProps) {
 const rest = omit(props, "class", "as");
 return (<Dynamic component={props.as ?? "div"} {...(props.as === "button" ? {type:props.type ?? "button"} : {})} class={cn("flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", props.class)} {...rest}/>);
}

/** Render ButtonGroupSeparator with reactive native attributes and caller-owned content. */
export function ButtonGroupSeparator(props: ComponentProps<typeof Separator>) {
 const rest = omit(props, "class", "orientation");
 return (<Separator data-slot="button-group-separator" orientation={(props.orientation ?? "vertical")} class={cn("relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto", props.class)} {...rest}/>);
}
