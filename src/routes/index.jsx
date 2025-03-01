import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { CreateVaultLayout, HomePageLayout, MainLayout } from '@/layouts';
import { NotFound } from '@/pages/NotFound';
import { Home } from '@/pages/Home';
import { CreateVault } from '@/pages/CreateVault';
import { Vaults } from '@/pages/Vaults';

const HomePage = () => (
  <HomePageLayout>
    <Home />
  </HomePageLayout>
);

const CreateVaultPage = () => (
  <CreateVaultLayout>
    <CreateVault />
  </CreateVaultLayout>
);

const VaultsPage = () => (
  <MainLayout>
    <Vaults />
  </MainLayout>
);

export const Routes = () => {
  const routesForPublic = [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/vaults',
      element: <VaultsPage />,
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
