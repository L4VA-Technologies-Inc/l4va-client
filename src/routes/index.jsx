import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { Header } from '../components/Header';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-100">
    <Header />
    {children}
  </div>
);

// Pages
const HomePage = () => (
  <Layout>
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold">Welcome to L4VA</h1>
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
  ]);

  return <RouterProvider router={router} />;
};
