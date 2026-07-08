import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/cn';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : Info;
        const color = t.type === 'success' ? 'text-income' : t.type === 'error' ? 'text-expense' : 'text-slate-600 dark:text-slate-300';
        return (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={cn(
              'pointer-events-auto flex max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800',
            )}
          >
            <Icon size={18} className={color} />
            <span>{t.message}</span>
          </button>
        );
      })}
    </div>
  );
}
