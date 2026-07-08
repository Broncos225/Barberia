import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import { usePresupuestos } from '../hooks/usePresupuestos';
import { useCategorias } from '@/features/categories/hooks/useCategorias';
import { subscribeTransactions } from '@/features/transactions/services/transactions.service';
import { useEffect, useState } from 'react';
import { buildPeriodoMensual, parsePeriodo } from '@/types';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatCOP } from '@/lib/format';
import { cn } from '@/lib/cn';

export function DashboardBudgetWidgets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const mes = buildPeriodoMensual(new Date().getFullYear(), new Date().getMonth());
  const { items: presupuestos, loading } = usePresupuestos(mes);
  const { items: catsGasto } = useCategorias('gasto');
  const { items: catsIngreso } = useCategorias('ingreso');
  const [progress, setProgress] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!user || !current || presupuestos.length === 0) {
      setProgress(new Map());
      return;
    }
    const { start, end } = parsePeriodo(mes);
    const unsubs = presupuestos.map((p) =>
      subscribeTransactions(
        user.uid,
        { espacio: current, desde: start, hasta: end, tipo: p.tipo, categoriaId: p.categoriaId },
        (txs) => {
          const sum = txs.reduce((s, t) => s + t.monto, 0);
          setProgress((prev) => {
            const next = new Map(prev);
            next.set(p.id, sum);
            return next;
          });
        },
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [user, current, presupuestos, mes]);

  if (loading) return null;
  if (presupuestos.length === 0) return null;

  const visibles = presupuestos
    .map((p) => {
      const cats = p.tipo === 'gasto' ? catsGasto : catsIngreso;
      const cat = cats.find((c) => c.id === p.categoriaId);
      const monto = progress.get(p.id) ?? 0;
      return { p, cat, monto };
    })
    .filter((x) => x.cat)
    .sort((a, b) => {
      const pctA = a.monto / a.p.monto;
      const pctB = b.monto / b.p.monto;
      return pctB - pctA;
    })
    .slice(0, 3);

  if (visibles.length === 0) return null;

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Presupuestos del mes</h2>
        <button
          onClick={() => current && navigate(`/${current}/budgets`)}
          className="flex items-center text-xs text-brand-600 hover:underline dark:text-brand-400"
        >
          Ver todos <ChevronRight size={14} />
        </button>
      </div>
      <div className="space-y-3">
        {visibles.map(({ p, cat, monto }) => {
          if (!cat) return null;
          const pct = Math.min(100, (monto / p.monto) * 100);
          const isIngreso = p.tipo === 'ingreso';
          const reached = isIngreso && monto >= p.monto;
          const over = !isIngreso && monto > p.monto;
          const Icon = isIngreso ? TrendingUp : TrendingDown;
          return (
            <button
              key={p.id}
              onClick={() => current && navigate(`/${current}/budgets`)}
              className="block w-full text-left"
            >
              <div className="mb-1 flex items-center gap-2">
                <CategoryIcon nombre={cat.nombre} icono={cat.icono} colorKey={cat.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{cat.nombre}</p>
                </div>
                <Icon
                  size={12}
                  className={isIngreso ? 'text-income' : 'text-expense'}
                />
                <span className="text-xs font-semibold tabular-nums">
                  {formatCOP(monto)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn(
                    'h-full transition-all',
                    reached
                      ? 'bg-income'
                      : over
                        ? 'bg-expense'
                        : pct > 80
                          ? 'bg-amber-500'
                          : isIngreso
                            ? 'bg-brand-500'
                            : 'bg-income',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-0.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{formatCOP(p.monto)}</span>
                <span className={over ? 'font-semibold text-expense' : ''}>
                  {over
                    ? `Excedido ${formatCOP(monto - p.monto)}`
                    : isIngreso
                      ? pct >= 100
                        ? '¡Meta lograda!'
                        : `${(100 - pct).toFixed(0)}% por completar`
                      : `${(100 - pct).toFixed(0)}% disponible`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}