import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import StatCard, { StatCardProps } from '../../components/dashboard/StatCard';
import DriverList from '../../components/DriverList';
import HighlightedCard from '../../components/dashboard/HighlightedCard';
import { dashboardApi } from '../../api/dashboard';

export default function HrDashboard() {
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    dashboardApi
      .stats()
      .then((data) => {
        if (!active) return;
        setStats([
          {
            title: 'Active Drivers',
            value: String(data.activeDrivers),
            interval: 'Working now',
          },
          {
            title: 'Offline Drivers',
            value: String(data.offlineDrivers),
            interval: 'Not working',
          },
          {
            title: 'Total Vehicles',
            value: String(data.totalVehicles),
            interval: 'In fleet',
          },
          {
            title: 'Active Assignments',
            value: String(data.activeAssignments),
            interval: 'Trips in progress',
          },
        ]);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Fleet Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {loading && (
          <Grid size={{ xs: 12 }}>
            <CircularProgress />
          </Grid>
        )}
        {error && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">Failed to load stats: {error}</Alert>
          </Grid>
        )}
        {stats.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Drivers
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12 }}>
          <Stack sx={{ gap: 2 }}>
            <DriverList />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
