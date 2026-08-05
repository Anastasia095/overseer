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
import { dashboardApi, DashboardStats } from '../../api/dashboard';

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}

function trendFrom(values: number[]): 'up' | 'down' | 'neutral' {
  const first = values.find((n) => n > 0) ?? 0;
  const last = values.length ? values[values.length - 1] : 0;
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'neutral';
}

function toCards(data: DashboardStats): StatCardProps[] {
  const activeLoads = sum(data.weekly.map((w) => w.completed));
  const dispatched = sum(data.weekly.map((w) => w.dispatched));
  const cancelled = sum(data.weekly.map((w) => w.cancelled));
  const monthLabels = data.monthly.map((m) => m.label);
  const weekLabels = data.weekly.map((w) => w.label);

  return [
    {
      title: 'Active Drivers',
      value: String(data.activeDrivers),
      interval: 'Working now',
      trend: trendFrom(data.monthly.map((m) => m.activeDrivers)),
      data: data.monthly.map((m) => m.activeDrivers),
      xLabels: monthLabels,
    },
    {
      title: 'Total Vehicles',
      value: String(data.totalVehicles),
      interval: 'In fleet',
      trend: trendFrom(data.monthly.map((m) => m.totalVehicles)),
      data: data.monthly.map((m) => m.totalVehicles),
      xLabels: monthLabels,
    },
    {
      title: 'Active Loads',
      value: String(data.activeLoads),
      interval: 'Live now',
    },
    {
      title: 'Loads Completed',
      value: String(activeLoads),
      interval: 'Last 12 weeks',
      trend: trendFrom(data.weekly.map((w) => w.completed)),
      data: data.weekly.map((w) => w.completed),
      xLabels: weekLabels,
      footer: `${dispatched} dispatched · ${cancelled} cancelled`,
    },
  ];
}

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
        setStats(toCards(data));
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
