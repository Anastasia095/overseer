import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import type { GridColDef } from '@mui/x-data-grid';
import CustomizedDataGrid from './dashboard/CustomizedDataGrid';
import { driversApi } from '../api/drivers';
import type { Driver } from '../api/drivers';
import { driverColumns } from '../internals/data/driverGridData';

interface DriverListProps {
  refreshKey?: number;
  onAssignDispatcher?: (driver: Driver) => void;
  onManageVehicles?: (driver: Driver) => void;
}

export default function DriverList({
  refreshKey = 0,
  onAssignDispatcher,
  onManageVehicles,
}: DriverListProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
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
  }, [refreshKey]);

  const columns = useMemo<GridColDef[]>(() => {
    if (!onAssignDispatcher && !onManageVehicles) return driverColumns;
    return [
      ...driverColumns,
      {
        field: 'actions',
        headerName: 'Actions',
        width: 90,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.25}>
            {onAssignDispatcher && (
              <IconButton
                size="small"
                title="Assign dispatcher"
                onClick={() => onAssignDispatcher(params.row as Driver)}
              >
                <PersonSearchRoundedIcon fontSize="small" />
              </IconButton>
            )}
            {onManageVehicles && (
              <IconButton
                size="small"
                title="Manage vehicles"
                onClick={() => onManageVehicles(params.row as Driver)}
              >
                <DirectionsCarRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ),
      },
    ];
  }, [onAssignDispatcher, onManageVehicles]);

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <CustomizedDataGrid rows={drivers} columns={columns} loading={loading} />
    </>
  );
}
