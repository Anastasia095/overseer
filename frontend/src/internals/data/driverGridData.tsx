import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

export type DriverStatus = 'Available' | 'En Route' | 'In Progress' | 'Offline';

const statusColors: Record<DriverStatus, 'success' | 'info' | 'warning' | 'default'> = {
  Available: 'success',
  'En Route': 'info',
  'In Progress': 'warning',
  Offline: 'default',
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
          {params.value.name.toUpperCase().substring(0, 1)}
        </Avatar>
        {params.value.name}
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
        label={params.value}
        size="small"
        color={statusColors[params.value as DriverStatus]}
      />
    ),
  },
  { field: 'dispatcher', headerName: 'Dispatcher', flex: 0.5, minWidth: 110 },
  { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 130 },
];

export const driverRows: GridRowsProp = [
  {
    id: 1,
    name: { name: 'John Smith' },
    email: 'john@example.com',
    status: 'Available',
    dispatcher: 'Alice',
    phone: '(555) 010-1234',
  },
  {
    id: 2,
    name: { name: 'Mike Johnson' },
    email: 'mike@example.com',
    status: 'En Route',
    dispatcher: 'Alice',
    phone: '(555) 010-2234',
  },
  {
    id: 3,
    name: { name: 'Steve Brown' },
    email: 'steve@example.com',
    status: 'In Progress',
    dispatcher: 'Bob',
    phone: '(555) 010-3234',
  },
  {
    id: 4,
    name: { name: 'Dan Wilson' },
    email: 'dan@example.com',
    status: 'Offline',
    dispatcher: 'Bob',
    phone: '(555) 010-4234',
  },
  {
    id: 5,
    name: { name: 'Carlos Rivera' },
    email: 'carlos@example.com',
    status: 'En Route',
    dispatcher: 'Alice',
    phone: '(555) 010-5234',
  },
  {
    id: 6,
    name: { name: 'Tom Nguyen' },
    email: 'tom@example.com',
    status: 'Available',
    dispatcher: 'Bob',
    phone: '(555) 010-6234',
  },
];
