import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// VDI / Düşük Performans Algılama
export function isLowPerformanceDevice(): boolean {
  if (typeof window === "undefined") return false;
  // Kullanıcı hareketi azalttıysa veya işlemci çekirdeği azsa (VDI genelde 2 vCPU verir)
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || 
         (navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false);
}

// Para birimi formatlayıcı (TR)
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};