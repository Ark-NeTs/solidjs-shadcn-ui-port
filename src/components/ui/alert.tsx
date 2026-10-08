// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
export const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive-emphasis *:data-[slot=alert-description]:text-destructive-emphasis *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/** Render Alert with reactive native attributes and caller-owned content. */
export function Alert(props: ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
 const rest = omit(props, "class", "variant");
 return (<div data-slot="alert" role="alert" class={cn(alertVariants({ variant: props.variant }), props.class)} {...rest}/>);
}

/** Render AlertTitle with reactive native attributes and caller-owned content. */
export function AlertTitle(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="alert-title" class={cn("font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", props.class)} {...rest}/>);
}

/** Render AlertDescription with reactive native attributes and caller-owned content. */
export function AlertDescription(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="alert-description" class={cn("text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", props.class)} {...rest}/>);
}

/** Render AlertAction with reactive native attributes and caller-owned content. */
export function AlertAction(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="alert-action" class={cn("absolute top-2 end-2", props.class)} {...rest}/>);
}
