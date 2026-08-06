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
import { authApi } from '../../api/auth';
import { dispatchersApi } from '../../api/dispatchers';
import type { Dispatcher } from '../../api/dispatchers';

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  licenseNo: '',
  licenseClass: '',
  licenseExpiry: '',
  dispatcherId: '',
};

interface CreateUserDialogProps {
  role: 'driver' | 'dispatcher';
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUserDialog({
  role,
  open,
  onClose,
  onCreated,
}: CreateUserDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setError(null);
    if (role === 'driver') {
      dispatchersApi.list().then(setDispatchers).catch(() => setDispatchers([]));
    }
  }, [open, role]);

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await authApi.register({
        role,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        ...(role === 'driver'
          ? {
              licenseNo: form.licenseNo,
              licenseClass: form.licenseClass,
              licenseExpiry: form.licenseExpiry,
              dispatcherId: form.dispatcherId ? Number(form.dispatcherId) : null,
            }
          : {}),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add {role === 'driver' ? 'Driver' : 'Dispatcher'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="First name"
                required
                size="small"
                value={form.firstName}
                onChange={set('firstName')}
              />
              <TextField
                fullWidth
                label="Last name"
                required
                size="small"
                value={form.lastName}
                onChange={set('lastName')}
              />
            </Stack>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              size="small"
              value={form.email}
              onChange={set('email')}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                required
                size="small"
                value={form.password}
                onChange={set('password')}
              />
              <TextField
                fullWidth
                label="Phone"
                size="small"
                value={form.phone}
                onChange={set('phone')}
              />
            </Stack>
            {role === 'driver' && (
              <>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="License No."
                    required
                    size="small"
                    value={form.licenseNo}
                    onChange={set('licenseNo')}
                  />
                  <TextField
                    fullWidth
                    label="License Class"
                    required
                    size="small"
                    value={form.licenseClass}
                    onChange={set('licenseClass')}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="License Expiry"
                    type="date"
                    required
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.licenseExpiry}
                    onChange={set('licenseExpiry')}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Dispatcher"
                    size="small"
                    value={form.dispatcherId}
                    onChange={set('dispatcherId')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {dispatchers.map((d) => (
                      <MenuItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
