import { useEffect, useState } from 'react';
import { getEffectiveTheme, useThemeStore } from '@/stores/theme.store';

export function useIsDark(): boolean {
  const theme = useThemeStore((s) => s.theme);
  const [dark, setDark] = useState(() => getEffectiveTheme(theme) === 'dark');

  useEffect(() => {
    setDark(getEffectiveTheme(theme) === 'dark');
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setDark(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return dark;
}