import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { driversApi, DriverProfile, DriverVehicleDetail } from '../../api/drivers';
import { driverStatusColors, driverStatusLabels, DriverStatus } from '../../internals/data/driverGridData';
import VacationCalendar from '../../components/drivers/VacationCalendar';
import { useAuth } from '../../context/AuthContext';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

function VehicleCard({ vehicle }: { vehicle: DriverVehicleDetail }) {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={vehicle.status.replace(/_/g, ' ')}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
          <Detail label="Plate" value={vehicle.plate} />
          <Detail label="VIN" value={vehicle.vin} />
          <Detail label="Ownership" value={vehicle.ownership.replace(/_/g, ' ')} />
          <Detail label="Owner" value={vehicle.ownerName ?? 'Company'} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Driver({ driverId: forcedId }: { driverId?: number }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const parsed = Number(id);
    const driverId = forcedId ?? (Number.isInteger(parsed) ? parsed : 0);
    driversApi
      .get(driverId)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Driver not found');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, forcedId, reloadKey]);

  useEffect(() => {
    if (!profile) return;
    if (profile.lastLat === null || profile.lastLng === null) return;
    if (profile.lastLocationLabel) {
      setLocationLabel(profile.lastLocationLabel);
      return;
    }
    let active = true;
    driversApi
      .resolveAddress(profile.id)
      .then((res) => {
        if (active && res.address) setLocationLabel(res.address);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [profile]);

  const canEditVacations =
    !!user && (user.roles.includes('dispatcher') || user.roles.includes('admin') || user.roles.includes('driver'));

  async function handleAddVacation(startDate: string, endDate: string) {
    if (!profile) return;
    await driversApi.createVacation(profile.id, { startDate, endDate });
    setReloadKey((k) => k + 1);
  }

  async function handleUpdateVacation(vacationId: number, startDate: string, endDate: string) {
    if (!profile) return;
    await driversApi.updateVacation(profile.id, vacationId, { startDate, endDate });
    setReloadKey((k) => k + 1);
  }

  async function handleDeleteVacation(vacationId: number) {
    if (!profile) return;
    await driversApi.deleteVacation(profile.id, vacationId);
    setReloadKey((k) => k + 1);
  }

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !profile) {
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <IconButton aria-label="Go back" onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Alert severity="error" action={<Button onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>}>
          {error ?? 'Driver not found'}
        </Alert>
      </Stack>
    );
  }

  const status = (profile.status as DriverStatus) ?? 'OFFLINE';

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <IconButton aria-label="Go back" onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography component="h2" variant="h6">
          Driver Profile
        </Typography>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, fontSize: '1.5rem', bgcolor: 'primary.main' }}>
              {profile.name.toUpperCase().substring(0, 1)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography component="h3" variant="h6">
                {profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
            </Box>
            <Chip
              label={driverStatusLabels[status] ?? status}
              color={driverStatusColors[status] ?? 'default'}
            />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Detail label="Email" value={profile.email} />
                <Detail label="Phone" value={profile.phone ?? '—'} />
                <Detail label="Driver since" value={formatDate(profile.createdAt)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Detail label="License number" value={profile.licenseNo ?? '—'} />
                <Detail label="License class" value={profile.licenseClass ?? '—'} />
                <Detail label="License expiry" value={formatDate(profile.licenseExpiry)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Detail label="Dispatcher" value={profile.dispatcher ?? 'Unassigned'} />
                <Detail label="Status" value={status} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Detail
                  label="Location"
                  value={
                    locationLabel ??
                    (profile.lastLat !== null && profile.lastLng !== null
                      ? `${profile.lastLat.toFixed(4)}, ${profile.lastLng.toFixed(4)}`
                      : '—')
                  }
                />
                <Detail label="Reported" value={formatDateTime(profile.lastLocationAt)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography component="h3" variant="subtitle1" sx={{ mb: 1 }}>
          Vehicles
        </Typography>
        {profile.vehicles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No vehicles assigned yet.
          </Typography>
        ) : (
          profile.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <VacationCalendar
          vacations={profile.vacations}
          canEdit={canEditVacations}
          onAdd={handleAddVacation}
          onUpdate={handleUpdateVacation}
          onDelete={handleDeleteVacation}
        />
      </Box>
    </Box>
  );
}
