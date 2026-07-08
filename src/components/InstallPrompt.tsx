import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useUiStore } from '@/stores/ui.store';

export function InstallPrompt() {
  const { show, installed, prompt, dismiss } = useInstallPrompt();
  const showToast = useUiStore((s) => s.showToast);

  if (!show || installed) return null;

  const onInstall = async () => {
    const accepted = await prompt();
    if (accepted) {
      showToast('App instalada', 'success');
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-3 top-2 z-40 flex justify-center sm:top-4">
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Instala Control de Gastos</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Acceso rápido desde tu pantalla de inicio, sin navegador.
          </p>
          <div className="mt-2 flex gap-2">
            <button onClick={onInstall} className="btn-primary px-3 py-1.5 text-xs">
              Instalar
            </button>
            <button onClick={() => dismiss(true)} className="btn-secondary px-3 py-1.5 text-xs">
              Ahora no
            </button>
          </div>
        </div>
        <button
          onClick={() => dismiss(true)}
          className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}