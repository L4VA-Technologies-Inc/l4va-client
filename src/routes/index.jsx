import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../layouts/MainLayout.jsx';
import { NotFound } from '../pages/NotFound.jsx';

const HomePage = () => (
  <Layout>
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold">Welcome to l4VA</h1>
    </div>
  </Layout>
);

const DashboardPage = () => (
  <Layout>
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </div>
  </Layout>
);

const ProfilePage = () => (
  <Layout>
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold">Profile</h1>
    </div>
  </Layout>
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
      path: '/dashboard',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/dashboard',
          element: <DashboardPage />,
        },
        {
          path: '/dashboard/profile',
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
