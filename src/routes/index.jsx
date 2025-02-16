import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { HomePageLayout, MainLayout } from '@/layouts';
import { NotFound } from '@/pages/NotFound';
import { Home } from '@/pages/Home';
import { CreateVault } from '@/pages/CreateVault';

const HomePage = () => (
  <HomePageLayout>
    <Home />
  </HomePageLayout>
);

const CreateVaultPage = () => (
  <MainLayout>
    <CreateVault />
  </MainLayout>
);

export const Routes = () => {
  const routesForPublic = [
    {
      path: '/',
      element: <HomePage />,
    },
  ];

  const routesForAuthenticatedOnly = [
    {
      path: '/create',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/create',
          element: <CreateVaultPage />,
        },
      ],
    },
  ];

  const router = createBrowserRouter([
    ...routesForPublic,
    ...routesForAuthenticatedOnly,
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return <RouterProvider router={router} />;
};
