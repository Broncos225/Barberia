import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  endBefore,
  Timestamp,
  type QueryConstraint,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaccion, Espacio, TipoTransaccion, MetodoPago } from '@/types';

function transactionsCol(uid: string) {
  return collection(db, 'users', uid, 'transactions');
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export function subscribeTransaction(
  uid: string,
  id: string,
  cb: (item: Transaccion | null) => void,
  onError?: (e: Error) => void,
) {
  const ref = doc(db, 'users', uid, 'transactions', id);
  return onSnapshot(
    ref,
    (snap) =>
      cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Transaccion) : null),
    (err) => onError?.(err),
  );
}

export interface TransactionFilters {
  espacio: Espacio;
  tipo?: TipoTransaccion;
  categoriaId?: string;
  metodoPago?: MetodoPago;
  desde?: Date;
  hasta?: Date;
  limitN?: number;
}

export function subscribeTransactions(
  uid: string,
  filters: TransactionFilters,
  cb: (items: Transaccion[]) => void,
  onError?: (e: Error) => void,
) {
  const constraints: QueryConstraint[] = [
    where('espacio', '==', filters.espacio),
    orderBy('fecha', 'desc'),
  ];
  if (filters.tipo) constraints.push(where('tipo', '==', filters.tipo));
  if (filters.categoriaId) constraints.push(where('categoriaId', '==', filters.categoriaId));
  if (filters.metodoPago) constraints.push(where('metodoPago', '==', filters.metodoPago));
  if (filters.desde) constraints.push(where('fecha', '>=', Timestamp.fromDate(filters.desde)));
  if (filters.hasta) constraints.push(where('fecha', '<=', Timestamp.fromDate(filters.hasta)));
  if (filters.limitN) constraints.push(limit(filters.limitN));

  const q = query(transactionsCol(uid), ...constraints);
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaccion)),
    (err) => onError?.(err),
  );
}

export async function createTransaction(
  uid: string,
  data: Omit<Transaccion, 'id' | 'createdAt' | 'updatedAt' | 'driveSyncedAt'>,
): Promise<string> {
  const now = Timestamp.now();
  const clean = stripUndefined(data as Record<string, unknown>);
  const ref = await addDoc(transactionsCol(uid), {
    ...clean,
    driveSyncedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function deleteTransactionWithReceipt(uid: string, id: string): Promise<void> {
  const { deleteReceipt } = await import('@/features/receipts/services/receipts.service');
  const { deleteDoc, doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid, 'transactions', id));
  const data = snap.data() as { reciboId?: string } | undefined;
  if (data?.reciboId) {
    await deleteReceipt(uid, data.reciboId).catch(() => {});
  }
  await deleteDoc(doc(db, 'users', uid, 'transactions', id));
}

export async function updateTransaction(
  uid: string,
  id: string,
  data: Partial<Omit<Transaccion, 'id' | 'createdAt' | 'driveSyncedAt'>>,
): Promise<void> {
  const clean = stripUndefined(data as Record<string, unknown>);
  await updateDoc(doc(db, 'users', uid, 'transactions', id), {
    ...clean,
    driveSyncedAt: null,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTransaction(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'transactions', id));
}

export { startAfter, endBefore };
export type { DocumentSnapshot };
