// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps } from "@solidjs/web";
import { cn } from "../../lib/utils";

/** Render Breadcrumb with reactive native attributes and caller-owned content. */
export function Breadcrumb(props: ComponentProps<"nav">) {
 const rest = omit(props, "class");
 return (<nav aria-label="breadcrumb" data-slot="breadcrumb" class={cn(props.class)} {...rest}/>);
}

/** Render BreadcrumbList with reactive native attributes and caller-owned content. */
export function BreadcrumbList(props: ComponentProps<"ol">) {
 const rest = omit(props, "class");
 return (<ol data-slot="breadcrumb-list" class={cn("flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground", props.class)} {...rest}/>);
}

/** Render BreadcrumbItem with reactive native attributes and caller-owned content. */
export function BreadcrumbItem(props: ComponentProps<"li">) {
 const rest = omit(props, "class");
 return (<li data-slot="breadcrumb-item" class={cn("inline-flex items-center gap-1", props.class)} {...rest}/>);
}

/** Render BreadcrumbLink with reactive native attributes and caller-owned content. */
export function BreadcrumbLink(props: ComponentProps<"a">) {
 const rest = omit(props, "class");
 return (<a data-slot="breadcrumb-link" class={cn("transition-colors hover:text-foreground", props.class)} {...rest}/>);
}

/** Render BreadcrumbPage with reactive native attributes and caller-owned content. */
export function BreadcrumbPage(props: ComponentProps<"span">) {
 const rest = omit(props, "class");
 return (<span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" class={cn("font-normal text-foreground", props.class)} {...rest}/>);
}

/** Render BreadcrumbSeparator with reactive native attributes and caller-owned content. */
export function BreadcrumbSeparator(props: ComponentProps<"li">) {
 const rest = omit(props, "children", "class");
 return (<li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class={cn("[&>svg]:size-3.5", props.class)} {...rest}>
      {props.children ?? (<Chevron />)}
    </li>);
}

/** Render BreadcrumbEllipsis with reactive native attributes and caller-owned content. */
export function BreadcrumbEllipsis(props: ComponentProps<"span">) {
 const rest = omit(props, "class");
 return (<span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" class={cn("flex size-5 items-center justify-center [&>svg]:size-4", props.class)} {...rest}>
      <Ellipsis />
      <span class="sr-only">More</span>
    </span>);
}

/** Decorative breadcrumb chevron follows text direction. */
function Chevron(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="rtl:rotate-180" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>;}
/** Decorative collapsed hierarchy marker. */
function Ellipsis(){return <span aria-hidden="true">…</span>;}
