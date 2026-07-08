import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginPage } from '@/features/auth/pages/Login';
import { SelectSpacePage } from '@/features/spaces/pages/SelectSpace';
import { DashboardPage } from '@/features/transactions/pages/Dashboard';
import { HistoryPage } from '@/features/transactions/pages/History';
import { ReportsPage } from '@/features/reports/pages/Reports';
import { CategoriesPage } from '@/features/categories/pages/Categories';
import { BudgetsPage } from '@/features/budgets/pages/Budgets';
import { SettingsPage } from '@/features/spaces/pages/Settings';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { SpaceRedirect, SpaceParam } from '@/features/spaces/hooks/useSpaceRedirect';
import { useSpaceStore } from '@/stores/space.store';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';
import { TransactionDetail } from '@/features/transactions/components/TransactionDetail';

function SpaceShell({ children }: { children: React.ReactNode }) {
  const current = useSpaceStore((s) => s.current);
  if (!current) return <SpaceParam />;
  return <AppLayout current={current}>{children}</AppLayout>;
}

function SpaceSyncer() {
  const { espacio } = useParams<{ espacio: string }>();
  const setCurrent = useSpaceStore((s) => s.setCurrent);

  useEffect(() => {
    if (espacio === 'personal' || espacio === 'barberia') {
      setCurrent(espacio);
    }
  }, [espacio, setCurrent]);

  return null;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-space" element={<SelectSpacePage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SpaceRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/:espacio"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <SpaceShell>
              <DashboardPage />
            </SpaceShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/:espacio/history"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <SpaceShell>
              <HistoryPage />
            </SpaceShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/:espacio/reports"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <SpaceShell>
              <ReportsPage />
            </SpaceShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/:espacio/categories"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <SpaceShell>
              <CategoriesPage />
            </SpaceShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/:espacio/budgets"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <SpaceShell>
              <BudgetsPage />
            </SpaceShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/:espacio/transactions/new"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <TransactionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:espacio/transactions/:id"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <TransactionDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:espacio/transactions/:id/edit"
        element={
          <ProtectedRoute>
            <SpaceSyncer />
            <TransactionForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SpaceShell>
              <SettingsPage />
            </SpaceShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
