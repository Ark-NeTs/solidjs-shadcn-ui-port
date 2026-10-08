// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps } from "@solidjs/web";
import { cva, type VariantProps } from "class-variance-authority";
import { callHandler } from "../../lib/controllable";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

/** Render InputGroup with reactive native attributes and caller-owned content. */
export function InputGroup(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="input-group" role="group" class={cn("group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:bg-input/50 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input/30 dark:has-disabled:bg-input/80 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5", props.class)} {...rest}/>);
}
export const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
        "inline-end":
          "order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
);
export const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
);

/** Render InputGroupText with reactive native attributes and caller-owned content. */
export function InputGroupText(props: ComponentProps<"span">) {
 const rest = omit(props, "class");
 return (<span class={cn("flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", props.class)} {...rest}/>);
}

/** Render InputGroupInput with reactive native attributes and caller-owned content. */
export function InputGroupInput(props: ComponentProps<"input">) {
 const rest = omit(props, "class");
 return (<Input data-slot="input-group-control" class={cn("flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent", props.class)} {...rest}/>);
}

/** Render InputGroupTextarea with reactive native attributes and caller-owned content. */
export function InputGroupTextarea(props: ComponentProps<"textarea">) {
 const rest = omit(props, "class");
 return (<Textarea data-slot="input-group-control" class={cn("flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent", props.class)} {...rest}/>);
}

/** Focus the adjacent editable field without stealing clicks from interactive children. */
export function InputGroupAddon(props: ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
 const rest=omit(props,'class','align','onClick');
 return <div {...rest} data-slot="input-group-addon" data-align={props.align ?? 'inline-start'} class={cn(inputGroupAddonVariants({align:props.align}),props.class)} onClick={event=>{
  callHandler(props.onClick,event);
  if(event.defaultPrevented || (event.target as Element).closest('button,a,input,textarea,select,[role=button]'))return;
  event.currentTarget.parentElement?.querySelector<HTMLInputElement|HTMLTextAreaElement>('input,textarea')?.focus();
 }}/>;
}
/** Render a compact action with native button submission disabled by default. */
export function InputGroupButton(props: Omit<Extract<ComponentProps<typeof Button>,{as?:'button'}>,'size'> & VariantProps<typeof inputGroupButtonVariants>) {
 const rest=omit(props,'class','size','variant');
 return <Button {...rest} variant={props.variant ?? 'ghost'} size={props.size ?? 'xs'} class={cn(inputGroupButtonVariants({size:props.size}),props.class)}/>;
}
