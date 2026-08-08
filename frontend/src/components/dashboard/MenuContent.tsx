import { useNavigate, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { useAuth } from '../../context/AuthContext';

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const roles = user?.roles ?? [];

  const canHr = roles.some((r) => r === 'hr' || r === 'admin');
  const canDispatch = roles.some((r) => r === 'dispatcher' || r === 'admin');
  const canDriver = roles.some((r) => r === 'driver');

  const mainListItems = [
    ...(canHr
      ? [
          { text: 'HR Dashboard', path: '/hr', icon: <DashboardRoundedIcon /> },
        ...(canDispatch
          ? [{ text: 'Dispatcher Dashboard', path: '/dispatch', icon: <MapRoundedIcon /> }]
          : []),
          { text: 'Drivers', path: '/hr/drivers', icon: <PeopleRoundedIcon /> },
          { text: 'Dispatchers', path: '/hr/dispatchers', icon: <BadgeRoundedIcon /> },
          { text: 'Vehicles', path: '/hr/vehicles', icon: <LocalShippingRoundedIcon /> },
        ]
      : []),
    ...(canDriver
      ? [{ text: 'My Profile', path: '/driver/profile', icon: <PeopleRoundedIcon /> }]
      : []),
  ];

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
