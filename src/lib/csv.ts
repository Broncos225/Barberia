import Papa from 'papaparse';
import type { Categoria, Transaccion } from '@/types';
import { formatLocalDate } from './format';

const HEADERS = [
  'Fecha',
  'Tipo',
  'Monto',
  'Categoría',
  'Método de pago',
  'Espacio',
  'Nota',
  'Creado',
] as const;

export function exportTransactionsToCSV(items: Transaccion[], _categorias: Categoria[]): void {
  const rows = items.map((t) => ({
    Fecha: formatLocalDate(t.fecha.toDate()),
    Tipo: t.tipo,
    Monto: t.monto,
    Categoría: t.categoriaNombre,
    'Método de pago': t.metodoPago,
    Espacio: t.espacio,
    Nota: t.nota ?? '',
    Creado: t.createdAt.toDate().toISOString(),
  }));

  const csv = Papa.unparse({ fields: [...HEADERS], data: rows.map((r) => HEADERS.map((h) => r[h as keyof typeof r])) });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = formatLocalDate();
  a.href = url;
  a.download = `transacciones-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
