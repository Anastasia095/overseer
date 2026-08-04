import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export type VehicleStatus = 'Active' | 'Out of Service' | 'Pending Inspection';

const statusColors: Record<VehicleStatus, 'success' | 'error' | 'warning'> = {
  Active: 'success',
  'Out of Service': 'error',
  'Pending Inspection': 'warning',
};

function isExpired(date: string) {
  return new Date(date) < new Date();
}

export const vehicleColumns: GridColDef[] = [
  {
    field: 'vehicle',
    headerName: 'Vehicle',
    flex: 1.5,
    minWidth: 180,
    renderCell: (params) => (
      <span style={{ fontWeight: 500 }}>
        {params.value.year} {params.value.make} {params.value.model}
      </span>
    ),
  },
  { field: 'plate', headerName: 'Plate', flex: 0.5, minWidth: 90 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.5,
    minWidth: 140,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={statusColors[params.value as VehicleStatus]}
      />
    ),
  },
  { field: 'vin', headerName: 'VIN', flex: 1, minWidth: 140 },
  {
    field: 'insuranceExp',
    headerName: 'Insurance Expiry',
    flex: 0.7,
    minWidth: 140,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        variant="outlined"
        color={isExpired(params.value) ? 'error' : 'default'}
      />
    ),
  },
  {
    field: 'registrationExp',
    headerName: 'Registration Expiry',
    flex: 0.7,
    minWidth: 150,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        variant="outlined"
        color={isExpired(params.value) ? 'error' : 'default'}
      />
    ),
  },
];

export const vehicleRows: GridRowsProp = [
  {
    id: 1,
    vehicle: { make: 'Freightliner', model: 'Cascadia', year: 2022 },
    plate: 'ABC-1234',
    status: 'Active',
    vin: '1FUJGLD58DLBA0001',
    insuranceExp: '2026-12-31',
    registrationExp: '2026-08-15',
  },
  {
    id: 2,
    vehicle: { make: 'Kenworth', model: 'T680', year: 2023 },
    plate: 'XYZ-5678',
    status: 'Active',
    vin: '1XKYDP9X9LJ000002',
    insuranceExp: '2026-11-15',
    registrationExp: '2026-05-01',
  },
  {
    id: 3,
    vehicle: { make: 'Peterbilt', model: '579', year: 2021 },
    plate: 'DEF-9012',
    status: 'Out of Service',
    vin: '1XP5DB9X5LD000003',
    insuranceExp: '2025-08-01',
    registrationExp: '2025-08-01',
  },
  {
    id: 4,
    vehicle: { make: 'Volvo', model: 'VNL 860', year: 2024 },
    plate: 'GHI-3456',
    status: 'Active',
    vin: '4V4NC9EJ2RN000004',
    insuranceExp: '2027-03-20',
    registrationExp: '2027-01-10',
  },
  {
    id: 5,
    vehicle: { make: 'Mack', model: 'Anthem', year: 2020 },
    plate: 'JKL-7890',
    status: 'Pending Inspection',
    vin: '1M1AN4GY6LM000005',
    insuranceExp: '2026-02-01',
    registrationExp: '2026-02-01',
  },
];
