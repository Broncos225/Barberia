import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import { subscribePresupuestosByMes } from '../services/presupuestos.service';
import type { Presupuesto } from '@/types';

export function usePresupuestos(mesPrefix: string) {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const [items, setItems] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !current) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribePresupuestosByMes(user.uid, current, mesPrefix, (p) => {
      setItems(p);
      setLoading(false);
    });
    return () => unsub();
  }, [user, current, mesPrefix]);

  return { items, loading };
}
