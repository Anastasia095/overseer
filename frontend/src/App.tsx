import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import HrDashboard from './pages/hr/Dashboard';
import HrDrivers from './pages/hr/Drivers';
import HrVehicles from './pages/hr/Vehicles';
import DispatcherDashboard from './pages/dispatcher/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/hr" element={<HrDashboard />} />
        <Route path="/hr/drivers" element={<HrDrivers />} />
        <Route path="/hr/vehicles" element={<HrVehicles />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
