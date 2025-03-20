import { HomePageLayout, CreateVaultLayout, MainLayout } from '@/layouts';
import { Home } from '@/pages/Home';
import { CreateVault } from '@/pages/CreateVault';
import { Vaults } from '@/pages/Vaults';
import { Profile } from '@/pages/Profile';
import { Vault } from '@/pages/Vault';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';

export const publicRoutes = [
  {
    path: '/',
    element: (
      <HomePageLayout>
        <Home />
      </HomePageLayout>
    ),
  },
  {
    path: '/vaults',
    element: (
      <MainLayout>
        <Vaults />
      </MainLayout>
    ),
  },
  {
    path: '/vaults/:id',
    element: (
      <MainLayout>
        <Vault />
      </MainLayout>
    ),
  },
  {
    path: '/vaults/my',
    element: (
      <MainLayout>
        <Vaults isMyVaults />
      </MainLayout>
    ),
  },
];

export const protectedRoutes = [
  {
    path: '/create',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/create',
        element: (
          <CreateVaultLayout>
            <CreateVault />
          </CreateVaultLayout>
        ),
      },
    ],
  },
  {
    path: '/profile',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/profile',
        element: (
          <MainLayout>
            <Profile />
          </MainLayout>
        ),
      },
    ],
  },
];

export const notFoundRoute = {
  path: '*',
  element: <NotFound />,
}; 