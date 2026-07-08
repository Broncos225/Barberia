import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import { useCategorias } from '@/features/categories/hooks/useCategorias';
import { useTransaction } from '../hooks/useTransactions';
import {
  createTransaction,
  updateTransaction,
  deleteTransactionWithReceipt,
} from '../services/transactions.service';
import { createReceipt, deleteReceipt } from '@/features/receipts/services/receipts.service';
import { useUiStore } from '@/stores/ui.store';
import { confirm as confirmDialog } from '@/stores/confirm.store';
import { formatThousands, parseThousands, formatLocalDate, parseLocalDate } from '@/lib/format';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getCategoryColor, getColorClasses } from '@/lib/category-style';
import { useIsDark } from '@/hooks/useIsDark';
import { compressImage, formatBytes } from '@/lib/image';
import type { MetodoPago, TipoTransaccion, Transaccion } from '@/types';
import { ArrowLeft, Trash2, Tags, Circle, Camera, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const SIN_CATEGORIA = 'Sin categoría';

export function TransactionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const showToast = useUiStore((s) => s.showToast);
  const dark = useIsDark();

  const isEdit = Boolean(id);
  const { items: catsGasto } = useCategorias('gasto');
  const { items: catsIngreso } = useCategorias('ingreso');
  const { item: editing, loading: editingLoading } = useTransaction(id);

  const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
  const [monto, setMonto] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | undefined>(undefined);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [fecha, setFecha] = useState(() => formatLocalDate());
  const [nota, setNota] = useState('');
  const [reciboPreview, setReciboPreview] = useState<string | null>(null);
  const [reciboMeta, setReciboMeta] = useState<{ width: number; height: number; sizeBytes: number } | null>(null);
  const [reciboFile, setReciboFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit || !editing || hydrated) return;
    setTipo(editing.tipo);
    setMonto(formatThousands(editing.monto));
    setCategoriaId(editing.categoriaId);
    setMetodoPago(editing.metodoPago);
    setFecha(formatLocalDate(editing.fecha.toDate()));
    setNota(editing.nota ?? '');
    if (editing.reciboId && user) {
      // Fetch existing receipt preview
      import('@/features/receipts/services/receipts.service').then(({ subscribeReceipt }) => {
        subscribeReceipt(user.uid, editing.reciboId!, (r) => {
          if (r) setReciboPreview(`data:${r.mimeType};base64,${r.base64}`);
        });
      });
    }
    setHydrated(true);
  }, [isEdit, editing, hydrated, user]);

  const categorias = tipo === 'gasto' ? catsGasto : catsIngreso;

  const onClose = () => {
    if (!current) {
      navigate('/');
      return;
    }
    if (isEdit) {
      navigate(`/${current}/transactions/${id}`);
    } else {
      navigate(`/${current}`);
    }
  };

  const onPickReceipt = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Solo se permiten imágenes', 'error');
      return;
    }
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setReciboFile(file);
      setReciboPreview(`data:${compressed.mimeType};base64,${compressed.base64}`);
      setReciboMeta({ width: compressed.width, height: compressed.height, sizeBytes: compressed.sizeBytes });
    } catch {
      showToast('No se pudo procesar la imagen', 'error');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onRemoveReceipt = () => {
    setReciboFile(null);
    setReciboPreview(null);
    setReciboMeta(null);
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!user || !current) return;
    const montoNum = parseThousands(monto);
    if (!montoNum || montoNum <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    const cat = categoriaId ? categorias.find((c) => c.id === categoriaId) : undefined;
    setSaving(true);
    try {
      let reciboId: string | undefined;
      // Upload receipt if a new one was picked
      if (reciboFile) {
        const compressed = await compressImage(reciboFile);
        reciboId = await createReceipt(user.uid, {
          base64: compressed.base64,
          mimeType: compressed.mimeType,
          sizeBytes: compressed.sizeBytes,
          width: compressed.width,
          height: compressed.height,
        });
        // If editing and there was a previous receipt, delete it
        if (isEdit && editing?.reciboId && editing.reciboId !== reciboId) {
          await deleteReceipt(user.uid, editing.reciboId).catch(() => {});
        }
      } else if (isEdit && editing?.reciboId && !reciboPreview) {
        // User removed the receipt in edit mode
        await deleteReceipt(user.uid, editing.reciboId).catch(() => {});
        reciboId = undefined;
      } else if (isEdit && editing?.reciboId) {
        // Keep the existing receipt
        reciboId = editing.reciboId;
      }

      const data: Omit<Transaccion, 'id' | 'createdAt' | 'updatedAt' | 'driveSyncedAt'> = {
        espacio: current,
        tipo,
        monto: montoNum,
        categoriaNombre: cat?.nombre ?? SIN_CATEGORIA,
        metodoPago,
        fecha: Timestamp.fromDate(parseLocalDate(fecha)),
        ...(cat?.id ? { categoriaId: cat.id, categoriaIcono: cat.icono } : {}),
        ...(nota.trim() ? { nota: nota.trim() } : {}),
        ...(reciboId ? { reciboId } : {}),
      };

      if (isEdit && id) {
        await updateTransaction(user.uid, id, data);
        showToast('Transacción actualizada', 'success');
      } else {
        await createTransaction(user.uid, data);
        showToast('Transacción guardada', 'success');
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
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
      if (current) navigate(`/${current}`);
      else navigate('/');
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  if (isEdit && editingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-500 dark:text-slate-400">Cargando transacción...</div>
      </div>
    );
  }

  if (isEdit && !editing) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-semibold">Editar</h2>
          <div className="w-9" />
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <p className="text-slate-600 dark:text-slate-300">Transacción no encontrada</p>
            <button onClick={onClose} className="btn-primary mt-4">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold">{isEdit ? 'Editar' : 'Nueva'} transacción</h2>
        {isEdit ? (
          <button onClick={onDelete} className="rounded-lg p-2 text-expense hover:bg-expense-light">
            <Trash2 size={20} />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      <form onSubmit={onSubmit} className="flex-1 space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              setTipo('gasto');
              setCategoriaId(undefined);
            }}
            className={cn(
              'rounded-lg py-2.5 text-sm font-semibold transition-colors',
              tipo === 'gasto' ? 'bg-white text-expense shadow-sm dark:bg-slate-900' : 'text-slate-600 dark:text-slate-400',
            )}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => {
              setTipo('ingreso');
              setCategoriaId(undefined);
            }}
            className={cn(
              'rounded-lg py-2.5 text-sm font-semibold transition-colors',
              tipo === 'ingreso' ? 'bg-white text-income shadow-sm dark:bg-slate-900' : 'text-slate-600 dark:text-slate-400',
            )}
          >
            Ingreso
          </button>
        </div>

        <div>
          <label className="label">Monto</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-slate-400">
              $
            </span>
            <input
              autoFocus={!isEdit}
              type="text"
              value={monto}
              onChange={(e) => setMonto(formatThousands(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="0"
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 pl-10 pr-4 text-3xl font-bold tabular-nums focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="label">Categoría (opcional)</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoriaId(undefined)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm transition-colors',
                !categoriaId
                  ? dark
                    ? 'border-brand-400 bg-brand-950 text-brand-200'
                    : 'border-brand-500 bg-brand-50 text-brand-700'
                  : dark
                    ? 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
              )}
            >
              <Circle size={14} strokeWidth={2.25} className={dark ? 'text-slate-500' : 'text-slate-400'} />
              Sin categoría
            </button>
            {categorias.map((c) => {
              const isSelected = categoriaId === c.id;
              const color = getCategoryColor(c.nombre, c.color, dark);
              const cls = getColorClasses(color, dark);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoriaId(c.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-2 py-1 text-sm transition-colors',
                    isSelected
                      ? `${cls.bg} ${cls.text} border-transparent ring-2 ${cls.ring}`
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600',
                  )}
                >
                  <CategoryIcon nombre={c.nombre} icono={c.icono} colorKey={c.color} size="sm" className="!h-5 !w-5" />
                  {c.nombre}
                </button>
              );
            })}
          </div>
          {categorias.length === 0 && (
            <button
              type="button"
              onClick={() => current && navigate(`/${current}/categories`)}
              className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400"
            >
              <Tags size={12} />
              No tienes categorías. Crear la primera →
            </button>
          )}
        </div>

        <div>
          <label className="label">Método de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {(['efectivo', 'tarjeta', 'transferencia'] as MetodoPago[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm capitalize transition-colors',
                  metodoPago === m
                    ? dark
                      ? 'border-brand-400 bg-brand-950 text-brand-200'
                      : 'border-brand-500 bg-brand-50 text-brand-700'
                    : dark
                      ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="label">Nota (opcional)</label>
          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="input"
            placeholder="Detalle breve"
          />
        </div>

        <div>
          <label className="label">Recibo (opcional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          {!reciboPreview && !compressing && (
            <button
              type="button"
              onClick={onPickReceipt}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
            >
              <Camera size={20} />
              Adjuntar foto del recibo
            </button>
          )}
          {compressing && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              <Loader2 size={18} className="animate-spin" />
              Procesando imagen...
            </div>
          )}
          {reciboPreview && !compressing && (
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700">
              <img src={reciboPreview} alt="Recibo" className="max-h-64 w-full object-contain" />
              <button
                type="button"
                onClick={onRemoveReceipt}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              >
                <X size={16} />
              </button>
              {reciboMeta && (
                <p className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {reciboMeta.width}×{reciboMeta.height} · {formatBytes(reciboMeta.sizeBytes)}
                </p>
              )}
            </div>
          )}
        </div>

        {error && <div className="rounded-lg bg-expense-light p-3 text-sm text-expense dark:bg-expense-dark dark:text-red-300">{error}</div>}
      </form>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 pb-6 dark:border-slate-800 dark:bg-slate-900">
        <button onClick={() => onSubmit()} disabled={saving || compressing} className="btn-primary w-full">
          {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}