// Typed native polymorphism for presentation parts, preserving element-specific refs; D19/D90.
import type { JSX } from '@solidjs/web';
export type NativePartProps =
 | ({as?: 'div'} & JSX.HTMLAttributes<HTMLDivElement>)
 | ({as: 'a'} & JSX.AnchorHTMLAttributes<HTMLAnchorElement>)
 | ({as: 'button'} & JSX.ButtonHTMLAttributes<HTMLButtonElement>);
