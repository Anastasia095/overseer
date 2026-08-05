import { GridColDef } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

export type DriverStatus = 'AVAILABLE' | 'EN_ROUTE' | 'IN_PROGRESS' | 'OFFLINE';

const statusColors: Record<DriverStatus, 'success' | 'info' | 'warning' | 'default'> = {
  AVAILABLE: 'success',
  EN_ROUTE: 'info',
  IN_PROGRESS: 'warning',
  OFFLINE: 'default',
};

const statusLabels: Record<DriverStatus, string> = {
  AVAILABLE: 'Available',
  EN_ROUTE: 'En Route',
  IN_PROGRESS: 'In Progress',
  OFFLINE: 'Offline',
};

export const driverColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Driver',
    flex: 1.5,
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
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.5,
    minWidth: 110,
    renderCell: (params) => (
      <Chip
        label={params.value ? statusLabels[params.value as DriverStatus] : '—'}
        size="small"
        color={params.value ? statusColors[params.value as DriverStatus] : 'default'}
      />
    ),
  },
  { field: 'dispatcher', headerName: 'Dispatcher', flex: 0.5, minWidth: 110 },
  { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 130 },
];
