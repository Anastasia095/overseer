import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import HrDashboard from './pages/hr/Dashboard';
import HrDrivers from './pages/hr/Drivers';
import HrVehicles from './pages/hr/Vehicles';
import DispatcherDashboard from './pages/dispatcher/Dashboard';
import { getToken } from './api/client';
import type { JSX } from 'react';

function RequireAuth({ children }: { children: JSX.Element }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/hr" element={<RequireAuth><HrDashboard /></RequireAuth>} />
        <Route path="/hr/drivers" element={<RequireAuth><HrDrivers /></RequireAuth>} />
        <Route path="/hr/vehicles" element={<RequireAuth><HrVehicles /></RequireAuth>} />
        <Route path="/dispatcher" element={<RequireAuth><DispatcherDashboard /></RequireAuth>} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
