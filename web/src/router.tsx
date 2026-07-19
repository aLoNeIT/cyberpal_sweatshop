import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AgentList from './pages/AgentList';
import AgentConfig from './pages/AgentConfig';
import Chat from './pages/Chat';
import History from './pages/History';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

/** 鉴权守卫：无 token → 重定向 /login */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** 未登录守卫：已有 token → 重定向 /dashboard */
const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <GuestGuard><Login /></GuestGuard>,
  },
  {
    path: '/register',
    element: <GuestGuard><Register /></GuestGuard>,
  },
  {
    path: '/',
    element: <AuthGuard><AppLayout /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'agents', element: <AgentList /> },
      { path: 'agents/:id', element: <AgentConfig /> },
      { path: 'sessions', element: <History /> },
      { path: 'chat/:sessionId', element: <Chat /> },
      { path: 'billing', element: <Billing /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default router;
