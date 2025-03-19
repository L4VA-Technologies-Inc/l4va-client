import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { CreateVaultLayout, HomePageLayout, MainLayout } from '@/layouts';
import { NotFound } from '@/pages/NotFound';
import { Home } from '@/pages/Home';
import { CreateVault } from '@/pages/CreateVault';
import { Vaults } from '@/pages/Vaults';
import { Profile } from '@/pages/Profile';
import { Vault } from '@/pages/Vault';

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

const ProfilePage = () => (
  <MainLayout>
    <Profile />
  </MainLayout>
);

const VaultsPage = () => (
  <MainLayout>
    <Vaults />
  </MainLayout>
);

const VaultPage = () => (
  <MainLayout>
    <Vault />
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
    {
      path: '/vaults/:id',
      element: <VaultPage />,
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
    {
      path: '/profile',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/profile',
          element: <ProfilePage />,
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
