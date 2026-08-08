import Driver from '../hr/Driver';
import { useAuth } from '../../context/AuthContext';

export default function DriverProfile() {
  const { user } = useAuth();
  return <Driver driverId={user?.id} />;
}