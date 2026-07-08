import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import {
  subscribeTransactions,
  subscribeTransaction,
  type TransactionFilters,
} from '../services/transactions.service';
import type { Transaccion } from '@/types';

export function useTransactions(filters?: Partial<TransactionFilters>) {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const [items, setItems] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !current) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const f: TransactionFilters = { espacio: current, ...filters };
    const unsub = subscribeTransactions(
      user.uid,
      f,
      (txs) => {
        setItems(txs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    current,
    filters?.espacio,
    filters?.tipo,
    filters?.categoriaId,
    filters?.metodoPago,
    filters?.desde?.getTime(),
    filters?.hasta?.getTime(),
    filters?.limitN,
  ]);

  return { items, loading, error };
}

export interface MonthSummary {
  ingresos: number;
  gastos: number;
  balance: number;
  count: number;
}

export function useMonthSummary(year: number, month: number): MonthSummary & { loading: boolean } {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const [summary, setSummary] = useState<MonthSummary>({ ingresos: 0, gastos: 0, balance: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !current) {
      setSummary({ ingresos: 0, gastos: 0, balance: 0, count: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    const desde = new Date(year, month, 1);
    const hasta = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const unsub = subscribeTransactions(
      user.uid,
      { espacio: current, desde, hasta },
      (txs) => {
        const ingresos = txs.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
        const gastos = txs.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0);
        setSummary({ ingresos, gastos, balance: ingresos - gastos, count: txs.length });
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user, current, year, month]);

  return { ...summary, loading };
}

export interface MonthComparison extends MonthSummary {
  ingresosDelta: number;
  gastosDelta: number;
  balanceDelta: number;
  loading: boolean;
}

export function useMonthComparison(year: number, month: number): MonthComparison {
  const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const current = useMonthSummary(year, month);
  const previous = useMonthSummary(prev.year, prev.month);

  const pct = (curr: number, prev: number): number => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / prev) * 100;
  };

  return {
    ingresos: current.ingresos,
    gastos: current.gastos,
    balance: current.balance,
    count: current.count,
    ingresosDelta: pct(current.ingresos, previous.ingresos),
    gastosDelta: pct(current.gastos, previous.gastos),
    balanceDelta: pct(current.balance, previous.balance),
    loading: current.loading || previous.loading,
  };
}

export function useTransaction(id: string | undefined) {
  const { user } = useAuth();
  const [item, setItem] = useState<Transaccion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      setItem(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeTransaction(user.uid, id, (tx) => {
      setItem(tx);
      setLoading(false);
    });
    return () => unsub();
  }, [user, id]);

  return { item, loading };
}
