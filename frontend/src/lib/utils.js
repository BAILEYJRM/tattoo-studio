import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de CSS condicionalmente usando clsx y resuelve conflictos de Tailwind con tailwind-merge.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
