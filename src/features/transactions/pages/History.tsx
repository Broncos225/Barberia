import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, Search, X } from 'lucide-react';
import { useSpaceStore } from '@/stores/space.store';
import { useTransactions } from '../hooks/useTransactions';
import { useCategorias } from '@/features/categories/hooks/useCategorias';
import { TransactionList } from '../components/TransactionList';
import { TransactionListSkeleton } from '@/components/Skeleton';
import { exportTransactionsToCSV } from '@/lib/csv';
import { useUiStore } from '@/stores/ui.store';
import type { MetodoPago, TipoTransaccion, Transaccion } from '@/types';
import { cn } from '@/lib/cn';

export function HistoryPage() {
  const navigate = useNavigate();
  const current = useSpaceStore((s) => s.current);
  const showToast = useUiStore((s) => s.showToast);
  const [tipo, setTipo] = useState<TipoTransaccion | 'all'>('all');
  const [categoriaId, setCategoriaId] = useState<string>('all');
  const [metodoPago, setMetodoPago] = useState<MetodoPago | 'all'>('all');
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(
    () => ({
      espacio: current!,
      tipo: tipo === 'all' ? undefined : tipo,
      categoriaId: categoriaId === 'all' ? undefined : categoriaId,
      metodoPago: metodoPago === 'all' ? undefined : metodoPago,
      desde: desde ? new Date(desde + 'T00:00:00') : undefined,
      hasta: hasta ? new Date(hasta + 'T23:59:59') : undefined,
    }),
    [current, tipo, categoriaId, metodoPago, desde, hasta],
  );

  const { items, loading } = useTransactions(filters);
  const { items: catsGasto } = useCategorias('gasto');
  const { items: catsIngreso } = useCategorias('ingreso');
  const categorias = tipo === 'ingreso' ? catsIngreso : tipo === 'gasto' ? catsGasto : [...catsGasto, ...catsIngreso];

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const filteredItems = useMemo<Transaccion[]>(() => {
    if (!debouncedSearch) return items;
    return items.filter((t) => {
      const haystack = `${t.categoriaNombre} ${t.nota ?? ''}`.toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [items, debouncedSearch]);

  const totalGastos = filteredItems.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0);
  const totalIngresos = filteredItems.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
  const activeFilters = [tipo !== 'all', categoriaId !== 'all', metodoPago !== 'all', !!desde, !!hasta].filter(Boolean).length;

  const onExport = () => {
    if (filteredItems.length === 0) {
      showToast('No hay transacciones para exportar', 'info');
      return;
    }
    exportTransactionsToCSV(filteredItems, categorias);
    showToast(`${filteredItems.length} transacciones exportadas`, 'success');
  };

  if (!current) return null;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historial</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              'flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm',
              activeFilters > 0
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
            )}
          >
            <Filter size={16} /> Filtros{activeFilters > 0 && ` (${activeFilters})`}
          </button>
          <button onClick={onExport} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en categoría o nota..."
          className="input pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {filtersOpen && (
        <div className="card space-y-3">
          <div>
            <label className="label">Tipo</label>
            <div className="flex gap-2">
              {(['all', 'gasto', 'ingreso'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTipo(t);
                    setCategoriaId('all');
                  }}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm capitalize',
                    tipo === t
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  )}
                >
                  {t === 'all' ? 'Todos' : t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="input"
            >
              <option value="all">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Método de pago</label>
            <div className="grid grid-cols-4 gap-2">
              {(['all', 'efectivo', 'tarjeta', 'transferencia'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-xs capitalize',
                    metodoPago === m
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  )}
                >
                  {m === 'all' ? 'Todos' : m}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Desde</label>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="input" />
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setTipo('all');
                setCategoriaId('all');
                setMetodoPago('all');
                setDesde('');
                setHasta('');
              }}
              className="flex w-full items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X size={14} /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {(filteredItems.length > 0 || activeFilters > 0 || debouncedSearch) && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="card text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Ingresos</p>
            <p className="font-semibold text-income">${totalIngresos.toLocaleString('es-CO')}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Gastos</p>
            <p className="font-semibold text-expense">${totalGastos.toLocaleString('es-CO')}</p>
          </div>
        </div>
      )}

      {debouncedSearch && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{debouncedSearch}"
        </p>
      )}

      {loading ? (
        <TransactionListSkeleton count={6} />
      ) : (
        <TransactionList
          items={filteredItems}
          onItemClick={(t) => navigate(`/${current}/transactions/${t.id}`)}
          emptyMessage={debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : undefined}
        />
      )}
    </div>
  );
}
