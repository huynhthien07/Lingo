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
    BooleanInput,
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
import { Favorite, Stars, SwapHoriz, Block, CheckCircle } from "@mui/icons-material";
import { useState } from "react";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";

const userFilters = [
    <TextInput source="userName" label="Search by name" alwaysOn />,
    <BooleanInput source="blocked" label="Blocked users" />,
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

// Block/Unblock Users Dialog Component
const BlockUsersDialog = ({ open, onClose, selectedIds, action }: any) => {
    const [updateMany] = useUpdateMany();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleAction = async () => {
        try {
            await updateMany('users', {
                ids: selectedIds,
                data: { blocked: action === 'block' }
            });
            notify(`Successfully ${action}ed ${selectedIds.length} users`, { type: 'success' });
            refresh();
            onClose();
        } catch (error) {
            notify(`Error ${action}ing users`, { type: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {action === 'block' ? 'Block Users' : 'Unblock Users'}
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to {action} {selectedIds.length} selected users?
                    {action === 'block' && ' Blocked users will not be able to log in.'}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleAction}
                    variant="contained"
                    color={action === 'block' ? 'error' : 'success'}
                >
                    {action === 'block' ? 'Block' : 'Unblock'} {selectedIds.length} Users
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const UserBulkActionButtons = () => {
    const { selectedIds } = useListContext();
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
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
            <Button
                startIcon={<Block />}
                onClick={() => setBlockDialogOpen(true)}
                color="error"
                sx={{ mr: 1 }}
            >
                Block Users
            </Button>
            <Button
                startIcon={<CheckCircle />}
                onClick={() => setUnblockDialogOpen(true)}
                color="success"
                sx={{ mr: 1 }}
            >
                Unblock Users
            </Button>
            <BulkExportButton />
            <BulkDeleteButton />

            <TransferCourseDialog
                open={transferDialogOpen}
                onClose={() => setTransferDialogOpen(false)}
                selectedIds={selectedIds}
                courses={courses}
            />
            <BlockUsersDialog
                open={blockDialogOpen}
                onClose={() => setBlockDialogOpen(false)}
                selectedIds={selectedIds}
                action="block"
            />
            <BlockUsersDialog
                open={unblockDialogOpen}
                onClose={() => setUnblockDialogOpen(false)}
                selectedIds={selectedIds}
                action="unblock"
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
                <FunctionField
                    label="Status"
                    render={(record: any) => (
                        <Chip
                            label={record.blocked ? "Blocked" : "Active"}
                            color={record.blocked ? "error" : "success"}
                            size="small"
                            sx={{ fontWeight: 500 }}
                        />
                    )}
                />
            </Datagrid>
        </List>
    );
};
