import { formatCOP, formatDate } from '@/lib/format';
import type { Transaccion } from '@/types';
import { cn } from '@/lib/cn';
import { CreditCard, Banknote, ArrowLeftRight, Paperclip } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { useCategoriaMap } from '@/features/categories/hooks/useCategorias';

interface Props {
  transaccion: Transaccion;
  onClick?: () => void;
}

const METODO_ICONS = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  transferencia: ArrowLeftRight,
};

export function TransactionItem({ transaccion: t, onClick }: Props) {
  const isIngreso = t.tipo === 'ingreso';
  const MetodoIcon = METODO_ICONS[t.metodoPago];
  const catMap = useCategoriaMap(t.espacio);
  const cat = t.categoriaId ? catMap.get(t.categoriaId) : undefined;
  const icono = t.categoriaIcono ?? cat?.icono;
  const colorKey = cat?.color;
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
    >
      <CategoryIcon nombre={t.categoriaNombre} icono={icono} colorKey={colorKey} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{t.categoriaNombre}</span>
          {t.reciboId && (
            <Paperclip size={12} className="flex-shrink-0 text-slate-400" />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <MetodoIcon size={12} />
          <span className="capitalize">{t.metodoPago}</span>
          <span>·</span>
          <span>{formatDate(t.fecha.toDate())}</span>
        </div>
        {t.nota && <div className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{t.nota}</div>}
      </div>
      <div
        className={cn(
          'flex-shrink-0 text-sm font-semibold tabular-nums',
          isIngreso ? 'text-income' : 'text-expense',
        )}
      >
        {isIngreso ? '+' : '−'}
        {formatCOP(t.monto)}
      </div>
    </button>
  );
}
