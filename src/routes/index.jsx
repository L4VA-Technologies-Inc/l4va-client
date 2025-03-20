import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { publicRoutes, protectedRoutes, notFoundRoute } from './config';

export const Routes = () => {
  const router = createBrowserRouter([
    ...publicRoutes,
    ...protectedRoutes,
    notFoundRoute,
  ]);

  return <RouterProvider router={router} />;
};
