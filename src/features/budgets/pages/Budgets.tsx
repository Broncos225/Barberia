import { useEffect, useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import { useCategorias } from '@/features/categories/hooks/useCategorias';
import { usePresupuestos } from '../hooks/usePresupuestos';
import {
  createPresupuesto,
  deletePresupuesto,
  updatePresupuesto,
} from '../services/presupuestos.service';
import { useUiStore } from '@/stores/ui.store';
import { confirm as confirmDialog } from '@/stores/confirm.store';
import {
  buildPeriodoMensual,
  buildPeriodoQuincenal,
  parsePeriodo,
  periodosDelMes,
  type Frecuencia,
  type Quincena,
  type TipoTransaccion,
  type Categoria,
} from '@/types';
import { formatCOP, formatThousands, parseThousands } from '@/lib/format';
import { cn } from '@/lib/cn';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Skeleton } from '@/components/Skeleton';
import { subscribeTransactions } from '@/features/transactions/services/transactions.service';
import type { Transaccion } from '@/types';

const MES_RE = /^\d{4}-\d{2}$/;

export function BudgetsPage() {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const showToast = useUiStore((s) => s.showToast);
  const [mes, setMes] = useState(() => buildPeriodoMensual(new Date().getFullYear(), new Date().getMonth()));
  const [adding, setAdding] = useState<TipoTransaccion | null>(null);

  const { items: catsGasto } = useCategorias('gasto');
  const { items: catsIngreso } = useCategorias('ingreso');
  const { items: presupuestos } = usePresupuestos(mes);

  const gastos = presupuestos.filter((p) => p.tipo === 'gasto');
  const ingresos = presupuestos.filter((p) => p.tipo === 'ingreso');

  if (!user || !current) return null;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <input
          type="month"
          value={mes}
          onChange={(e) => {
            if (MES_RE.test(e.target.value)) setMes(e.target.value);
          }}
          className="input max-w-[160px]"
        />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Define topes de gasto y metas de ingreso. Elige si son mensuales o quincenales.
      </p>

      <Section
        title="Metas de ingreso"
        subtitle="Cuánto quieres recibir en el período"
        Icon={TrendingUp}
        tipo="ingreso"
        items={ingresos}
        categorias={catsIngreso}
        onAdded={() => {
          setAdding(null);
          showToast('Meta creada', 'success');
        }}
        onCancel={() => setAdding(null)}
        showAdd={adding === 'ingreso'}
        onAddClick={() => setAdding('ingreso')}
      />

      <Section
        title="Topes de gasto"
        subtitle="Límite que no quieres superar en el período"
        Icon={TrendingDown}
        tipo="gasto"
        items={gastos}
        categorias={catsGasto}
        onAdded={() => {
          setAdding(null);
          showToast('Presupuesto creado', 'success');
        }}
        onCancel={() => setAdding(null)}
        showAdd={adding === 'gasto'}
        onAddClick={() => setAdding('gasto')}
      />
    </div>
  );

  function Section({
    title,
    subtitle,
    Icon,
    tipo,
    items: list,
    categorias,
    onAdded,
    onCancel,
    showAdd,
    onAddClick,
  }: {
    title: string;
    subtitle: string;
    Icon: typeof TrendingUp;
    tipo: TipoTransaccion;
    items: import('@/types').Presupuesto[];
    categorias: Categoria[];
    onAdded: () => void;
    onCancel: () => void;
    showAdd: boolean;
    onAddClick: () => void;
  }) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={18} className={tipo === 'ingreso' ? 'text-income' : 'text-expense'} />
            <div>
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
        {list.length === 0 && !showAdd && (
          <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
            Sin {tipo === 'ingreso' ? 'metas' : 'presupuestos'} para este período
          </div>
        )}
        <div className="space-y-2">
          {list.map((p) => (
            <BudgetRow key={p.id} presupuesto={p} categoria={categorias.find((c) => c.id === p.categoriaId)} />
          ))}
          {showAdd && user && current && (
            <NewBudgetRow
              tipo={tipo}
              categorias={categorias}
              existing={presupuestos.map((p) => p.categoriaId + ':' + p.periodo)}
              defaultMes={mes}
              onCancel={onCancel}
              onCreated={onAdded}
            />
          )}
        </div>
      </div>
    );
  }
}

function BudgetRow({
  presupuesto: p,
  categoria,
}: {
  presupuesto: import('@/types').Presupuesto;
  categoria?: Categoria;
}) {
  const { user } = useAuth();
  const showToast = useUiStore((s) => s.showToast);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(formatThousands(p.monto));

  if (!categoria) return null;
  const { label } = parsePeriodo(p.periodo);

  const remove = async () => {
    if (!user) return;
    const ok = await confirmDialog({
      title: `¿Eliminar ${p.tipo === 'ingreso' ? 'la meta' : 'el presupuesto'} de ${categoria.nombre}?`,
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePresupuesto(user.uid, p.id);
      showToast('Eliminado', 'success');
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  const save = async () => {
    if (!user) return;
    const num = parseThousands(value);
    if (!num || num <= 0) return;
    try {
      await updatePresupuesto(user.uid, p.id, { monto: num });
      showToast('Actualizado', 'success');
      setEditing(false);
    } catch {
      showToast('Error al actualizar', 'error');
    }
  };

  return (
    <div className="card space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <CategoryIcon nombre={categoria.nombre} icono={categoria.icono} colorKey={categoria.color} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{categoria.nombre}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          {editing ? (
            <>
              <input
                autoFocus
                type="text"
                value={value}
                onChange={(e) => setValue(formatThousands(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') save();
                  if (e.key === 'Escape') {
                    setValue(formatThousands(p.monto));
                    setEditing(false);
                  }
                }}
                className="input w-32 py-1 text-right text-sm tabular-nums"
              />
              <button onClick={save} className="rounded-lg p-1.5 text-income hover:bg-income-light">
                ✓
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold tabular-nums">{formatCOP(p.monto)}</span>
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✎
              </button>
            </>
          )}
          <button
            onClick={remove}
            className="rounded-lg p-1 text-expense hover:bg-expense-light"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <BudgetProgress
        espacio={p.espacio}
        categoriaId={p.categoriaId}
        tipo={p.tipo}
        periodo={p.periodo}
        meta={p.monto}
      />
    </div>
  );
}

function BudgetProgress({
  espacio,
  categoriaId,
  tipo,
  periodo,
  meta,
}: {
  espacio: import('@/types').Espacio;
  categoriaId: string;
  tipo: TipoTransaccion;
  periodo: string;
  meta: number;
}) {
  const { user } = useAuth();
  const [monto, setMonto] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const { start, end } = parsePeriodo(periodo);
    const unsub = subscribeTransactions(
      user.uid,
      { espacio, desde: start, hasta: end, tipo, categoriaId },
      (txs: Transaccion[]) => {
        setMonto(txs.reduce((s, t) => s + t.monto, 0));
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user, espacio, categoriaId, tipo, periodo]);

  if (loading) return <Skeleton className="h-2 w-full" rounded="full" />;

  const pct = Math.min(100, (monto / meta) * 100);
  const isIngreso = tipo === 'ingreso';

  if (isIngreso) {
    const reached = monto >= meta;
    return (
      <div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={cn('h-full transition-all', reached ? 'bg-income' : 'bg-brand-500')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {formatCOP(monto)} de {formatCOP(meta)}
          </span>
          <span className={reached ? 'font-semibold text-income' : ''}>
            {reached ? '¡Meta alcanzada! 🎉' : `${(100 - pct).toFixed(0)}% por alcanzar`}
          </span>
        </div>
      </div>
    );
  }

  const over = monto > meta;
  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn('h-full transition-all', over ? 'bg-expense' : pct > 80 ? 'bg-amber-500' : 'bg-income')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {formatCOP(monto)} de {formatCOP(meta)}
        </span>
        <span className={over ? 'font-semibold text-expense' : ''}>
          {over ? `Excedido por ${formatCOP(monto - meta)}` : `${(100 - pct).toFixed(0)}% disponible`}
        </span>
      </div>
    </div>
  );
}

function NewBudgetRow({
  tipo,
  categorias,
  existing,
  defaultMes,
  onCancel,
  onCreated,
}: {
  tipo: TipoTransaccion;
  categorias: Categoria[];
  existing: string[];
  defaultMes: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const showToast = useUiStore((s) => s.showToast);
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [frecuencia, setFrecuencia] = useState<Frecuencia>('mensual');
  const [periodo, setPeriodo] = useState<string>(defaultMes);
  const [monto, setMonto] = useState('');
  const [saving, setSaving] = useState(false);

  const periodos = periodosDelMes(
    Number(defaultMes.slice(0, 4)),
    Number(defaultMes.slice(5, 7)) - 1,
  );

  const available = categorias.filter((c) => !existing.includes(c.id + ':' + periodo));

  const save = async () => {
    if (!user || !current || !categoriaId || !periodo) return;
    const num = parseThousands(monto);
    if (!num || num <= 0) return;
    setSaving(true);
    try {
      const [year, month] = periodo.split('-').map(Number);
      const quincena: Quincena | undefined = periodo.includes('-Q') ? (Number(periodo.slice(-1)) as Quincena) : undefined;
      const finalPeriodo =
        frecuencia === 'quincenal' && quincena
          ? buildPeriodoQuincenal(year, month - 1, quincena)
          : buildPeriodoMensual(year, month - 1);
      await createPresupuesto(user.uid, {
        categoriaId,
        espacio: current,
        tipo,
        frecuencia,
        periodo: finalPeriodo,
        monto: num,
      });
      onCreated();
    } catch {
      showToast('Error al crear', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card space-y-2">
      <select
        autoFocus
        value={categoriaId}
        onChange={(e) => setCategoriaId(e.target.value)}
        className="input"
      >
        <option value="">Selecciona categoría</option>
        {available.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <div>
        <label className="label">Frecuencia</label>
        <div className="grid grid-cols-2 gap-2">
          {(['mensual', 'quincenal'] as Frecuencia[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFrecuencia(f);
                if (f === 'mensual') {
                  setPeriodo(periodo.split('-Q')[0]);
                } else if (!periodo.includes('-Q')) {
                  setPeriodo(periodo + '-Q1');
                }
              }}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm capitalize transition-colors',
                frecuencia === f
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Período</label>
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="input">
          {periodos.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        value={monto}
        onChange={(e) => setMonto(formatThousands(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={`${tipo === 'ingreso' ? 'Meta' : 'Tope'} en COP`}
        className="input tabular-nums"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={!categoriaId || !monto || saving}
          className="btn-primary flex-1"
        >
          Crear
        </button>
      </div>
    </div>
  );
}
