import type { RiskRange } from '@/features/risk-constitution/types';

export function getRiskZone(score: number, ranges: RiskRange[]): RiskRange | null {
  const sorted = [...ranges].sort((a, b) => b.min - a.min);
  return sorted.find(r => score >= r.min && score <= r.max) || ranges[ranges.length - 1] || null;
}

export function getRiskColor(score: number, ranges: RiskRange[]): string {
  const zone = getRiskZone(score, ranges);
  return zone?.color || '#64748b';
}

export function getRiskLabel(score: number, ranges: RiskRange[]): string {
  const zone = getRiskZone(score, ranges);
  return zone?.label || 'Bilinmiyor';
}

export function getRiskBadgeClasses(score: number, ranges: RiskRange[]): string {
  const color = getRiskColor(score, ranges);
  return `text-white border`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function getTailwindBgClass(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#800000': 'bg-[#800000]',
    '#dc2626': 'bg-red-600',
    '#f97316': 'bg-orange-500',
    '#eab308': 'bg-yellow-500',
    '#22c55e': 'bg-green-500',
  };
  return colorMap[hexColor.toLowerCase()] || 'bg-slate-500';
}

export function getTailwindTextClass(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#800000': 'text-[#800000]',
    '#dc2626': 'text-red-600',
    '#f97316': 'text-orange-500',
    '#eab308': 'text-yellow-500',
    '#22c55e': 'text-green-500',
  };
  return colorMap[hexColor.toLowerCase()] || 'text-slate-500';
}

export function getTailwindBorderClass(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#800000': 'border-[#800000]',
    '#dc2626': 'border-red-600',
    '#f97316': 'border-orange-500',
    '#eab308': 'border-yellow-500',
    '#22c55e': 'border-green-500',
  };
  return colorMap[hexColor.toLowerCase()] || 'border-slate-500';
}
