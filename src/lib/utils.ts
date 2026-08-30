import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, symbol = "сомонӣ") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toLocaleString("tg-TJ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tg-TJ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
