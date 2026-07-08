import { cn } from '@/lib/cn';

export type QuickFilter = 'today' | 'week' | 'month' | 'year' | 'all';

interface Props {
  current: QuickFilter;
  onChange: (value: QuickFilter) => void;
}

const OPTIONS: { value: QuickFilter; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
  { value: 'all', label: 'Todo' },
];

export function QuickFilters({ current, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            current === opt.value
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function getDateRange(filter: QuickFilter): { desde?: Date; hasta?: Date } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  switch (filter) {
    case 'today':
      return { desde: startOfDay, hasta: endOfDay };
    case 'week': {
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const sundayOffset = day === 0 ? 0 : 7 - day;
      const desde = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
      const hasta = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + sundayOffset,
        23,
        59,
        59,
        999,
      );
      return { desde, hasta };
    }
    case 'month':
      return {
        desde: new Date(now.getFullYear(), now.getMonth(), 1),
        hasta: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    case 'year':
      return {
        desde: new Date(now.getFullYear(), 0, 1),
        hasta: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    case 'all':
    default:
      return {};
  }
}