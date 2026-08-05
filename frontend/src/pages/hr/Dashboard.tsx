import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StatCard, { StatCardProps } from '../../components/dashboard/StatCard';
import DriverList from "../../components/DriverList";
import HighlightedCard from '../../components/dashboard/HighlightedCard';

const stats: StatCardProps[] = [
  {
    title: 'Active Drivers',
    value: '24',
    interval: 'Currently assigned',
    trend: 'up',
    data: [
      14, 16, 15, 17, 18, 20, 19, 21, 20, 22, 23, 22, 24, 23, 22, 24, 25, 23, 24,
      26, 25, 24, 23, 25, 24, 26, 25, 24, 23, 24,
    ],
  },
  {
    title: 'Total Vehicles',
    value: '18',
    interval: 'In fleet',
    trend: 'up',
    data: [
      10, 10, 11, 11, 12, 13, 12, 13, 14, 14, 13, 14, 15, 15, 16, 15, 16, 17, 16,
      17, 18, 18, 17, 18, 18, 19, 18, 18, 17, 18,
    ],
  },
  {
    title: 'Active Assignments',
    value: '15',
    interval: 'Trips in progress',
    trend: 'neutral',
    data: [
      12, 10, 13, 11, 14, 12, 15, 13, 14, 15, 13, 12, 14, 15, 13, 14, 12, 13, 15,
      14, 13, 12, 14, 13, 15, 14, 13, 15, 14, 15,
    ],
  },
  {
    title: 'Expiring Docs',
    value: '3',
    interval: 'Within 60 days',
    trend: 'down',
    data: [
      5, 6, 5, 4, 5, 4, 5, 3, 4, 3, 4, 3, 4, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2,
      3, 3, 2, 3, 3,
    ],
  },
];

export default function HrDashboard() {
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
