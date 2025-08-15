import { lazy } from 'react';

import AdminLayout from '../layouts/AdminLayout';
import GuestLayout from '../layouts/GuestLayout';

const DashboardHome = lazy(() => import('../views/home/DashHome/index'));


const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: '/home',
          element: <DashboardHome />
        },
        {
          path: '*',
          element: <h1>Not Found</h1>
        }
      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: []
    }
  ]
};

export default MainRoutes;
