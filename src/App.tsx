import { AppRouter } from './routes/AppRouter';
import { Toaster } from './components/Toaster';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InstallPrompt } from './components/InstallPrompt';

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
      <ConfirmDialog />
      <InstallPrompt />
    </>
  );
}
