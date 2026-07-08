import { useEffect } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth.store';
import { useSpaceStore } from '@/stores/space.store';
import { buildSeedCategorias } from '@/lib/seed';
import type { UserProfile } from '@/types';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const profileRef = doc(db, 'users', u.uid, 'profile', 'main');
        const snap = await getDoc(profileRef);
        if (!snap.exists()) {
          const profile: Omit<UserProfile, 'createdAt'> = {
            uid: u.uid,
            displayName: u.displayName ?? u.email?.split('@')[0] ?? 'Usuario',
            email: u.email ?? '',
            defaultSpace: 'personal',
            driveConnected: false,
          };
          await setDoc(profileRef, { ...profile, createdAt: serverTimestamp() });
          const personalCats = buildSeedCategorias('personal').map((c) => ({
            ...c,
            id: crypto.randomUUID(),
          }));
          const barberiaCats = buildSeedCategorias('barberia').map((c) => ({
            ...c,
            id: crypto.randomUUID(),
          }));
          const batch = writeBatch(db);
          personalCats.forEach((c) => {
            const ref = doc(db, 'users', u.uid, 'categorias', c.id);
            batch.set(ref, c);
          });
          barberiaCats.forEach((c) => {
            const ref = doc(db, 'users', u.uid, 'categorias', c.id);
            batch.set(ref, c);
          });
          await batch.commit();
        }
      }
      setUser(u);
    });
    return () => unsub();
  }, [setUser]);

  const signOut = async () => {
    await fbSignOut(auth);
    useSpaceStore.getState().clear();
  };

  return { user, initializing, signOut };
}
