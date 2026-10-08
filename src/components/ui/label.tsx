// Owned native label with shared shadcn styling and reactive DOM props; D19/D90.
import { createEffect, createSignal, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cn } from '../../lib/utils';

export type LabelProps = { "data-slot"?: string } & JSX.LabelHTMLAttributes<HTMLLabelElement>;

/** Preserve native label semantics, refs and events without a required field provider. */
export function Label(props: LabelProps) {
  const rest = omit(props, 'class', 'ref');
  const [element, setElement] = createSignal<HTMLLabelElement | undefined>(undefined, { ownedWrite: true });
  let previous: (HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null }) | null = null;
  // Hydration can commit effects before refs arrive; observe only an available DOM node.
  createEffect(() => [element(), props.for] as const, ([label]) => {
    if (!label) return;
    const current = label.control as typeof previous;
    const oldLabels = previous?.labels;
    const newLabels = current?.labels;
    const staleOld = previous !== current && oldLabels && Array.from(oldLabels).includes(label);
    const staleNew = newLabels && !Array.from(newLabels).includes(label);
    previous = current;
    if (!staleOld && !staleNew) return;
    // Firefox can cache labels across a for update. A child-list mutation refreshes
    // those collections without detaching the label, moving children or changing ARIA.
    const marker = label.ownerDocument.createComment('');
    label.append(marker);
    marker.remove();
  });
  return <label {...rest} ref={node => { setElement(node); if (typeof props.ref === 'function') props.ref(node); }} data-slot={props["data-slot"] ?? "label"} class={cn(
    'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
    props.class,
  )} />;
}
