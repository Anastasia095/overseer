import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import HrDashboard from './pages/hr/Dashboard';
import HrDrivers from './pages/hr/Drivers';
import Driver from './pages/hr/Driver';
import HrDispatchers from './pages/hr/Dispatchers';
import HrVehicles from './pages/hr/Vehicles';
import DispatcherDashboard from './pages/dispatcher/Dashboard';
import Loads from './pages/dispatcher/Loads';
import DriverProfile from './pages/driver/Profile';
import { useAuth } from './context/AuthContext';
import type { JSX } from 'react';

function RequireRole({ roles, children }: { roles: string[]; children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles.some((r) => roles.includes(r))) {
    const home = user.roles.includes('dispatcher') ? '/dispatch' : '/hr';
    return <Navigate to={home} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route
          path="/hr"
          element={
            <RequireRole roles={['hr', 'admin']}>
              <HrDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/hr/drivers"
          element={
            <RequireRole roles={['hr', 'admin']}>
              <HrDrivers />
            </RequireRole>
          }
        />
        <Route
          path="/hr/drivers/:id"
          element={
            <RequireRole roles={['hr', 'admin', 'dispatcher']}>
              <Driver />
            </RequireRole>
          }
        />
        <Route
          path="/driver/profile"
          element={
            <RequireRole roles={['driver', 'admin']}>
              <DriverProfile />
            </RequireRole>
          }
        />
        <Route
          path="/hr/dispatchers"
          element={
            <RequireRole roles={['hr', 'admin']}>
              <HrDispatchers />
            </RequireRole>
          }
        />
        <Route
          path="/hr/vehicles"
          element={
            <RequireRole roles={['hr', 'admin']}>
              <HrVehicles />
            </RequireRole>
          }
        />
        <Route
          path="/dispatch"
          element={
            <RequireRole roles={['dispatcher', 'admin']}>
              <DispatcherDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/dispatch/loads"
          element={
            <RequireRole roles={['dispatcher', 'admin']}>
              <Loads />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
