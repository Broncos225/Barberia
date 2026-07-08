import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getDisplayName } from '@/features/auth/hooks/useUserProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMonthComparison, useTransactions } from '../hooks/useTransactions';
import { TransactionList } from '../components/TransactionList';
import { BalanceCardSkeleton, TransactionListSkeleton } from '@/components/Skeleton';
import { DeltaBadge } from '@/components/DeltaBadge';
import { QuickFilters, getDateRange, type QuickFilter } from '../components/QuickFilters';
import { DashboardBudgetWidgets } from '@/features/budgets/components/DashboardBudgetWidgets';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCOP } from '@/lib/format';
import { useSpaceStore } from '@/stores/space.store';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const now = new Date();
  const comparison = useMonthComparison(now.getFullYear(), now.getMonth());
  const [filter, setFilter] = useState<QuickFilter>('month');
  const range = getDateRange(filter);
  const { items: recent, loading } = useTransactions({
    limitN: 50,
    ...range,
  });
  const [refreshing, setRefreshing] = useState(false);

  const greeting = getDisplayName(user);
  const spaceName = current === 'personal' ? 'Personal' : 'Barbería';

  const goNew = () => {
    if (current) navigate(`/${current}/transactions/new`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  };

  usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Hola, {greeting}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{spaceName}</p>
      </div>

      <div className="card">
        {comparison.loading ? (
          <BalanceCardSkeleton />
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">Balance del mes</p>
              <DeltaBadge delta={comparison.balanceDelta} label="vs mes anterior" />
            </div>
            <p
              className={`mt-1 text-3xl font-bold tabular-nums ${
                comparison.balance >= 0 ? 'text-income' : 'text-expense'
              }`}
            >
              {formatCOP(comparison.balance)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-income" />
                <span className="text-slate-600 dark:text-slate-400">Ingresos</span>
                <span className="ml-auto font-semibold tabular-nums text-income">
                  {formatCOP(comparison.ingresos)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-expense" />
                <span className="text-slate-600 dark:text-slate-400">Gastos</span>
                <span className="ml-auto font-semibold tabular-nums text-expense">
                  {formatCOP(comparison.gastos)}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-400 dark:text-slate-500">{comparison.count} transacciones este mes</p>
              <div className="flex gap-2 text-xs">
                <DeltaBadge delta={comparison.ingresosDelta} />
                <DeltaBadge delta={comparison.gastosDelta} inverse />
              </div>
            </div>
          </>
        )}
      </div>

      <DashboardBudgetWidgets />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Transacciones</h2>
          <button
            onClick={() => current && navigate(`/${current}/history`)}
            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            Ver todo
          </button>
        </div>
        <QuickFilters current={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <TransactionListSkeleton count={5} />
      ) : (
        <TransactionList
          items={recent.slice(0, 10)}
          onItemClick={(t) => current && navigate(`/${current}/transactions/${t.id}`)}
          emptyMessage="Aún no hay transacciones en este período. Toca + para empezar"
        />
      )}

      {refreshing && (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-20 flex justify-center">
          <div className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg">
            <RefreshCw size={12} className="mr-1 inline animate-spin" /> Actualizando...
          </div>
        </div>
      )}

      <button
        onClick={goNew}
        className="fixed bottom-20 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Nueva transacción"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}