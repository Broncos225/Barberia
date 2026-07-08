import { AlertTriangle, Info } from 'lucide-react';
import { useConfirmStore } from '@/stores/confirm.store';
import { cn } from '@/lib/cn';

export function ConfirmDialog() {
  const { open, options, close } = useConfirmStore();
  if (!open) return null;

  const Icon = options.danger ? AlertTriangle : Info;
  const iconColor = options.danger ? 'text-expense' : 'text-brand-600';
  const iconBg = options.danger ? 'bg-expense-light' : 'bg-brand-50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={() => close(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start gap-3">
          <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full', iconBg)}>
            <Icon size={20} className={iconColor} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{options.title}</h3>
            {options.message && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{options.message}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => close(false)}
            className="btn-secondary w-full sm:w-auto"
            autoFocus={!options.danger}
          >
            {options.cancelText ?? 'Cancelar'}
          </button>
          <button
            onClick={() => close(true)}
            className={cn('w-full sm:w-auto', options.danger ? 'btn-danger' : 'btn-primary')}
            autoFocus={options.danger}
          >
            {options.confirmText ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
