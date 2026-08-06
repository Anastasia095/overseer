import { GridColDef } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type VehicleOwnership = 'OWNER_OPERATOR' | 'LEASED';

const statusColors: Record<VehicleStatus, 'success' | 'info' | 'warning' | 'error'> = {
  AVAILABLE: 'success',
  IN_USE: 'info',
  MAINTENANCE: 'warning',
  OUT_OF_SERVICE: 'error',
};

const statusLabels: Record<VehicleStatus, string> = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'Out of Service',
};

const ownershipLabels: Record<VehicleOwnership, string> = {
  OWNER_OPERATOR: 'Owner-Operator',
  LEASED: 'Leased',
};

export const vehicleColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Vehicle',
    flex: 1.5,
    minWidth: 180,
    renderCell: (params) => (
      <span style={{ fontWeight: 500 }}>
        {params.row.year} {params.row.make} {params.row.model}
      </span>
    ),
  },
  { field: 'plate', headerName: 'Plate', flex: 0.5, minWidth: 90 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.5,
    minWidth: 120,
    renderCell: (params) => (
      <Chip
        label={params.value ? statusLabels[params.value as VehicleStatus] : '—'}
        size="small"
        color={params.value ? statusColors[params.value as VehicleStatus] : 'default'}
      />
    ),
  },
  {
    field: 'ownership',
    headerName: 'Ownership',
    flex: 0.6,
    minWidth: 130,
    renderCell: (params) => (
      <Chip
        label={params.value ? ownershipLabels[params.value as VehicleOwnership] : '—'}
        size="small"
        variant="outlined"
        color={params.value === 'OWNER_OPERATOR' ? 'primary' : 'default'}
      />
    ),
  },
  {
    field: 'owner',
    headerName: 'Owner',
    flex: 1,
    minWidth: 130,
    renderCell: (params) => params.row.ownerName ?? 'Company',
  },
  { field: 'vin', headerName: 'VIN', flex: 1, minWidth: 140 },
];
