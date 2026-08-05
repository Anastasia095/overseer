import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { driversApi } from '../api/drivers';
import type { Driver } from '../api/drivers';
import CustomizedDataGrid from './dashboard/CustomizedDataGrid';
import { driverColumns } from '../internals/data/driverGridData';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

export default function DriverList() {
    // Store the list of drivers returned by the API
    const [drivers, setDrivers] = useState<Driver[]>([]);
    // Show a loading state while the request is in progress
    const [loading, setLoading] = useState(true);
    // Store an error message if the request fails
    const [error, setError] = useState<string | null>(null);

    // Load drivers once when the component is first rendered
    useEffect(() => {
        // Prevent state updates if the component is unmounted before the request finishes
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
        // Mark the request as cancelled when the component unmounts
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
