import {
  UtensilsCrossed, ShoppingCart, Car, Fuel, Home, Receipt, Wifi, Tv, CreditCard, Heart,
  Pill, GraduationCap, Shirt, Sofa, PawPrint, Gift, Smartphone, Plane, Sparkles, Shield,
  FileText, Baby, Dumbbell, MoreHorizontal, Briefcase, Laptop, TrendingUp, RotateCcw, Tag, Plus,
  Package, Users, Percent, Megaphone, Wrench, Hammer, Armchair, BookOpen, SprayCan, Scissors,
  Palette, PenTool, Droplet, ShoppingBag, Circle, type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, ShoppingCart, Car, Fuel, Home, Receipt, Wifi, Tv, CreditCard, Heart,
  Pill, GraduationCap, Shirt, Sofa, PawPrint, Gift, Smartphone, Plane, Sparkles, Shield,
  FileText, Baby, Dumbbell, MoreHorizontal, Briefcase, Laptop, TrendingUp, RotateCcw, Tag, Plus,
  Package, Users, Percent, Megaphone, Wrench, Hammer, Armchair, BookOpen, SprayCan, Scissors,
  Palette, PenTool, Droplet, ShoppingBag,
};

export const ICON_CHOICES = Object.keys(ICON_MAP).sort();

export function getCategoryIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Circle;
  return ICON_MAP[name] ?? Circle;
}

export interface CategoryColor {
  bg: string;
  text: string;
  ring: string;
  solid: string;
  label: string;
  darkBg: string;
  darkText: string;
  darkRing: string;
}

const COLOR_MAP: Record<string, CategoryColor> = {
  red: {
    bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200', solid: 'bg-red-500', label: 'Rojo',
    darkBg: 'bg-red-950', darkText: 'text-red-300', darkRing: 'ring-red-800',
  },
  orange: {
    bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200', solid: 'bg-orange-500', label: 'Naranja',
    darkBg: 'bg-orange-950', darkText: 'text-orange-300', darkRing: 'ring-orange-800',
  },
  amber: {
    bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', solid: 'bg-amber-500', label: 'Ámbar',
    darkBg: 'bg-amber-950', darkText: 'text-amber-300', darkRing: 'ring-amber-800',
  },
  lime: {
    bg: 'bg-lime-100', text: 'text-lime-700', ring: 'ring-lime-200', solid: 'bg-lime-500', label: 'Lima',
    darkBg: 'bg-lime-950', darkText: 'text-lime-300', darkRing: 'ring-lime-800',
  },
  green: {
    bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200', solid: 'bg-green-500', label: 'Verde',
    darkBg: 'bg-green-950', darkText: 'text-green-300', darkRing: 'ring-green-800',
  },
  emerald: {
    bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', solid: 'bg-emerald-500', label: 'Esmeralda',
    darkBg: 'bg-emerald-950', darkText: 'text-emerald-300', darkRing: 'ring-emerald-800',
  },
  teal: {
    bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-200', solid: 'bg-teal-500', label: 'Teal',
    darkBg: 'bg-teal-950', darkText: 'text-teal-300', darkRing: 'ring-teal-800',
  },
  cyan: {
    bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-200', solid: 'bg-cyan-500', label: 'Cian',
    darkBg: 'bg-cyan-950', darkText: 'text-cyan-300', darkRing: 'ring-cyan-800',
  },
  sky: {
    bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200', solid: 'bg-sky-500', label: 'Cielo',
    darkBg: 'bg-sky-950', darkText: 'text-sky-300', darkRing: 'ring-sky-800',
  },
  blue: {
    bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200', solid: 'bg-blue-500', label: 'Azul',
    darkBg: 'bg-blue-950', darkText: 'text-blue-300', darkRing: 'ring-blue-800',
  },
  indigo: {
    bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200', solid: 'bg-indigo-500', label: 'Índigo',
    darkBg: 'bg-indigo-950', darkText: 'text-indigo-300', darkRing: 'ring-indigo-800',
  },
  violet: {
    bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200', solid: 'bg-violet-500', label: 'Violeta',
    darkBg: 'bg-violet-950', darkText: 'text-violet-300', darkRing: 'ring-violet-800',
  },
  purple: {
    bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200', solid: 'bg-purple-500', label: 'Púrpura',
    darkBg: 'bg-purple-950', darkText: 'text-purple-300', darkRing: 'ring-purple-800',
  },
  fuchsia: {
    bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', ring: 'ring-fuchsia-200', solid: 'bg-fuchsia-500', label: 'Fucsia',
    darkBg: 'bg-fuchsia-950', darkText: 'text-fuchsia-300', darkRing: 'ring-fuchsia-800',
  },
  pink: {
    bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-200', solid: 'bg-pink-500', label: 'Rosa',
    darkBg: 'bg-pink-950', darkText: 'text-pink-300', darkRing: 'ring-pink-800',
  },
  rose: {
    bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200', solid: 'bg-rose-500', label: 'Rosa claro',
    darkBg: 'bg-rose-950', darkText: 'text-rose-300', darkRing: 'ring-rose-800',
  },
  slate: {
    bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200', solid: 'bg-slate-500', label: 'Gris',
    darkBg: 'bg-slate-800', darkText: 'text-slate-300', darkRing: 'ring-slate-700',
  },
};

export const COLOR_CHOICES = Object.keys(COLOR_MAP);
export { COLOR_MAP };

export const DEFAULT_COLOR_KEY = 'blue';

export const DEFAULT_COLOR: CategoryColor = COLOR_MAP[DEFAULT_COLOR_KEY];

export function getCategoryColor(
  name: string | undefined | null,
  colorKey?: string | null,
  _dark = false,
): CategoryColor {
  if (colorKey && COLOR_MAP[colorKey]) return COLOR_MAP[colorKey];
  if (!name) return DEFAULT_COLOR;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const keys = Object.keys(COLOR_MAP);
  return COLOR_MAP[keys[Math.abs(hash) % keys.length]];
}

export function getColorByKey(key: string | undefined | null, _dark = false): CategoryColor {
  if (key && COLOR_MAP[key]) return COLOR_MAP[key];
  return DEFAULT_COLOR;
}

export function getColorClasses(color: CategoryColor, dark: boolean): {
  bg: string;
  text: string;
  ring: string;
} {
  return {
    bg: dark ? color.darkBg : color.bg,
    text: dark ? color.darkText : color.text,
    ring: dark ? color.darkRing : color.ring,
  };
}