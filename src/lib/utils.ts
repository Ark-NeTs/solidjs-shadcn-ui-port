// Shared class composition behind the Solid 2 package boundary; D19.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
/** Resolve conditional classes and let caller utilities replace conflicting defaults. */
export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }
