import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtNl(n: number, digits = 0) {
  return n.toLocaleString("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function mmFromUm(um: number) {
  const n = um / 1000;
  const sign = n > 0 ? "+" : n < 0 ? "" : "+";
  const decimals = Math.abs(um) % 1 === 0 ? 3 : 4;
  return sign + n.toFixed(decimals).replace(".", ",");
}

export function fmtMm(n: number, digits = 1) {
  return n.toFixed(digits).replace(".", ",");
}
