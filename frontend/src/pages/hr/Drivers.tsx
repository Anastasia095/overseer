import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DriverList from '../../components/DriverList';
import CreateUserDialog from '../../components/hr/CreateUserDialog';
import AssignDispatcherDialog from '../../components/hr/AssignDispatcherDialog';
import ManageVehiclesDialog from '../../components/hr/ManageVehiclesDialog';
import type { Driver } from '../../api/drivers';

export default function HrDrivers() {
  const [addOpen, setAddOpen] = useState(false);
  const [dispatcherTarget, setDispatcherTarget] = useState<Driver | null>(null);
  const [vehiclesTarget, setVehiclesTarget] = useState<Driver | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
      >
        <Box>
          <Typography component="h2" variant="h6">
            Drivers
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage driver accounts, dispatchers, and vehicles
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() => setAddOpen(true)}
        >
          Add Driver
        </Button>
      </Stack>

      <DriverList
        refreshKey={refreshKey}
        onAssignDispatcher={setDispatcherTarget}
        onManageVehicles={setVehiclesTarget}
      />

      <CreateUserDialog
        role="driver"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={refresh}
      />
      <AssignDispatcherDialog
        driver={dispatcherTarget}
        onClose={() => setDispatcherTarget(null)}
        onChanged={refresh}
      />
      <ManageVehiclesDialog
        driver={vehiclesTarget}
        onClose={() => setVehiclesTarget(null)}
        onChanged={refresh}
      />
    </Box>
  );
}
