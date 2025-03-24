import { HomePageLayout, CreateVaultLayout, MainLayout } from '@/layouts';
import { Home } from '@/pages/Home';
import { CreateVault } from '@/pages/CreateVault';
import { Vaults } from '@/pages/Vaults';
import { Profile } from '@/pages/Profile';
import { Vault } from '@/pages/Vault';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { Contribute } from '@/pages/Contribute';

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
  {
    path: '/vaults/my',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/vaults/my',
        element: (
          <MainLayout>
            <Vaults isMyVaults />
          </MainLayout>
        ),
      },
    ],
  },
  {
    path: '/contribute',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/contribute',
        element: (
          <MainLayout>
            <Contribute />
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