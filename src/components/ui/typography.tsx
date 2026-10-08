// Semantic prose compositions using shared typography and color tokens; D19/D90.
import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { cn } from '../../lib/utils';
/** Scope readable HTML styles without parsing markdown or injecting HTML. */
export function Typography(props:ComponentProps<'div'>){const rest=omit(props,'class');return <div {...rest} data-slot="typography" class={cn('min-w-0 space-y-4 text-base leading-7 wrap-break-word [&_h1]:font-heading [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:text-2xl [&_h3]:font-semibold [&_h4]:text-xl [&_h4]:font-semibold [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-ring [&_blockquote]:border-s-2 [&_blockquote]:ps-6 [&_blockquote]:italic [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_code]:font-mono [&_code]:text-sm',props.class)}/>;}
/** Render the primary heading with caller-owned document hierarchy. */
export function TypographyH1(props:ComponentProps<'h1'>){const rest=omit(props,'class');return <h1 {...rest} class={cn('scroll-m-20 font-heading text-4xl font-extrabold tracking-tight text-balance lg:text-5xl',props.class)}/>;}
/** Render a section heading. */
export function TypographyH2(props:ComponentProps<'h2'>){const rest=omit(props,'class');return <h2 {...rest} class={cn('scroll-m-20 border-b pb-2 font-heading text-3xl font-semibold tracking-tight',props.class)}/>;}
/** Render a subsection heading. */
export function TypographyH3(props:ComponentProps<'h3'>){const rest=omit(props,'class');return <h3 {...rest} class={cn('scroll-m-20 text-2xl font-semibold tracking-tight',props.class)}/>;}
/** Render a fourth-level heading. */
export function TypographyH4(props:ComponentProps<'h4'>){const rest=omit(props,'class');return <h4 {...rest} class={cn('scroll-m-20 text-xl font-semibold tracking-tight',props.class)}/>;}
/** Render body prose with comfortable leading. */
export function TypographyP(props:ComponentProps<'p'>){const rest=omit(props,'class');return <p {...rest} class={cn('leading-7 [&:not(:first-child)]:mt-6',props.class)}/>;}
/** Preserve quotation semantics and logical indentation. */
export function TypographyBlockquote(props:ComponentProps<'blockquote'>){const rest=omit(props,'class');return <blockquote {...rest} class={cn('mt-6 border-s-2 ps-6 italic',props.class)}/>;}
/** Keep unordered prose lists semantic. */
export function TypographyList(props:ComponentProps<'ul'>){const rest=omit(props,'class');return <ul {...rest} class={cn('my-6 ms-6 list-disc [&>li]:mt-2',props.class)}/>;}
/** Style inline code without interpreting its contents. */
export function TypographyInlineCode(props:ComponentProps<'code'>){const rest=omit(props,'class');return <code {...rest} class={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',props.class)}/>;}
/** Render introductory prose. */
export function TypographyLead(props:ComponentProps<'p'>){const rest=omit(props,'class');return <p {...rest} class={cn('text-xl text-muted-foreground',props.class)}/>;}
/** Render prominent supporting text. */
export function TypographyLarge(props:ComponentProps<'div'>){const rest=omit(props,'class');return <div {...rest} class={cn('text-lg font-semibold',props.class)}/>;}
/** Render semantic small print. */
export function TypographySmall(props:ComponentProps<'small'>){const rest=omit(props,'class');return <small {...rest} class={cn('text-sm leading-none font-medium',props.class)}/>;}
/** Render supporting prose using the muted semantic color. */
export function TypographyMuted(props:ComponentProps<'p'>){const rest=omit(props,'class');return <p {...rest} class={cn('text-sm text-muted-foreground',props.class)}/>;}
