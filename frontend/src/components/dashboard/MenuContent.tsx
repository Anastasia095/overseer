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
import { useAuth } from '../../context/AuthContext';

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const roles = user?.roles ?? [];

  const canHr = roles.some((r) => r === 'hr' || r === 'admin');
  const canDispatch = roles.some((r) => r === 'dispatcher' || r === 'admin');

  const mainListItems = [
    ...(canHr
      ? [
          { text: 'HR Dashboard', path: '/hr', icon: <DashboardRoundedIcon /> },
          { text: 'Drivers', path: '/hr/drivers', icon: <PeopleRoundedIcon /> },
          { text: 'Vehicles', path: '/hr/vehicles', icon: <LocalShippingRoundedIcon /> },
        ]
      : []),
    ...(canDispatch
      ? [{ text: 'Dispatcher', path: '/dispatch', icon: <MapRoundedIcon /> }]
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
