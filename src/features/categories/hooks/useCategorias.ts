import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import { subscribeCategorias } from '../services/categorias.service';
import type { Categoria, Espacio, TipoTransaccion } from '@/types';

export function useCategorias(tipo?: TipoTransaccion) {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const [items, setItems] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !current) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeCategorias(
      user.uid,
      current,
      (cats) => {
        const sorted = [...cats].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        setItems(tipo ? sorted.filter((c) => c.tipo === tipo) : sorted);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user, current, tipo]);

  return { items, loading, error };
}

export function useCategoriaMap(espacio?: Espacio) {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const esp = espacio ?? current;
  const [map, setMap] = useState<Map<string, Categoria>>(new Map());

  useEffect(() => {
    if (!user || !esp) {
      setMap(new Map());
      return;
    }
    const unsub = subscribeCategorias(user.uid, esp, (cats) => {
      setMap(new Map(cats.map((c) => [c.id, c])));
    });
    return () => unsub();
  }, [user, esp]);

  return map;
}
