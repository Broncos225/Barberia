import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { applyTheme, getEffectiveTheme, useThemeStore } from './stores/theme.store';
import './index.css';

const initialTheme = useThemeStore.getState().theme;
applyTheme(initialTheme);

if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    const t = useThemeStore.getState().theme;
    if (t === 'system') applyTheme('system');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Re-export for use elsewhere
export { getEffectiveTheme };
