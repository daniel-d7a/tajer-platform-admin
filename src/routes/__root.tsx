import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isLoginPage = routerState.location.pathname === '/login';

    if (isAuthenticated && user && user.role !== "ADMIN") {
      console.error("ليس لديك صلاحية الدخول");
      navigate({ to: '/login', replace: true });
      return;
    }

    if (!isAuthenticated && !isLoginPage) {
      navigate({ to: '/login', replace: true });
    }

    if (isAuthenticated && isLoginPage) {
      navigate({ to: '/', replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, routerState.location.pathname, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <Layout>
          <Outlet />
        </Layout>
      ) : (
        <Outlet />
      )}
      <TanStackRouterDevtools />
    </>
  );
}