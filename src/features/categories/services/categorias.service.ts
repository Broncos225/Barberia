import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Categoria, Espacio, TipoTransaccion } from '@/types';

function categoriasCol(uid: string) {
  return collection(db, 'users', uid, 'categorias');
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export function subscribeCategorias(
  uid: string,
  espacio: Espacio,
  cb: (items: Categoria[]) => void,
  onError?: (e: Error) => void,
) {
  const constraints: QueryConstraint[] = [
    where('espacio', '==', espacio),
    orderBy('orden', 'asc'),
  ];
  const q = query(categoriasCol(uid), ...constraints);
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Categoria)),
    (err) => onError?.(err),
  );
}

export async function createCategoria(
  uid: string,
  data: Omit<Categoria, 'id'>,
): Promise<string> {
  const clean = stripUndefined(data as Record<string, unknown>);
  const ref = await addDoc(categoriasCol(uid), clean);
  return ref.id;
}

export async function updateCategoria(
  uid: string,
  id: string,
  data: Partial<Omit<Categoria, 'id'>>,
): Promise<void> {
  const clean = stripUndefined(data as Record<string, unknown>);
  await updateDoc(doc(db, 'users', uid, 'categorias', id), clean);
}

export async function deleteCategoria(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'categorias', id));
}

export function nextOrden(items: Categoria[], espacio: Espacio, tipo: TipoTransaccion): number {
  const filtered = items.filter((c) => c.espacio === espacio && c.tipo === tipo);
  if (filtered.length === 0) return 0;
  return Math.max(...filtered.map((c) => c.orden)) + 1;
}
