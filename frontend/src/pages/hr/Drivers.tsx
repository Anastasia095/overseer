import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CustomizedDataGrid from '../../components/dashboard/CustomizedDataGrid';
import { driverColumns } from '../../internals/data/driverGridData';
import { driversApi } from '../../api/drivers';
import type { Driver } from '../../api/drivers';

export default function HrDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    driversApi
      .list()
      .then((data) => {
        if (!cancelled) setDrivers(data);
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

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography component="h2" variant="h6">
            Drivers
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage driver accounts and records
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddRoundedIcon />}>
          Add Driver
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <CustomizedDataGrid rows={drivers} columns={driverColumns} loading={loading} />
    </Box>
  );
}
