import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const colors = [
  "bg-slate-100 border-slate-300",
  "bg-emerald-100 border-emerald-300",
  "bg-blue-100 border-blue-300",
  "bg-amber-100 border-amber-300",
  "bg-violet-100 border-violet-300",
];
