import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

export default function CardAlert() {
  return (
    <Card variant="outlined" sx={{ m: 1.5, flexShrink: 0 }}>
      <CardContent>
        <WarningRoundedIcon fontSize="small" color="error" />
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          3 documents expiring soon
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Insurance and registration renewals are due within 60 days.
        </Typography>
        <Button variant="contained" size="small" fullWidth>
          Review expirations
        </Button>
      </CardContent>
    </Card>
  );
}
