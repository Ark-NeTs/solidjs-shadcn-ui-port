// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps } from "@solidjs/web";
import { cn } from "../../lib/utils";

/** Render Table with reactive native attributes and caller-owned content. */
export function Table(props: ComponentProps<"table">) {
 const rest = omit(props, "class");
 return (<div data-slot="table-container" class="relative w-full overflow-x-auto">
      <table data-slot="table" class={cn("w-full caption-bottom text-sm", props.class)} {...rest}/>
    </div>);
}

/** Render TableHeader with reactive native attributes and caller-owned content. */
export function TableHeader(props: ComponentProps<"thead">) {
 const rest = omit(props, "class");
 return (<thead data-slot="table-header" class={cn("[&_tr]:border-b", props.class)} {...rest}/>);
}

/** Render TableBody with reactive native attributes and caller-owned content. */
export function TableBody(props: ComponentProps<"tbody">) {
 const rest = omit(props, "class");
 return (<tbody data-slot="table-body" class={cn("[&_tr:last-child]:border-0", props.class)} {...rest}/>);
}

/** Render TableFooter with reactive native attributes and caller-owned content. */
export function TableFooter(props: ComponentProps<"tfoot">) {
 const rest = omit(props, "class");
 return (<tfoot data-slot="table-footer" class={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", props.class)} {...rest}/>);
}

/** Render TableRow with reactive native attributes and caller-owned content. */
export function TableRow(props: ComponentProps<"tr">) {
 const rest = omit(props, "class");
 return (<tr data-slot="table-row" class={cn("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", props.class)} {...rest}/>);
}

/** Render TableHead with reactive native attributes and caller-owned content. */
export function TableHead(props: ComponentProps<"th">) {
 const rest = omit(props, "class");
 return (<th data-slot="table-head" class={cn("h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0", props.class)} {...rest}/>);
}

/** Render TableCell with reactive native attributes and caller-owned content. */
export function TableCell(props: ComponentProps<"td">) {
 const rest = omit(props, "class");
 return (<td data-slot="table-cell" class={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", props.class)} {...rest}/>);
}

/** Render TableCaption with reactive native attributes and caller-owned content. */
export function TableCaption(props: ComponentProps<"caption">) {
 const rest = omit(props, "class");
 return (<caption data-slot="table-caption" class={cn("mt-4 text-sm text-muted-foreground", props.class)} {...rest}/>);
}
