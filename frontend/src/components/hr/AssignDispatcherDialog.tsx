import { useEffect, useState } from 'react';
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
import Typography from '@mui/material/Typography';
import { driversApi } from '../../api/drivers';
import { dispatchersApi } from '../../api/dispatchers';
import type { Driver } from '../../api/drivers';
import type { Dispatcher } from '../../api/dispatchers';

interface AssignDispatcherDialogProps {
  driver: Driver | null;
  onClose: () => void;
  onChanged: () => void;
}

export default function AssignDispatcherDialog({
  driver,
  onClose,
  onChanged,
}: AssignDispatcherDialogProps) {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [dispatcherId, setDispatcherId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driver) return;
    setDispatcherId(driver.dispatcherId ? String(driver.dispatcherId) : '');
    setError(null);
    dispatchersApi.list().then(setDispatchers).catch(() => setDispatchers([]));
  }, [driver]);

  const handleSave = async () => {
    if (!driver) return;
    setSubmitting(true);
    setError(null);
    try {
      await driversApi.updateDispatcher(
        driver.id,
        dispatcherId ? Number(dispatcherId) : null,
      );
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign dispatcher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={driver !== null} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Assign Dispatcher</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {driver?.name}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            fullWidth
            label="Dispatcher"
            size="small"
            value={dispatcherId}
            onChange={(e) => setDispatcherId(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {dispatchers.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
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
