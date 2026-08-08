import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { driversApi } from '../../api/drivers';
import type { Driver } from '../../api/drivers';

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Available',
  EN_ROUTE: 'En Route',
  IN_PROGRESS: 'In Progress',
  OFFLINE: 'Offline',
};

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  AVAILABLE: 'success',
  EN_ROUTE: 'info',
  IN_PROGRESS: 'warning',
  OFFLINE: 'default',
};

const statusIconColors: Record<string, string> = {
  AVAILABLE: '#2e7d32',
  EN_ROUTE: '#0288d1',
  IN_PROGRESS: '#ed6c02',
  OFFLINE: '#9e9e9e',
};

export default function DispatcherDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    let cancelled = false;
    driversApi
      .list()
      .then((data) => {
        if (cancelled) return;
        setDrivers(data);
        setSelectedDriver(data[0] ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load drivers');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveSelectedLocation = useCallback(
    (driver: Driver | null) => {
      if (!driver) return;
      if (driver.lastLat === null || driver.lastLng === null) return;
      if (driver.lastLocationLabel) return;
      let cancelled = false;
      driversApi
        .resolveAddress(driver.id)
        .then((res) => {
          if (!cancelled && res.address) {
            setDrivers((prev) =>
              prev.map((d) => (d.id === driver.id ? { ...d, lastLocationLabel: res.address } : d)),
            );
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    },
    [],
  );

  useEffect(() => {
    resolveSelectedLocation(selectedDriver);
  }, [selectedDriver, resolveSelectedLocation]);

  const fleet: FleetVehicle[] = useMemo(
    () =>
      drivers.map((d) => ({
        id: d.id,
        name: d.name,
        status: d.status ? statusLabels[d.status] ?? d.status : undefined,
        lat: d.lastLat ?? undefined,
        lng: d.lastLng ?? undefined,
        locationLabel: d.lastLocationLabel ?? undefined,
        lastLocationAt: d.lastLocationAt ?? undefined,
      })),
    [drivers],
  );

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
                {drivers.map((driver, i) => (
                  <Box key={driver.id}>
                    {i > 0 && <Divider component="li" />}
                    <ListItemButton
                      selected={selectedDriver?.id === driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CircleIcon
                          fontSize="small"
                          sx={{ color: statusIconColors[driver.status ?? ''] }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={driver.name}
                        secondary={
                          <Chip
                            label={statusLabels[driver.status ?? ''] ?? driver.status}
                            size="small"
                            color={statusColors[driver.status ?? ''] ?? 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItemButton>
                  </Box>
                ))}
                {drivers.length === 0 && !loading && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {error ? error : 'No assigned drivers'}
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
                <FleetMap vehicles={fleet} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Selected Driver — {selectedDriver?.name ?? 'None'}
              </Typography>
              <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedDriver ? (
                      <Chip
                        label={statusLabels[selectedDriver.status ?? ''] ?? selectedDriver.status}
                        size="small"
                        color={statusColors[selectedDriver.status ?? ''] ?? 'default'}
                      />
                    ) : (
                      '—'
                    )}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedDriver?.phone ?? '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Dispatcher
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedDriver?.dispatcher ?? '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedDriver?.lastLat != null && selectedDriver?.lastLng != null
                      ? selectedDriver.lastLocationLabel ??
                        `${selectedDriver.lastLat.toFixed(4)}, ${selectedDriver.lastLng.toFixed(4)}`
                      : '—'}
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
