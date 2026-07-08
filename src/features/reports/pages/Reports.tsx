import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useSpaceStore } from '@/stores/space.store';
import { subscribeTransactions } from '@/features/transactions/services/transactions.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useState as useReactState } from 'react';
import type { Transaccion } from '@/types';
import { formatCOP, formatMonth } from '@/lib/format';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export function ReportsPage() {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [allTx, setAllTx] = useReactState<Transaccion[]>([]);

  useEffect(() => {
    if (!user || !current) {
      setAllTx([]);
      return;
    }
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);
    const unsub = subscribeTransactions(
      user.uid,
      { espacio: current, desde: start, hasta: end },
      (txs) => setAllTx(txs),
    );
    return () => unsub();
  }, [user, current, year]);

  const monthData = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const txs = allTx.filter((t) => {
      const d = t.fecha.toDate();
      return d.getFullYear() === y && d.getMonth() === m - 1;
    });
    const porCategoria = new Map<string, number>();
    txs
      .filter((t) => t.tipo === 'gasto')
      .forEach((t) => {
        porCategoria.set(t.categoriaNombre, (porCategoria.get(t.categoriaNombre) ?? 0) + t.monto);
      });
    return Array.from(porCategoria.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allTx, month]);

  const monthlyData = useMemo(() => {
    const months: { mes: string; ingresos: number; gastos: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const txs = allTx.filter((t) => {
        const d = t.fecha.toDate();
        return d.getFullYear() === year && d.getMonth() === m;
      });
      const ingresos = txs.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
      const gastos = txs.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0);
      months.push({
        mes: new Date(year, m, 1).toLocaleDateString('es-CO', { month: 'short' }),
        ingresos,
        gastos,
      });
    }
    return months;
  }, [allTx, year]);

  const trendData = useMemo(() => {
    const byMonth: Record<string, { ingresos: number; gastos: number }> = {};
    allTx.forEach((t) => {
      const d = t.fecha.toDate();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = { ingresos: 0, gastos: 0 };
      if (t.tipo === 'ingreso') byMonth[key].ingresos += t.monto;
      else byMonth[key].gastos += t.monto;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        mes: formatMonth(key),
        Balance: v.ingresos - v.gastos,
      }));
  }, [allTx]);

  if (!current) return null;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input max-w-[120px]"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Gastos por categoría</h2>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input max-w-[160px]"
          />
        </div>
        {monthData.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sin gastos en este mes</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={monthData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {monthData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCOP(v)} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h2 className="mb-2 font-semibold">Ingresos vs Gastos por mes</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} stroke="#94a3b8" />
            <Tooltip formatter={(v: number) => formatCOP(v)} />
            <Legend />
            <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="mb-2 font-semibold">Tendencia de balance</h2>
        {trendData.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => formatCOP(v)} />
              <Line type="monotone" dataKey="Balance" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        {allTx.length} transacciones en {year}
      </p>
    </div>
  );
}
