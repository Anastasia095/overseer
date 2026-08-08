import { GridColDef } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export type AssignmentStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const statusColors: Record<AssignmentStatus, 'default' | 'info' | 'success' | 'error'> = {
  SCHEDULED: 'info',
  ACTIVE: 'success',
  COMPLETED: 'default',
  CANCELLED: 'error',
};

const statusLabels: Record<AssignmentStatus, string> = {
  SCHEDULED: 'Scheduled',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const assignmentColumns: GridColDef[] = [
  { field: 'id', headerName: 'Load #', flex: 0.4, minWidth: 70 },
  {
    field: 'origin',
    headerName: 'Origin',
    flex: 1,
    minWidth: 130,
    valueFormatter: (value) => value || '—',
  },
  {
    field: 'destination',
    headerName: 'Destination',
    flex: 1,
    minWidth: 130,
    valueFormatter: (value) => value || '—',
  },
  {
    field: 'driverName',
    headerName: 'Driver',
    flex: 1,
    minWidth: 140,
    renderCell: (params) => <span style={{ fontWeight: 500 }}>{params.value}</span>,
  },
  {
    field: 'vehicleName',
    headerName: 'Vehicle',
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <span>
        {params.value}
        {params.row.vehiclePlate ? ` · ${params.row.vehiclePlate}` : ''}
      </span>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.6,
    minWidth: 120,
    renderCell: (params) => (
      <Chip
        label={params.value ? statusLabels[params.value as AssignmentStatus] : '—'}
        size="small"
        color={params.value ? statusColors[params.value as AssignmentStatus] : 'default'}
      />
    ),
  },
  {
    field: 'startsAt',
    headerName: 'Start',
    flex: 0.8,
    minWidth: 130,
    valueFormatter: (value) => (value ? new Date(value).toLocaleString() : '—'),
  },
  {
    field: 'endsAt',
    headerName: 'End',
    flex: 0.8,
    minWidth: 130,
    valueFormatter: (value) => (value ? new Date(value).toLocaleString() : '—'),
  },
];
