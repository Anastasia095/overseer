import { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickerDay } from '@mui/x-date-pickers/PickerDay';
import type { PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import type { DriverVacation } from '../../api/drivers';

interface VacationCalendarProps {
  vacations: DriverVacation[];
  canEdit: boolean;
  onAdd?: (startDate: string, endDate: string) => Promise<void>;
  onUpdate?: (vacationId: number, startDate: string, endDate: string) => Promise<void>;
  onDelete?: (vacationId: number) => Promise<void>;
}

export default function VacationCalendar({
  vacations,
  canEdit,
  onAdd,
  onUpdate,
  onDelete,
}: VacationCalendarProps) {
  const [start, setStart] = useState<Dayjs | null>(dayjs().add(1, 'month').startOf('month'));
  const [end, setEnd] = useState<Dayjs | null>(
    dayjs().add(1, 'month').startOf('month').add(6, 'day'),
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const highlight = useMemo(() => {
    const ranges = vacations.map((v) => ({
      start: dayjs(v.startDate).startOf('day'),
      end: dayjs(v.endDate).endOf('day'),
    }));
    return (day: Dayjs) =>
      ranges.some((r) => !day.isBefore(r.start) && !day.isAfter(r.end));
  }, [vacations]);

  function VacationDay(props: PickerDayProps) {
    const isVacation = highlight(dayjs(props.day));
    if (!isVacation) {
      return <PickerDay {...props} />;
    }
    return (
      <PickerDay
        {...props}
        sx={{
          bgcolor: 'primary.main',
          color: '#fff',
          '&:hover, &.Mui-selected': {
            bgcolor: 'primary.dark',
          },
        }}
      />
    );
  }

  const valid = start !== null && end !== null && !start.isAfter(end);

  async function handleSubmit() {
    if (!valid) return;
    setBusy(true);
    try {
      const s = start.format('YYYY-MM-DD');
      const e = end!.format('YYYY-MM-DD');
      if (editingId != null) {
        await onUpdate?.(editingId, s, e);
      } else {
        await onAdd?.(s, e);
      }
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(v: DriverVacation) {
    setEditingId(v.id);
    setStart(dayjs(v.startDate));
    setEnd(dayjs(v.endDate));
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          component="h3"
          variant="subtitle1"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <BeachAccessRoundedIcon fontSize="small" />
          Planned Vacation
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: 'flex-start' }}
          >
            <DateCalendar
              showDaysOutsideCurrentMonth
              slots={{ day: VacationDay }}
              slotProps={{
                previousIconButton: { sx: { mr: -0.5 } },
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              {vacations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No vacation days planned.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {vacations.map((v) => (
                    <ListItem
                      key={v.id}
                      secondaryAction={
                        canEdit ? (
                          <Stack direction="row" spacing={0.5}>
                            <Button size="small" onClick={() => startEdit(v)}>
                              Edit
                            </Button>
                            <IconButton
                              edge="end"
                              aria-label="Delete vacation"
                              size="small"
                              onClick={() => onDelete?.(v.id)}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : undefined
                      }
                    >
                      <ListItemText
                        primary={`${dayjs(v.startDate).format('MMM D')} – ${dayjs(v.endDate).format('MMM D, YYYY')}`}
                        slotProps={{ primary: { variant: 'body2' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {canEdit && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Stack spacing={1.5}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <DatePicker
                        label="Start"
                        value={start}
                        onChange={setStart}
                        disablePast
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                      <DatePicker
                        label="End"
                        value={end}
                        onChange={setEnd}
                        disablePast
                        minDate={start ?? undefined}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleSubmit}
                        disabled={!valid || busy}
                      >
                        {editingId != null ? 'Save changes' : 'Add vacation'}
                      </Button>
                      {editingId != null && (
                        <Button size="small" onClick={() => setEditingId(null)} disabled={busy}>
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );
}
