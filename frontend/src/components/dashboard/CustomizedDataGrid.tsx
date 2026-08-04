import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';

interface CustomizedDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  checkboxSelection?: boolean;
  loading?: boolean;
}

export default function CustomizedDataGrid({
  rows,
  columns,
  checkboxSelection = true,
  loading = false,
}: CustomizedDataGridProps) {
  return (
    <DataGrid
      checkboxSelection={checkboxSelection}
      loading={loading}
      rows={rows}
      columns={columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
      }}
      pageSizeOptions={[10, 20, 50]}
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
}
