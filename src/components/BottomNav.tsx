import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Home, List, BarChart3, MoreHorizontal, Wallet } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useState } from 'react';
import { useSpaceStore } from '@/stores/space.store';
import { Tags, Target, LogOut, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface Tab {
  to: string;
  label: string;
  Icon: typeof Home;
  end?: boolean;
}

export function BottomNav() {
  const { espacio } = useParams<{ espacio: string }>();
  const navigate = useNavigate();
  const current = useSpaceStore((s) => s.current);
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!espacio && !current) return null;
  const base = `/${current ?? espacio}`;

  const tabs: Tab[] = [
    { to: base, label: 'Inicio', Icon: Home, end: true },
    { to: `${base}/history`, label: 'Historial', Icon: List },
    { to: `${base}/reports`, label: 'Reportes', Icon: BarChart3 },
  ];

  const isActive = (to: string, end?: boolean) => {
    const path = location.pathname;
    if (end) return path === to;
    return path.startsWith(to);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-2xl items-center justify-around">
          {tabs.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors',
                isActive(to, end) ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors',
              moreOpen || isActive(`${base}/categories`) || isActive(`${base}/budgets`)
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 dark:text-slate-400',
            )}
          >
            <MoreHorizontal size={20} />
            <span>Más</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={() => setMoreOpen(false)}>
          <div
            className="w-full rounded-t-2xl bg-white p-4 pb-6 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Más opciones</h3>
              <button onClick={() => setMoreOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1">
              <MoreItem
                Icon={Tags}
                label="Categorías"
                description="Personaliza las categorías de gastos e ingresos"
                onClick={() => {
                  setMoreOpen(false);
                  navigate(`${base}/categories`);
                }}
              />
              <MoreItem
                Icon={Target}
                label="Presupuestos"
                description="Define topes mensuales por categoría"
                onClick={() => {
                  setMoreOpen(false);
                  navigate(`${base}/budgets`);
                }}
              />
              <MoreItem
                Icon={Wallet}
                label="Mi cuenta"
                description="Perfil, Google Drive y sesión"
                onClick={() => {
                  setMoreOpen(false);
                  navigate('/settings');
                }}
              />
              <div className="my-1 border-t border-slate-100" />
              <MoreItem
                Icon={LogOut}
                label="Cerrar sesión"
                description="Salir de la cuenta"
                onClick={async () => {
                  setMoreOpen(false);
                  await signOut();
                  navigate('/login');
                }}
                danger
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MoreItem({
  Icon,
  label,
  description,
  onClick,
  danger,
}: {
  Icon: typeof Home;
  label: string;
  description: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
        danger && 'text-expense',
      )}
    >
      <Icon size={20} />
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{description}</div>
      </div>
    </button>
  );
}
