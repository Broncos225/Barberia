import { TransactionItem } from './TransactionItem';
import type { Transaccion } from '@/types';

interface Props {
  items: Transaccion[];
  onItemClick?: (t: Transaccion) => void;
  emptyMessage?: string;
}

export function TransactionList({ items, onItemClick, emptyMessage }: Props) {
  if (items.length === 0) {
    return <div className="card text-center text-sm text-slate-500">{emptyMessage ?? 'Sin transacciones'}</div>;
  }
  return (
    <div className="space-y-1">
      {items.map((t) => (
        <TransactionItem key={t.id} transaccion={t} onClick={() => onItemClick?.(t)} />
      ))}
    </div>
  );
}
