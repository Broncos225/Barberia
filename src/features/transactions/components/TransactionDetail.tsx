import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, CreditCard, Banknote, ArrowLeftRight, FileText, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import { useTransaction } from '../hooks/useTransactions';
import { deleteTransactionWithReceipt } from '../services/transactions.service';
import { deleteReceipt } from '@/features/receipts/services/receipts.service';
import { useReceipt } from '@/features/receipts/hooks/useReceipt';
import { useUiStore } from '@/stores/ui.store';
import { confirm as confirmDialog } from '@/stores/confirm.store';
import { useCategoriaMap } from '@/features/categories/hooks/useCategorias';
import { formatCOP, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Skeleton } from '@/components/Skeleton';
import type { Transaccion } from '@/types';

const METODO_ICONS = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  transferencia: ArrowLeftRight,
};

const METODO_LABELS = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const showToast = useUiStore((s) => s.showToast);
  const { item, loading } = useTransaction(id);

  const onClose = () => {
    if (current) navigate(`/${current}`);
    else navigate('/');
  };

  const onEdit = () => {
    if (id && current) navigate(`/${current}/transactions/${id}/edit`);
  };

  const onDelete = async () => {
    if (!user || !id) return;
    const ok = await confirmDialog({
      title: '¿Eliminar esta transacción?',
      message: 'Esta acción no se puede deshacer. Si tiene recibo adjunto, también se eliminará.',
      confirmText: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteTransactionWithReceipt(user.uid, id);
      showToast('Transacción eliminada', 'success');
      onClose();
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-9 w-9" />
          <Skeleton className="h-5 w-40" />
          <div className="h-9 w-9" />
        </div>
        <div className="space-y-4 p-4">
          <div className="card space-y-3 text-center">
            <Skeleton className="mx-auto h-5 w-20" rounded="full" />
            <Skeleton className="mx-auto h-10 w-44" />
          </div>
          <div className="card space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9" rounded="lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-semibold">Detalle</h2>
          <div className="w-9" />
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <p className="text-slate-600 dark:text-slate-300">Transacción no encontrada</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Puede que haya sido eliminada</p>
            <button onClick={onClose} className="btn-primary mt-4">
              Volver al historial
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <DetailContent item={item} onClose={onClose} onEdit={onEdit} onDelete={onDelete} />;
}

function DetailContent({
  item,
  onClose,
  onEdit,
  onDelete,
}: {
  item: Transaccion;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIngreso = item.tipo === 'ingreso';
  const MetodoIcon = METODO_ICONS[item.metodoPago];
  const fecha = item.fecha.toDate();
  const created = item.createdAt.toDate();
  const catMap = useCategoriaMap(item.espacio);
  const cat = item.categoriaId ? catMap.get(item.categoriaId) : undefined;
  const icono = item.categoriaIcono ?? cat?.icono;
  const colorKey = cat?.color;
  const [receiptModal, setReceiptModal] = useState(false);
  const { user } = useAuth();
  const showToast = useUiStore((s) => s.showToast);
  const { receipt } = useReceipt(item.reciboId);

  const onDeleteReceipt = async () => {
    if (!user || !item.reciboId) return;
    const ok = await confirmDialog({
      title: '¿Eliminar el recibo?',
      message: 'La transacción se mantiene, solo se borra la foto.',
      confirmText: 'Eliminar foto',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteReceipt(user.uid, item.reciboId);
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await updateDoc(doc(db, 'users', user.uid, 'transactions', item.id), { reciboId: null });
      showToast('Recibo eliminado', 'success');
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold">Detalle de transacción</h2>
        <button onClick={onEdit} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950">
          <Edit2 size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-4 p-4">
        <div className="card text-center">
          <div
            className={cn(
              'mx-auto mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
              isIngreso ? 'bg-income-light text-income' : 'bg-expense-light text-expense',
            )}
          >
            {isIngreso ? 'INGRESO' : 'GASTO'}
          </div>
          <p
            className={cn(
              'text-4xl font-bold tabular-nums',
              isIngreso ? 'text-income' : 'text-expense',
            )}
          >
            {isIngreso ? '+' : '−'}
            {formatCOP(item.monto)}
          </p>
        </div>

        <div className="card space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center gap-3 pt-3 first:pt-0">
            <CategoryIcon nombre={item.categoriaNombre} icono={icono} colorKey={colorKey} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Categoría</p>
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.categoriaNombre}</p>
            </div>
          </div>
          <Row Icon={MetodoIcon} label="Método de pago" value={METODO_LABELS[item.metodoPago]} />
          <Row Icon={Calendar} label="Fecha" value={formatDate(fecha)} />
          {item.nota && <Row Icon={FileText} label="Nota" value={item.nota} />}
          <Row
            Icon={Clock}
            label="Creado"
            value={formatDate(created) + ' ' + created.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            muted
          />
        </div>

        {item.reciboId && receipt && (
          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recibo</h2>
              <button
                onClick={onDeleteReceipt}
                className="text-xs text-expense hover:underline"
              >
                Eliminar
              </button>
            </div>
            <button
              type="button"
              onClick={() => setReceiptModal(true)}
              className="block w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <img
                src={`data:${receipt.mimeType};base64,${receipt.base64}`}
                alt="Recibo"
                className="max-h-72 w-full object-contain"
              />
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toca para ver en pantalla completa
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-slate-200 bg-white p-4 pb-6 dark:border-slate-800 dark:bg-slate-900">
        <button onClick={onEdit} className="btn-primary w-full">
          <Edit2 size={18} /> Editar
        </button>
        <button onClick={onDelete} className="btn-danger w-full">
          <Trash2 size={18} /> Eliminar
        </button>
      </div>

      {receiptModal && receipt && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setReceiptModal(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setReceiptModal(false)}
          >
            <X size={20} />
          </button>
          <img
            src={`data:${receipt.mimeType};base64,${receipt.base64}`}
            alt="Recibo"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}

function Row({
  Icon,
  label,
  value,
  muted,
}: {
  Icon: typeof Calendar;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-3 first:pt-0">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className={cn('truncate text-sm', muted ? 'text-slate-500 dark:text-slate-400' : 'font-medium text-slate-900 dark:text-slate-100')}>
          {value}
        </p>
      </div>
    </div>
  );
}
