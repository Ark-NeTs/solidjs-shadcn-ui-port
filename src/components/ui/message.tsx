// Solid 2 native composition with sibling radix-nova styling; D19/D90.
import { omit } from "solid-js";
import { type ComponentProps } from "@solidjs/web";
import { cn } from "../../lib/utils";

/** Render MessageGroup with reactive native attributes and caller-owned content. */
export function MessageGroup(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="message-group" class={cn("flex min-w-0 flex-col gap-2", props.class)} {...rest}/>);
}

/** Render Message with reactive native attributes and caller-owned content. */
export function Message(props: ComponentProps<"div"> & { align?: "start" | "end" }) {
 const rest = omit(props, "class", "align");
 return (<div data-slot="message" data-align={(props.align ?? "start")} class={cn("group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse", props.class)} {...rest}/>);
}

/** Render MessageAvatar with reactive native attributes and caller-owned content. */
export function MessageAvatar(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="message-avatar" class={cn("flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8", props.class)} {...rest}/>);
}

/** Render MessageContent with reactive native attributes and caller-owned content. */
export function MessageContent(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="message-content" class={cn("flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end", props.class)} {...rest}/>);
}

/** Render MessageHeader with reactive native attributes and caller-owned content. */
export function MessageHeader(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="message-header" class={cn("flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0", props.class)} {...rest}/>);
}

/** Render MessageFooter with reactive native attributes and caller-owned content. */
export function MessageFooter(props: ComponentProps<"div">) {
 const rest = omit(props, "class");
 return (<div data-slot="message-footer" class={cn("flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end", props.class)} {...rest}/>);
}
