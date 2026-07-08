import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Wand2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSpaceStore } from '@/stores/space.store';
import { useCategorias } from '../hooks/useCategorias';
import { createCategoria, deleteCategoria, nextOrden, updateCategoria } from '../services/categorias.service';
import { useUiStore } from '@/stores/ui.store';
import { confirm as confirmDialog } from '@/stores/confirm.store';
import { buildSeedCategorias } from '@/lib/seed';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Skeleton } from '@/components/Skeleton';
import { useIsDark } from '@/hooks/useIsDark';
import { COLOR_CHOICES, COLOR_MAP, DEFAULT_COLOR_KEY, ICON_CHOICES, getCategoryIcon } from '@/lib/category-style';
import type { Categoria, TipoTransaccion } from '@/types';
import { cn } from '@/lib/cn';

export function CategoriesPage() {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const { items, loading, error } = useCategorias();
  const showToast = useUiStore((s) => s.showToast);
  const [seeding, setSeeding] = useState(false);

  const gastos = items.filter((c) => c.tipo === 'gasto');
  const ingresos = items.filter((c) => c.tipo === 'ingreso');
  const isEmpty = items.length === 0;

  const seedDefaults = async () => {
    if (!user || !current) return;
    if (items.length > 0) {
      const ok = await confirmDialog({
        title: '¿Cargar categorías predeterminadas?',
        message: 'Ya tienes categorías. Las predeterminadas se agregarán a tu lista actual.',
        confirmText: 'Cargar',
      });
      if (!ok) return;
    }
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      const seeds = buildSeedCategorias(current);
      seeds.forEach((c) => {
        const id = crypto.randomUUID();
        const ref = doc(db, 'users', user.uid, 'categorias', id);
        batch.set(ref, { ...c, id });
      });
      await batch.commit();
      showToast('Categorías predeterminadas agregadas', 'success');
    } catch (err) {
      showToast('Error al cargar', 'error');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
        <div className="card space-y-2 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2">
              <Skeleton className="h-7 w-7" rounded="full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categorías</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Personaliza las categorías para {current === 'personal' ? 'Personal' : 'Barbería'}
      </p>

      {error && (
        <div className="card border-expense/30 bg-expense-light text-sm text-expense dark:bg-expense-dark dark:text-red-300">
          <p className="font-semibold">Error al cargar categorías</p>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{error.message}</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Probablemente falta desplegar los índices de Firestore. Corré:{' '}
            <code className="rounded bg-white px-1 py-0.5 text-xs dark:bg-slate-800">firebase deploy --only firestore:indexes</code>
          </p>
        </div>
      )}

      {isEmpty && !error && (
        <div className="card border-brand-200 bg-brand-50/50 text-center dark:border-brand-800 dark:bg-brand-950/50">
          <Wand2 size={28} className="mx-auto mb-2 text-brand-600 dark:text-brand-400" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No tienes categorías</p>
          <p className="mb-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
            Carga un set predeterminado o crea las tuyas desde abajo
          </p>
          <button
            onClick={seedDefaults}
            disabled={seeding}
            className="btn-primary"
          >
            <Wand2 size={16} />
            {seeding ? 'Cargando...' : 'Cargar categorías predeterminadas'}
          </button>
        </div>
      )}

      {!isEmpty && (
        <button
          onClick={seedDefaults}
          disabled={seeding}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
        >
          <Wand2 size={12} />
          {seeding ? 'Cargando...' : 'Agregar predeterminadas'}
        </button>
      )}

      <Section title="Gastos" tipo="gasto" items={gastos} allItems={items} />
      <Section title="Ingresos" tipo="ingreso" items={ingresos} allItems={items} />
    </div>
  );

  function Section({
    title,
    tipo,
    items: list,
    allItems,
  }: {
    title: string;
    tipo: TipoTransaccion;
    items: Categoria[];
    allItems: Categoria[];
  }) {
    const [adding, setAdding] = useState(false);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
        <div className="card space-y-1 divide-y divide-slate-100 p-2 dark:divide-slate-800">
          {list.length === 0 && !adding && (
            <p className="p-3 text-center text-sm text-slate-400 dark:text-slate-500">Sin categorías</p>
          )}
          {list.map((cat) => (
            <CategoryRow key={cat.id} categoria={cat} />
          ))}
          {adding && user && current && (
            <NewCategoryRow
              tipo={tipo}
              onCancel={() => setAdding(false)}
              onCreated={() => {
                setAdding(false);
                showToast('Categoría creada', 'success');
              }}
              orden={nextOrden(allItems, current, tipo)}
            />
          )}
        </div>
      </div>
    );
  }
}

function CategoryRow({ categoria }: { categoria: Categoria }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  const remove = async () => {
    if (!user) return;
    const ok = await confirmDialog({
      title: `¿Eliminar "${categoria.nombre}"?`,
      message: 'Las transacciones con esta categoría quedarán sin ella.',
      confirmText: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCategoria(user.uid, categoria.id);
      showToast('Categoría eliminada', 'success');
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  if (editing) {
    return (
      <CategoryEditor
        initialNombre={categoria.nombre}
        initialIcono={categoria.icono}
        initialColor={categoria.color}
        onCancel={() => setEditing(false)}
        onSave={async (nombre, icono, color) => {
          if (!user) return;
          try {
            await updateCategoria(user.uid, categoria.id, { nombre, icono, color });
            showToast('Categoría actualizada', 'success');
            setEditing(false);
          } catch {
            showToast('Error al actualizar', 'error');
          }
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2 p-2">
      <CategoryIcon nombre={categoria.nombre} icono={categoria.icono} colorKey={categoria.color} size="sm" />
      <span className="flex-1 text-sm">{categoria.nombre}</span>
      <button onClick={() => setEditing(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
        <Edit2 size={16} />
      </button>
      <button onClick={remove} className="rounded-lg p-2 text-expense hover:bg-expense-light">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function NewCategoryRow({
  tipo,
  onCancel,
  onCreated,
  orden,
}: {
  tipo: TipoTransaccion;
  onCancel: () => void;
  onCreated: () => void;
  orden: number;
}) {
  const { user } = useAuth();
  const current = useSpaceStore((s) => s.current);
  const showToast = useUiStore((s) => s.showToast);

  const save = async (nombre: string, icono?: string, color?: string) => {
    if (!user || !current || !nombre.trim()) return;
    try {
      await createCategoria(user.uid, {
        nombre: nombre.trim(),
        espacio: current,
        tipo,
        icono,
        color,
        orden,
      });
      onCreated();
    } catch {
      showToast('Error al crear', 'error');
    }
  };

  return (
    <CategoryEditor
      onCancel={onCancel}
      onSave={save}
      autoFocusName
    />
  );
}

function CategoryEditor({
  initialNombre,
  initialIcono,
  initialColor,
  onCancel,
  onSave,
  autoFocusName,
}: {
  initialNombre?: string;
  initialIcono?: string;
  initialColor?: string;
  onCancel: () => void;
  onSave: (nombre: string, icono?: string, color?: string) => Promise<void> | void;
  autoFocusName?: boolean;
}) {
  const [nombre, setNombre] = useState(initialNombre ?? '');
  const [icono, setIcono] = useState<string | undefined>(initialIcono);
  const [color, setColor] = useState<string>(initialColor ?? DEFAULT_COLOR_KEY);
  const dark = useIsDark();

  const handleSave = () => {
    if (!nombre.trim()) return;
    onSave(nombre.trim(), icono, color);
  };

  return (
    <div className="space-y-3 p-2">
      <input
        autoFocus={autoFocusName}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Nombre de la categoría"
        className="input"
      />

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Color</p>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_CHOICES.map((key) => {
            const c = COLOR_MAP[key];
            const isSelected = color === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setColor(key)}
                aria-label={c.label}
                title={c.label}
                className={cn(
                  'h-7 w-7 rounded-full transition-transform',
                  c.solid,
                  isSelected
                    ? dark
                      ? 'scale-110 ring-2 ring-offset-2 ring-slate-300 ring-offset-slate-900'
                      : 'scale-110 ring-2 ring-offset-2 ring-slate-700 ring-offset-white'
                    : 'opacity-70 hover:opacity-100',
                )}
              />
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Icono</p>
        <div className="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
          {ICON_CHOICES.map((name) => {
            const Icon = getCategoryIcon(name);
            const isSelected = icono === name;
            const c = COLOR_MAP[color] ?? COLOR_MAP[DEFAULT_COLOR_KEY];
            return (
              <button
                key={name}
                type="button"
                onClick={() => setIcono(name)}
                title={name}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  isSelected
                    ? `${c.darkBg} ${c.darkText}`
                    : 'text-slate-500 hover:bg-white hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200',
                )}
              >
                <Icon size={16} strokeWidth={2.25} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={!nombre.trim()} className="btn-primary flex-1">
          <Check size={16} /> Guardar
        </button>
      </div>
    </div>
  );
}
