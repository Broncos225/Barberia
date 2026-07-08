import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useUserProfile, getDisplayName } from '@/features/auth/hooks/useUserProfile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUiStore } from '@/stores/ui.store';
import { applyTheme, useThemeStore, type Theme } from '@/stores/theme.store';
import { formatDate } from '@/lib/format';
import { Cloud, LogOut, Edit2, Check, X, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/cn';

const OAUTH_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID);

const THEME_OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const showToast = useUiStore((s) => s.showToast);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const startEditName = () => {
    setName(profile?.displayName ?? getDisplayName(user));
    setEditingName(true);
  };

  const saveName = async () => {
    if (!user || !name.trim()) return;
    setSavingName(true);
    try {
      const trimmed = name.trim();
      await Promise.all([
        updateDoc(doc(db, 'users', user.uid, 'profile', 'main'), { displayName: trimmed }),
        updateProfile(auth.currentUser!, { displayName: trimmed }).catch(() => {}),
      ]);
      showToast('Nombre actualizado', 'success');
      setEditingName(false);
    } catch {
      showToast('Error al actualizar', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const displayName = profile?.displayName ?? getDisplayName(user);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>

      <div className="card space-y-3">
        <h2 className="font-semibold">Perfil</h2>
        <div className="text-sm">
          <div className="text-slate-500 dark:text-slate-400">Email</div>
          <div className="mb-3">{user?.email}</div>

          <div className="text-slate-500 dark:text-slate-400">Nombre</div>
          {editingName ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                className="input flex-1"
                placeholder="Tu nombre"
              />
              <button
                onClick={saveName}
                disabled={!name.trim() || savingName}
                className="rounded-lg p-2 text-income hover:bg-income-light disabled:opacity-50"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium">{displayName}</span>
              <button
                onClick={startEditName}
                className="flex items-center gap-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}

          {profile?.createdAt && (
            <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">Miembro desde {formatDate(profile.createdAt.toDate())}</div>
          )}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Apariencia</h2>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs transition-colors',
                theme === value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600',
              )}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {OAUTH_ENABLED && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Google Drive</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Respaldo automático de tus datos</p>
            </div>
            <Cloud size={24} className={profile?.driveConnected ? 'text-income' : 'text-slate-300'} />
          </div>
          {profile?.driveConnected ? (
            <div className="space-y-2">
              <p className="text-sm text-income">Conectado</p>
              {profile.lastDriveSyncAt && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Última sync: {formatDate(profile.lastDriveSyncAt.toDate())}
                </p>
              )}
              <button className="btn-secondary w-full">Sincronizar ahora</button>
              <button className="btn-danger w-full">Desconectar</button>
            </div>
          ) : (
            <button className="btn-primary w-full">Conectar Drive</button>
          )}
        </div>
      )}

      <button onClick={handleLogout} className="btn-secondary w-full">
        <LogOut size={18} /> Cerrar sesión
      </button>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">v0.1 · Hecho con Firebase + React</p>
    </div>
  );
}
