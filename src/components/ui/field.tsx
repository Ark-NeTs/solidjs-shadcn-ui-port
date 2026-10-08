// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { For, Show, omit } from "solid-js";
import { type JSX, type ComponentProps } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Label } from "./label";
import { Separator } from "./separator";

/** Render FieldSet with reactive native attributes and caller-owned content. */
export function FieldSet(props: ComponentProps<"fieldset">) {
 const rest = omit(props, "class");
 return (<fieldset data-slot="field-set" class={cn("flex min-w-0 flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3", props.class)} {...rest}/>);
}

/** Render FieldLegend with reactive native attributes and caller-owned content. */
export function FieldLegend(props: ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
 const rest = omit(props, "class", "variant");
 return (<legend data-slot="field-legend" data-variant={(props.variant ?? "legend")} class={cn("mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base", props.class)} {...rest}/>);
}

/** Render FieldGroup with reactive native attributes and caller-owned content. */
export function FieldGroup(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="field-group" class={cn("group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4", props.class)} {...rest}/>);
}
export const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive-emphasis",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
);

/** Render Field with reactive native attributes and caller-owned content. */
export function Field(props: ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
 const rest = omit(props, "class", "orientation");
 return (<div role="group" data-slot="field" data-orientation={(props.orientation ?? "vertical")} class={cn(fieldVariants({ orientation: (props.orientation ?? "vertical") }), props.class)} {...rest}/>);
}

/** Render FieldContent with reactive native attributes and caller-owned content. */
export function FieldContent(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="field-content" class={cn("group/field-content flex flex-1 flex-col gap-0.5 leading-snug", props.class)} {...rest}/>);
}

/** Render FieldLabel with reactive native attributes and caller-owned content. */
export function FieldLabel(props: ComponentProps<typeof Label>) {
 const rest = omit(props, "class");
 return (<Label data-slot="field-label" class={cn("group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10", "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col", props.class)} {...rest}/>);
}

/** Render FieldTitle with reactive native attributes and caller-owned content. */
export function FieldTitle(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="field-label" class={cn("flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50", props.class)} {...rest}/>);
}

/** Render FieldDescription with reactive native attributes and caller-owned content. */
export function FieldDescription(props: ComponentProps<"p">) {
 const rest = omit(props, "class");
 return (<p data-slot="field-description" class={cn("text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5", "last:mt-0 nth-last-2:-mt-1", "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", props.class)} {...rest}/>);
}

/** Render FieldSeparator with reactive native attributes and caller-owned content. */
export function FieldSeparator(props: ComponentProps<"div"> & {
  children?: JSX.Element
}) {
 const rest = omit(props, "children", "class");
 return (<div data-slot="field-separator" data-content={props.children ? "true" : "false"} class={cn("relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2", props.class)} {...rest}>
      <Separator class="absolute inset-0 top-1/2"/>
      {props.children && (<span class="relative mx-auto block w-fit bg-background px-2 text-muted-foreground" data-slot="field-separator-content">
          {props.children}
        </span>)}
    </div>);
}

/** Render caller text or unique validation messages; remove the alert when recovered. */
export function FieldError(props: ComponentProps<"div"> & { errors?: Array<{message?: string} | undefined> }) {
 const rest = omit(props, 'class', 'children', 'errors');
 const messages = () => [...new Set((props.errors ?? []).map(error => error?.message).filter((message): message is string => !!message))];
 return <Show when={props.children || messages().length}><div {...rest} role="alert" data-slot="field-error" class={cn('text-sm font-normal text-destructive-emphasis', props.class)}>{props.children || <Show when={messages().length > 1} fallback={messages()[0]}><ul class="ml-4 flex list-disc flex-col gap-1"><For each={messages()}>{message => <li>{message}</li>}</For></ul></Show>}</div></Show>;
}
