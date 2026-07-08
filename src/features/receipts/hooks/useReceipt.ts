import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { subscribeReceipt, type Receipt } from '../services/receipts.service';

export function useReceipt(id: string | undefined) {
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      setReceipt(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeReceipt(user.uid, id, (r) => {
      setReceipt(r);
      setLoading(false);
    });
    return () => unsub();
  }, [user, id]);

  return { receipt, loading };
}