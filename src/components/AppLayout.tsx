import { useNavigate } from 'react-router-dom';
import { useSpaceStore } from '@/stores/space.store';
import type { Espacio } from '@/types';
import { Briefcase, Scissors, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { BottomNav } from './BottomNav';

interface Props {
  current: Espacio;
  children: React.ReactNode;
}

export function AppLayout({ current, children }: Props) {
  const navigate = useNavigate();
  const setCurrent = useSpaceStore((s) => s.setCurrent);
  const [menuOpen, setMenuOpen] = useState(false);

  const switchTo = (esp: Espacio) => {
    setCurrent(esp);
    navigate(`/${esp}`);
    setMenuOpen(false);
  };

  const Icon = current === 'personal' ? Briefcase : Scissors;
  const title = current === 'personal' ? 'Personal' : 'Barbería';

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Icon size={20} className="text-brand-600 dark:text-brand-400" />
            <span className="font-semibold">{title}</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
        </div>

        {menuOpen && (
          <div className="mx-auto max-w-2xl border-t border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => switchTo('personal')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800',
                current === 'personal' && 'bg-slate-100 dark:bg-slate-800',
              )}
            >
              <Briefcase size={18} />
              <span>Personal</span>
            </button>
            <button
              onClick={() => switchTo('barberia')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800',
                current === 'barberia' && 'bg-slate-100 dark:bg-slate-800',
              )}
            >
              <Scissors size={18} />
              <span>Barbería</span>
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>

      <BottomNav />
    </div>
  );
}
