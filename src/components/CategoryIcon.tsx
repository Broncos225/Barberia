import { getCategoryColor, getCategoryIcon, getColorByKey, getColorClasses } from '@/lib/category-style';
import { cn } from '@/lib/cn';
import { useIsDark } from '@/hooks/useIsDark';

interface Props {
  nombre: string;
  icono?: string | null;
  colorKey?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASS = {
  sm: { wrap: 'h-7 w-7', icon: 14 },
  md: { wrap: 'h-10 w-10', icon: 18 },
  lg: { wrap: 'h-12 w-12', icon: 22 },
};

export function CategoryIcon({ nombre, icono, colorKey, size = 'md', className }: Props) {
  const Icon = getCategoryIcon(icono);
  const dark = useIsDark();
  const color = colorKey ? getColorByKey(colorKey, dark) : getCategoryColor(nombre, colorKey, dark);
  const cls = getColorClasses(color, dark);
  const s = SIZE_CLASS[size];
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full',
        cls.bg,
        cls.text,
        s.wrap,
        className,
      )}
    >
      <Icon size={s.icon} strokeWidth={2.25} />
    </div>
  );
}