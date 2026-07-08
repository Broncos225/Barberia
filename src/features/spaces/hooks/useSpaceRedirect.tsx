import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import type { Espacio, UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';

export function SpaceRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    const stored = useSpaceStore.getState().current;
    if (stored) {
      navigate(`/${stored}`, { replace: true });
      return;
    }
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'profile', 'main'));
      if (snap.exists()) {
        const espacio = (snap.data() as UserProfile).defaultSpace as Espacio;
        useSpaceStore.getState().setCurrent(espacio);
        navigate(`/${espacio}`, { replace: true });
      } else {
        navigate('/select-space', { replace: true });
      }
    })();
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  );
}

export function SpaceParam() {
  const { espacio } = useParams<{ espacio: string }>();
  const navigate = useNavigate();
  const setCurrent = useSpaceStore((s) => s.setCurrent);

  useEffect(() => {
    if (espacio === 'personal' || espacio === 'barberia') {
      setCurrent(espacio);
    } else {
      navigate('/', { replace: true });
    }
  }, [espacio, setCurrent, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  );
}
