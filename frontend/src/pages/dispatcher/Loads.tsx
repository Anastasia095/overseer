import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { assignmentsApi, AssignmentFilter, AssignmentLoad } from '../../api/assignments';
import { assignmentColumns } from '../../internals/data/assignmentGridData';

export default function Loads() {
  const [filter, setFilter] = useState<AssignmentFilter>(undefined);
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rows, setRows] = useState<AssignmentLoad[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (filterValue: AssignmentFilter, pm: GridPaginationModel) => {
    setLoading(true);
    setError(null);
    try {
      const res = await assignmentsApi.list({
        filter: filterValue,
        page: pm.page + 1,
        limit: pm.pageSize,
      });
      setRows(res.data);
      setRowCount(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loads');
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter, pagination);
  }, [load, filter, pagination]);

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, value: AssignmentFilter) => {
    const next = value ?? undefined;
    setFilter(next);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Loads
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              exclusive
              value={filter ?? ''}
              onChange={handleFilterChange}
              size="small"
              aria-label="Load status filter"
            >
              <ToggleButton value="">All</ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="completed">Completed</ToggleButton>
            </ToggleButtonGroup>
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Stack>

          <DataGrid
            rows={rows}
            columns={assignmentColumns}
            loading={loading}
            rowCount={rowCount}
            paginationMode="server"
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
            pageSizeOptions={[10, 20, 50]}
            disableColumnResize
            density="compact"
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
            }
            sx={{
              '& .even': { bgcolor: 'action.hover' },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}