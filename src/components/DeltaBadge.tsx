import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  delta: number;
  inverse?: boolean;
  label?: string;
}

export function DeltaBadge({ delta, inverse = false, label }: Props) {
  if (Number.isNaN(delta)) return null;
  if (Math.abs(delta) < 0.5) {
    return (
      <span className={cn('inline-flex items-center gap-0.5 text-xs text-slate-500')}>
        <Minus size={12} />
        <span>{label ? `${label} ` : ''}sin cambio</span>
      </span>
    );
  }
  const isUp = delta > 0;
  // For "inverse" metrics (like gastos), going up is bad
  const isGood = inverse ? !isUp : isUp;
  const color = isGood ? 'text-income' : 'text-expense';
  const Icon = isUp ? ArrowUp : ArrowDown;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium tabular-nums', color)}>
      <Icon size={12} />
      <span>
        {label ? `${label} ` : ''}
        {Math.abs(delta).toFixed(0)}%
      </span>
    </span>
  );
}