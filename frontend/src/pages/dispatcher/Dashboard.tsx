import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircleIcon from '@mui/icons-material/Circle';
import FleetMap from '../../components/maps/FleetMap';
import type { FleetVehicle } from '../../components/maps/FleetMap';

const assignedDrivers = [
  {
    id: 4,
    name: 'John Carter',
    status: 'Available' as const,
    lat: 34.0522,
    lng: -118.2437,
    lastLocationAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 5,
    name: 'Maria Santos',
    status: 'En Route' as const,
    lat: 34.0783,
    lng: -118.1562,
    lastLocationAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];

const demoFleet: FleetVehicle[] = assignedDrivers.map((d) => ({
  id: d.id,
  name: d.name,
  status: d.status,
  lat: d.lat,
  lng: d.lng,
  lastLocationAt: d.lastLocationAt,
}));

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  Available: 'success',
  'En Route': 'info',
  'In Progress': 'warning',
  Offline: 'default',
};

const statusIconColors: Record<string, string> = {
  Available: '#2e7d32',
  'En Route': '#0288d1',
  'In Progress': '#ed6c02',
  Offline: '#9e9e9e',
};

export default function DispatcherDashboard() {
  const [selectedDriver, setSelectedDriver] = useState(assignedDrivers[0]);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Live Dispatch
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Assigned Drivers
              </Typography>
              <List disablePadding>
                {assignedDrivers.map((driver, i) => (
                  <Box key={driver.id}>
                    {i > 0 && <Divider component="li" />}
                    <ListItemButton
                      selected={selectedDriver.id === driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CircleIcon
                          fontSize="small"
                          sx={{ color: statusIconColors[driver.status] }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={driver.name}
                        secondary={
                          <Chip
                            label={driver.status}
                            size="small"
                            color={statusColors[driver.status]}
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItemButton>
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
                <FleetMap vehicles={demoFleet} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Selected Driver — {selectedDriver.name}
              </Typography>
              <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    <Chip
                      label={selectedDriver.status}
                      size="small"
                      color={statusColors[selectedDriver.status]}
                    />
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Origin
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Los Angeles, CA
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Destination
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    San Francisco, CA
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Update
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    2 min ago
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
