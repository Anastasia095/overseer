import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CustomizedDataGrid from '../../components/dashboard/CustomizedDataGrid';
import { vehicleRows, vehicleColumns } from '../../internals/data/vehicleGridData';

export default function HrVehicles() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography component="h2" variant="h6">
            Vehicles
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage fleet vehicles, documents, and expirations
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddRoundedIcon />}>
          Add Vehicle
        </Button>
      </Stack>
      <CustomizedDataGrid rows={vehicleRows} columns={vehicleColumns} />
    </Box>
  );
}
