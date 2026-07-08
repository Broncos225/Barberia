import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Espacio, Presupuesto, TipoTransaccion, Frecuencia } from '@/types';

function presupuestosCol(uid: string) {
  return collection(db, 'users', uid, 'presupuestos');
}

export function subscribePresupuestosByMes(
  uid: string,
  espacio: Espacio,
  mesPrefix: string,
  cb: (items: Presupuesto[]) => void,
  onError?: (e: Error) => void,
) {
  const constraints: QueryConstraint[] = [
    where('espacio', '==', espacio),
    where('periodo', '>=', mesPrefix),
    where('periodo', '<', mesPrefix + '\uf8ff'),
  ];
  const q = query(presupuestosCol(uid), ...constraints);
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Presupuesto)),
    (err) => onError?.(err),
  );
}

export interface CreatePresupuestoInput {
  categoriaId: string;
  espacio: Espacio;
  tipo: TipoTransaccion;
  frecuencia: Frecuencia;
  periodo: string;
  monto: number;
}

export async function createPresupuesto(
  uid: string,
  data: CreatePresupuestoInput,
): Promise<string> {
  const ref = await addDoc(presupuestosCol(uid), data);
  return ref.id;
}

export async function updatePresupuesto(
  uid: string,
  id: string,
  data: Partial<Omit<Presupuesto, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'presupuestos', id), data);
}

export async function deletePresupuesto(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'presupuestos', id));
}
