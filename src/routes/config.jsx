import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '@/layouts';
import { Home } from '@/pages/Home';
import { CreateVault } from '@/pages/CreateVault';
import { MyVaults } from '@/pages/MyVaults';
import { Profile } from '@/pages/Profile';
import { Vault } from '@/pages/Vault';
import { NotFound } from '@/pages/NotFound';
import { Contribute } from '@/pages/Contribute';
import { Sandbox } from '@/pages/Sandbox';

export const publicRoutes = [
  {
    path: '/',
    element: (
      <Layout
        backgroundHeight="768px"
        backgroundImage="/assets/hero-bg.webp"
      >
        <Home />
      </Layout>
    ),
  },
  {
    path: '/sandbox',
    element: (
      <Layout>
        <Sandbox />
      </Layout>
    ),
  },
  {
    path: '/vaults',
    element: (
      <Layout>
        <MyVaults />
      </Layout>
    ),
  },
  {
    path: '/vaults/:id',
    element: (
      <Layout>
        <Vault />
      </Layout>
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
          <Layout
            backgroundHeight="518px"
            backgroundImage="/assets/vaults/create-vault-bg.webp"
          >
            <CreateVault />
          </Layout>
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
          <Layout>
            <Profile />
          </Layout>
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
          <Layout>
            <MyVaults />
          </Layout>
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
          <Layout>
            <Contribute />
          </Layout>
        ),
      },
    ],
  },
];

export const notFoundRoute = {
  path: '*',
  element: <NotFound />,
};
