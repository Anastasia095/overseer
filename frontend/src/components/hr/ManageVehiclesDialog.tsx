import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { driversApi } from '../../api/drivers';
import { vehiclesApi } from '../../api/vehicles';
import type { Driver } from '../../api/drivers';
import type { Vehicle } from '../../api/vehicles';

interface ManageVehiclesDialogProps {
  driver: Driver | null;
  onClose: () => void;
  onChanged: () => void;
}

export default function ManageVehiclesDialog({
  driver,
  onClose,
  onChanged,
}: ManageVehiclesDialogProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driver) return;
    setSelected(driver.vehicleIds);
    setError(null);
    setLoading(true);
    vehiclesApi
      .list()
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [driver]);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSave = async () => {
    if (!driver) return;
    setSubmitting(true);
    setError(null);
    try {
      await driversApi.updateVehicles(driver.id, selected);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicles');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={driver !== null} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Manage Vehicles</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {driver?.name}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {loading && <CircularProgress size={20} />}
          {vehicles.map((v) => (
            <FormControlLabel
              key={v.id}
              control={
                <Checkbox
                  checked={selected.includes(v.id)}
                  onChange={() => toggle(v.id)}
                />
              }
              label={`${v.year} ${v.make} ${v.model} (${v.plate})`}
            />
          ))}
          {!loading && vehicles.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No vehicles yet.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting ? <CircularProgress size={18} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
