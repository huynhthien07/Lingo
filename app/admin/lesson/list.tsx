import {
    Datagrid,
    List,
    NumberField,
    ReferenceField,
    TextField,
    TextInput,
    ReferenceInput,
    SelectInput,
    CreateButton,
    ExportButton,
    TopToolbar,
    Pagination,
    useUpdateMany,
    useRefresh,
    useNotify,
    Button,
    useListContext,
    BulkExportButton,
    BulkDeleteButton
} from "react-admin";
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import { useState } from "react";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";

const lessonFilters = [
    <TextInput source="title" label="Search by title" alwaysOn />,
    <ReferenceInput source="unitId" reference="units" label="Unit">
        <SelectInput optionText="title" />
    </ReferenceInput>,
];

// Custom pagination component with per-page options
const LessonPagination = () => (
    <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
);

const LessonListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

// Transfer Unit Dialog Component
const TransferUnitDialog = ({ open, onClose, selectedIds, units }: any) => {
    const [selectedUnit, setSelectedUnit] = useState('');
    const [updateMany] = useUpdateMany();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleTransfer = async () => {
        try {
            await updateMany('lessons', {
                ids: selectedIds,
                data: { unitId: selectedUnit ? parseInt(selectedUnit) : null }
            });
            notify(`Successfully transferred ${selectedIds.length} lessons to new unit`, { type: 'success' });
            refresh();
            onClose();
        } catch (error) {
            notify('Error transferring lessons', { type: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Transfer Lessons to Unit</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Select Unit</InputLabel>
                    <Select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        label="Select Unit"
                    >
                        {units?.map((unit: any) => (
                            <MenuItem key={unit.id} value={unit.id}>
                                {unit.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleTransfer} variant="contained">
                    Transfer {selectedIds.length} Lessons
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const LessonBulkActionButtons = () => {
    const { selectedIds } = useListContext();
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [units, setUnits] = useState([]);

    // Fetch units for transfer dialog
    const fetchUnits = async () => {
        try {
            const response = await fetch('/api/units');
            const data = await response.json();
            setUnits(data);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const handleTransferClick = () => {
        fetchUnits();
        setTransferDialogOpen(true);
    };

    return (
        <>
            <Button
                startIcon={<SwapHoriz />}
                onClick={handleTransferClick}
                sx={{ mr: 1 }}
            >
                Transfer Unit
            </Button>
            <BulkExportButton />
            <BulkDeleteButton />

            <TransferUnitDialog
                open={transferDialogOpen}
                onClose={() => setTransferDialogOpen(false)}
                selectedIds={selectedIds}
                units={units}
            />
        </>
    );
};

export const LessonList = () => {
    // Enable auto-refresh functionality
    useAutoRefresh();
    useVisibilityRefresh();

    return (
        <List
            filters={lessonFilters}
            actions={<LessonListActions />}
            pagination={<LessonPagination />}
            perPage={25}
            sx={{
                '& .RaList-main': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Datagrid
                rowClick="edit"
                bulkActionButtons={<LessonBulkActionButtons />}
                sx={{
                    '& .RaDatagrid-headerRow': {
                        backgroundColor: '#f8fafc',
                        '& .RaDatagrid-headerCell': {
                            fontWeight: 600,
                            color: '#374151',
                        },
                    },
                    '& .RaDatagrid-row:hover': {
                        backgroundColor: '#f8fafc',
                    },
                }}
            >
                <TextField source="id" label="ID" />
                <TextField source="title" label="Title" />
                <ReferenceField source="unitId" reference="units" label="Unit">
                    <TextField source="title" />
                </ReferenceField>
                <NumberField source="order" label="Order" />
            </Datagrid>
        </List>
    )
}