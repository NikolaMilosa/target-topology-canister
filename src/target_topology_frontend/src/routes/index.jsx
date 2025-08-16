import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';
import AdminLayout from '../layouts/AdminLayout';

// render - landing pag
const DashboardHome = lazy(() => import('../views/home/DashHome/index'));
const DashboardSubnets= lazy(() => import('../views/subnets/DashSubnets/index'));

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          index: true,
          element: <DashboardHome />
        }
      ]
    },
    {
      path: '/subnets',
      element: <AdminLayout />,
      children: [
        {
          index: true,
          element: <DashboardSubnets />
        }
      ]
    },
    MainRoutes
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
