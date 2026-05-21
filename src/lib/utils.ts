import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Helper canonico do shadcn/ui — combina condicionais + dedup classes Tailwind.
 * Uso: cn("px-4", isActive && "bg-fur", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
