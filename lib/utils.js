import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const colors = [
  "bg-slate-50 border-slate-200",
  "bg-emerald-50 border-emerald-200",
  "bg-blue-50 border-blue-200",
  "bg-amber-50 border-amber-200",
  "bg-violet-50 border-violet-200",
];
