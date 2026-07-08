import type { Timestamp } from 'firebase/firestore';

export type Espacio = 'personal' | 'barberia';
export type TipoTransaccion = 'ingreso' | 'gasto';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Transaccion {
  id: string;
  espacio: Espacio;
  tipo: TipoTransaccion;
  monto: number;
  categoriaId?: string;
  categoriaNombre: string;
  categoriaIcono?: string;
  metodoPago: MetodoPago;
  fecha: Timestamp;
  nota?: string;
  reciboId?: string;
  driveSyncedAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Categoria {
  id: string;
  nombre: string;
  espacio: Espacio;
  tipo: TipoTransaccion;
  icono?: string;
  color?: string;
  orden: number;
}

export type Frecuencia = 'quincenal' | 'mensual';
export type Quincena = 1 | 2;

export interface Presupuesto {
  id: string;
  categoriaId: string;
  espacio: Espacio;
  tipo: TipoTransaccion;
  frecuencia: Frecuencia;
  periodo: string;
  monto: number;
}

export function buildPeriodoMensual(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function buildPeriodoQuincenal(year: number, month: number, q: Quincena): string {
  return `${buildPeriodoMensual(year, month)}-Q${q}`;
}

export function parsePeriodo(periodo: string): {
  year: number;
  month: number;
  quincena?: Quincena;
  start: Date;
  end: Date;
  label: string;
} {
  const mensual = /^(\d{4})-(\d{2})$/;
  const quincenal = /^(\d{4})-(\d{2})-Q([12])$/;
  let year = 0, month = 0, q: Quincena | undefined;
  const m1 = periodo.match(mensual);
  const m2 = periodo.match(quincenal);
  if (m1) {
    year = Number(m1[1]);
    month = Number(m1[2]) - 1;
  } else if (m2) {
    year = Number(m2[1]);
    month = Number(m2[2]) - 1;
    q = Number(m2[3]) as Quincena;
  } else {
    throw new Error(`Periodo inválido: ${periodo}`);
  }
  let start: Date, end: Date, label: string;
  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  if (q === 1) {
    start = new Date(year, month, 1);
    end = new Date(year, month, 15, 23, 59, 59, 999);
    label = `${monthLabel} · 1ra quincena`;
  } else if (q === 2) {
    start = new Date(year, month, 16);
    end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    label = `${monthLabel} · 2da quincena`;
  } else {
    start = new Date(year, month, 1);
    end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    label = monthLabel;
  }
  return { year, month, quincena: q, start, end, label };
}

export function periodosDelMes(year: number, month: number): { value: string; label: string }[] {
  return [
    { value: buildPeriodoMensual(year, month), label: 'Mensual' },
    { value: buildPeriodoQuincenal(year, month, 1), label: '1ra quincena (1-15)' },
    { value: buildPeriodoQuincenal(year, month, 2), label: '2da quincena (16-fin)' },
  ];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  defaultSpace: Espacio;
  driveConnected: boolean;
  driveSpreadsheetId?: string;
  lastDriveSyncAt?: Timestamp | null;
  createdAt: Timestamp;
}
