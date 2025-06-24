"use client";

import {
    Datagrid,
    List,
    TextField,
    NumberField,
    BooleanField,
    ImageField,
    ReferenceField,
    FunctionField,
    ExportButton,
    TopToolbar,
    BulkDeleteButton,
    BulkExportButton,
    TextInput,

    ReferenceInput,
    SelectInput,
    Pagination,
    useUpdateMany,
    useRefresh,
    useNotify,
    Button,
    useListContext
} from "react-admin";
import { Chip, Avatar, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Favorite, Stars, SwapHoriz } from "@mui/icons-material";
import { useState } from "react";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";

// Admin user IDs that cannot be blocked
const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
];

const userFilters = [
    <TextInput source="userName" label="Search by name" alwaysOn />,
    <ReferenceInput source="activeCourseId" reference="courses" label="Course">
        <SelectInput optionText="title" />
    </ReferenceInput>,
];

// Custom pagination component with per-page options
const UserPagination = () => (
    <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
);

const UserListActions = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

// Transfer Course Dialog Component
const TransferCourseDialog = ({ open, onClose, selectedIds, courses }: any) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [updateMany] = useUpdateMany();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleTransfer = async () => {
        try {
            await updateMany('users', {
                ids: selectedIds,
                data: { activeCourseId: selectedCourse ? parseInt(selectedCourse) : null }
            });
            notify(`Successfully transferred ${selectedIds.length} users to new course`, { type: 'success' });
            refresh();
            onClose();
        } catch (error) {
            notify('Error transferring users', { type: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Transfer Users to Course</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Select Course</InputLabel>
                    <Select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        label="Select Course"
                    >
                        <MenuItem value="">No Course</MenuItem>
                        {courses?.map((course: any) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleTransfer} variant="contained">
                    Transfer {selectedIds.length} Users
                </Button>
            </DialogActions>
        </Dialog>
    );
};



const UserBulkActionButtons = () => {
    const { selectedIds } = useListContext();
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [courses, setCourses] = useState([]);

    // Fetch courses for transfer dialog
    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleTransferClick = () => {
        fetchCourses();
        setTransferDialogOpen(true);
    };

    return (
        <>
            <Button
                startIcon={<SwapHoriz />}
                onClick={handleTransferClick}
                sx={{ mr: 1 }}
            >
                Transfer Course
            </Button>
            <BulkExportButton />
            <BulkDeleteButton />

            <TransferCourseDialog
                open={transferDialogOpen}
                onClose={() => setTransferDialogOpen(false)}
                selectedIds={selectedIds}
                courses={courses}
            />
        </>
    );
};

export const UserList = () => {
    // Enable auto-refresh functionality
    useAutoRefresh();
    useVisibilityRefresh();

    return (
        <List
            filters={userFilters}
            actions={<UserListActions />}
            pagination={<UserPagination />}
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
                bulkActionButtons={<UserBulkActionButtons />}
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
                <FunctionField
                    label="User"
                    render={(record: any) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                src={record.userImageSrc}
                                sx={{ width: 40, height: 40 }}
                            >
                                {record.userName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                                    {record.userName || 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    ID: {record.userId}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                />
                <ReferenceField
                    source="activeCourseId"
                    reference="courses"
                    label="Active Course"
                    sx={{ '& .RaReferenceField-link': { textDecoration: 'none' } }}
                >
                    <FunctionField
                        render={(record: any) => (
                            <Chip
                                label={record?.title || 'No Course'}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        )}
                    />
                </ReferenceField>
                <FunctionField
                    label="Hearts"
                    render={(record: any) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Favorite sx={{ color: '#ef4444', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {record.hearts || 0}
                            </Typography>
                        </Box>
                    )}
                />
                <FunctionField
                    label="Points"
                    render={(record: any) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Stars sx={{ color: '#f59e0b', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {record.points || 0}
                            </Typography>
                        </Box>
                    )}
                />

            </Datagrid>
        </List>
    );
};
