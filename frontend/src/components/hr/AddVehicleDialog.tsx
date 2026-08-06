import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { vehiclesApi } from '../../api/vehicles';
import type { VehicleOwnership, VehicleStatus } from '../../api/vehicles';
import { driversApi } from '../../api/drivers';
import type { Driver } from '../../api/drivers';

const EMPTY = {
  make: '',
  model: '',
  year: '',
  vin: '',
  plate: '',
  status: 'AVAILABLE',
  ownership: 'LEASED',
  ownerDriverId: '',
};

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddVehicleDialog({
  open,
  onClose,
  onCreated,
}: AddVehicleDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setError(null);
    driversApi.list().then(setDrivers).catch(() => setDrivers([]));
  }, [open]);

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await vehiclesApi.create({
        make: form.make,
        model: form.model,
        year: Number(form.year),
        vin: form.vin,
        plate: form.plate,
        status: form.status as VehicleStatus,
        ownership: form.ownership as VehicleOwnership,
        ownerDriverId: form.ownerDriverId ? Number(form.ownerDriverId) : null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Vehicle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Make"
                required
                size="small"
                value={form.make}
                onChange={set('make')}
              />
              <TextField
                fullWidth
                label="Model"
                required
                size="small"
                value={form.model}
                onChange={set('model')}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Year"
                required
                type="number"
                size="small"
                value={form.year}
                onChange={set('year')}
              />
              <TextField
                fullWidth
                label="Plate"
                required
                size="small"
                value={form.plate}
                onChange={set('plate')}
              />
            </Stack>
            <TextField
              fullWidth
              label="VIN"
              required
              size="small"
              value={form.vin}
              onChange={set('vin')}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                fullWidth
                label="Status"
                size="small"
                value={form.status}
                onChange={set('status')}
              >
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="IN_USE">In Use</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="OUT_OF_SERVICE">Out of Service</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Ownership"
                size="small"
                value={form.ownership}
                onChange={set('ownership')}
              >
                <MenuItem value="LEASED">Leased</MenuItem>
                <MenuItem value="OWNER_OPERATOR">Owner-Operator</MenuItem>
              </TextField>
            </Stack>
            {form.ownership === 'OWNER_OPERATOR' && (
              <TextField
                select
                fullWidth
                label="Owner Driver"
                required
                size="small"
                value={form.ownerDriverId}
                onChange={set('ownerDriverId')}
              >
                {drivers.map((d) => (
                  <MenuItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
