import { GridColDef } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';

export type DriverStatus = 'AVAILABLE' | 'EN_ROUTE' | 'IN_PROGRESS' | 'OFFLINE';

export const driverStatusColors: Record<DriverStatus, 'success' | 'info' | 'warning' | 'default'> = {
  AVAILABLE: 'success',
  EN_ROUTE: 'info',
  IN_PROGRESS: 'warning',
  OFFLINE: 'default',
};

export const driverStatusLabels: Record<DriverStatus, string> = {
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
        {/* to do: fix link color */}
        <Link
          to={`/hr/drivers/${params.row.id}`}
          style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}
          onClick={(e) => e.stopPropagation()}
        >
        {params.value}
        </Link >
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
        label={params.value ? driverStatusLabels[params.value as DriverStatus] : '—'}
        size="small"
        color={params.value ? driverStatusColors[params.value as DriverStatus] : 'default'}
      />
    ), 
  },
  {
    field: 'dispatcher',
    headerName: 'Dispatcher',
    flex: 0.5,
    minWidth: 110,
    renderCell: (params) => {
      // If no dispatcher is assigned, display a fallback
      if (!params.value) return '—';

      // 1. Grab the dispatcher's ID from the row data
      const dispatcherId = params.row.dispatcherId || params.row.dispatcher?.id;

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {dispatcherId ? (
            <Link
              to={`/dispatchers/${dispatcherId}`}
              style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}
            >
              {params.value}
            </Link>
          ) : (
            params.value
          )}
        </div>
      );
    },
  },
  { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 130 },
];
