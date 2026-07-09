// `cn` — the class-merge helper every component uses to fold caller `class`
// overrides into its base classes (clsx for conditionals, tailwind-merge to
// dedupe conflicting Tailwind utilities). Identical to the React theme's `cn`
// so both design systems compose classes the same way (D19, D49).
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class values and dedupe conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
