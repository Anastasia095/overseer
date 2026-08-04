import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
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

export const driverRows: GridRowsProp = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    status: 'AVAILABLE',
    dispatcher: 'Alice',
    phone: '(555) 010-1234',
  },
  {
    id: 2,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    status: 'EN_ROUTE',
    dispatcher: 'Alice',
    phone: '(555) 010-2234',
  },
  {
    id: 3,
    name: 'Steve Brown',
    email: 'steve@example.com',
    status: 'IN_PROGRESS',
    dispatcher: 'Bob',
    phone: '(555) 010-3234',
  },
  {
    id: 4,
    name: 'Dan Wilson',
    email: 'dan@example.com',
    status: 'OFFLINE',
    dispatcher: 'Bob',
    phone: '(555) 010-4234',
  },
  {
    id: 5,
    name: 'Carlos Rivera',
    email: 'carlos@example.com',
    status: 'EN_ROUTE',
    dispatcher: 'Alice',
    phone: '(555) 010-5234',
  },
  {
    id: 6,
    name: 'Tom Nguyen',
    email: 'tom@example.com',
    status: 'AVAILABLE',
    dispatcher: 'Bob',
    phone: '(555) 010-6234',
  },
];
