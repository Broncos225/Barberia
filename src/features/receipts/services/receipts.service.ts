import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Receipt {
  id: string;
  base64: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt?: { toDate: () => Date } | Date;
}

function receiptsCol(uid: string) {
  return collection(db, 'users', uid, 'receipts');
}

export async function createReceipt(
  uid: string,
  data: Omit<Receipt, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(receiptsCol(uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteReceipt(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'receipts', id));
}

export function subscribeReceipt(
  uid: string,
  id: string,
  cb: (receipt: Receipt | null) => void,
  onError?: (e: Error) => void,
) {
  const ref = doc(db, 'users', uid, 'receipts', id);
  return onSnapshot(
    ref,
    (snap) => cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Receipt) : null),
    (err) => onError?.(err),
  );
}