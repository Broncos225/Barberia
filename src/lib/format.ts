const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const intFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export function formatCOP(value: number): string {
  return copFormatter.format(value);
}

export function formatThousands(value: string | number): string {
  if (value === '' || value === null || value === undefined) return '';
  const cleaned = String(value).replace(/[^\d]/g, '');
  if (!cleaned) return '';
  return intFormatter.format(Number(cleaned));
}

export function parseThousands(value: string): number {
  const cleaned = String(value).replace(/[^\d]/g, '');
  return Number(cleaned || 0);
}

export function formatDate(date: Date | string | { toDate?: () => Date }): string {
  const d = typeof date === 'object' && 'toDate' in date && date.toDate ? date.toDate() : new Date(date as string | Date);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatMonth(mes: string): string {
  const [y, m] = mes.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date);
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
