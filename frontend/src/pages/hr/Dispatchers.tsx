import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import type { GridColDef } from '@mui/x-data-grid';
import CustomizedDataGrid from '../../components/dashboard/CustomizedDataGrid';
import CreateUserDialog from '../../components/hr/CreateUserDialog';
import { dispatchersApi } from '../../api/dispatchers';
import type { Dispatcher } from '../../api/dispatchers';

export default function HrDispatchers() {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    dispatchersApi
      .list()
      .then((data) => {
        if (!cancelled) setDispatchers(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dispatchers');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'name',
        headerName: 'Dispatcher',
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar
              sx={{
                width: '28px',
                height: '28px',
                fontSize: '0.8rem',
                bgcolor: 'primary.main',
              }}
            >
              {String(params.value).toUpperCase().substring(0, 1)}
            </Avatar>
            {params.value}
          </div>
        ),
      },
      { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 180 },
    ],
    [],
  );

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
      >
        <Box>
          <Typography component="h2" variant="h6">
            Dispatchers
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage dispatcher accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() => setAddOpen(true)}
        >
          Add Dispatcher
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <CustomizedDataGrid
        rows={dispatchers}
        columns={columns}
        loading={loading}
        checkboxSelection={false}
      />

      <CreateUserDialog
        role="dispatcher"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={refresh}
      />
    </Box>
  );
}
