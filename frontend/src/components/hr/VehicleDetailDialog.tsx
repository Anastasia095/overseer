import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Vehicle } from '../../api/vehicles';

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Available',
  OUT_OF_SERVICE: 'Out of Service',
};

const ownershipLabels: Record<string, string> = {
  OWNER_OPERATOR: 'Owner-Operator',
  LEASED: 'Leased',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Stack>
  );
}

interface VehicleDetailDialogProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export default function VehicleDetailDialog({
  vehicle,
  onClose,
}: VehicleDetailDialogProps) {
  return (
    <Dialog open={vehicle !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Vehicle Details</DialogTitle>
      <DialogContent>
        {vehicle && (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography variant="h6">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Typography>
            <Divider />
            <Row label="Plate" value={vehicle.plate} />
            <Row label="VIN" value={vehicle.vin} />
            <Row label="Status" value={statusLabels[vehicle.status] ?? vehicle.status} />
            <Row
              label="Ownership"
              value={ownershipLabels[vehicle.ownership] ?? vehicle.ownership}
            />
            <Row label="Owner" value={vehicle.ownerName ?? 'Company'} />
            <Divider />
            <Typography variant="subtitle2">Associated Drivers</Typography>
            {vehicle.drivers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                None
              </Typography>
            ) : (
              vehicle.drivers.map((d) => (
                <Typography key={d.id} variant="body2">
                  {d.name}
                </Typography>
              ))
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
