import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import type { Espacio, UserProfile } from '@/types';
import { Briefcase, Scissors } from 'lucide-react';
import { cn } from '@/lib/cn';

export function SelectSpacePage() {
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const setCurrent = useSpaceStore((s) => s.setCurrent);
  const [selected, setSelected] = useState<Espacio | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initializing && !user) navigate('/login', { replace: true });
  }, [initializing, user, navigate]);

  const onConfirm = async () => {
    if (!user || !selected) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid, 'profile', 'main'), {
        defaultSpace: selected,
      });
      setCurrent(selected);
      navigate(`/${selected}`, { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const options: { value: Espacio; title: string; subtitle: string; Icon: typeof Briefcase }[] = [
    { value: 'personal', title: 'Personal', subtitle: 'Gastos e ingresos personales', Icon: Briefcase },
    { value: 'barberia', title: 'Barbería', subtitle: 'Negocio de barbería', Icon: Scissors },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-bold">Elige un espacio</h1>
        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">Podrás cambiar después</p>

        <div className="space-y-3">
          {options.map(({ value, title, subtitle, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                'card flex w-full items-center gap-4 text-left transition-all',
                selected === value
                  ? 'border-brand-500 ring-2 ring-brand-500/20 dark:ring-brand-400/30'
                  : 'hover:border-slate-300 dark:hover:border-slate-700',
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onConfirm}
          disabled={!selected || saving}
          className="btn-primary mt-6 w-full"
        >
          {saving ? 'Guardando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}

export async function loadDefaultSpace(uid: string): Promise<Espacio | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'));
  if (!snap.exists()) return null;
  return (snap.data() as UserProfile).defaultSpace;
}
