// The design system's class-merge helper (D19) — the ONE utility apps import
// from this package besides the components themselves.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names, letting later Tailwind utilities win over earlier ones
 * (`cn('p-2', cond && 'p-4')` → `p-4`). `clsx` flattens the conditional
 * forms; `twMerge` resolves same-property conflicts, which plain string
 * concatenation cannot.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
