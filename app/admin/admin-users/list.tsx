"use client";

import {
    Datagrid,
    List,
    TextField,
    FunctionField,
    ExportButton,
    TopToolbar,
    BulkDeleteButton,
    BulkExportButton,
    TextInput,
    SelectInput,
    Pagination,
    useUpdateMany,
    useRefresh,
    useNotify,
    Button,
    useListContext
} from "react-admin";
import { Chip, Avatar, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Person, Block, CheckCircle, AdminPanelSettings } from "@mui/icons-material";
import { useState } from "react";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";

const userFilters = [
    <TextInput source="userName" label="Search by name" alwaysOn />,
    <TextInput source="email" label="Search by email" />,
    <SelectInput source="status" label="Status" choices={[
        { id: 'active', name: 'Active' },
        { id: 'blocked', name: 'Blocked' },
        { id: 'suspended', name: 'Suspended' },
    ]} />,
    <SelectInput source="role" label="Role" choices={[
        { id: 'user', name: 'User' },
        { id: 'premium', name: 'Premium' },
    ]} />,
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

// Status change dialog component
const StatusChangeDialog = ({ open, onClose, selectedIds, action }: {
    open: boolean;
    onClose: () => void;
    selectedIds: string[];
    action: 'block' | 'unblock' | 'suspend';
}) => {
    const [updateMany] = useUpdateMany();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleConfirm = async () => {
        try {
            let status = 'active';
            if (action === 'block') status = 'blocked';
            if (action === 'suspend') status = 'suspended';

            await updateMany('admin-users', {
                ids: selectedIds,
                data: { status }
            });

            notify(`Users ${action}ed successfully`, { type: 'success' });

            refresh();
            onClose();
        } catch (error) {
            notify(`Error ${action}ing users`, { type: 'error' });
        }
    };

    const getActionText = () => {
        switch (action) {
            case 'block': return 'block';
            case 'unblock': return 'unblock';
            case 'suspend': return 'suspend';
            default: return action;
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm {getActionText()}</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to {getActionText()} {selectedIds.length} user(s)?
                    {action === 'block' && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'warning.main' }}>
                            Note: Admin accounts cannot be blocked and will be skipped.
                        </Typography>
                    )}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} color="primary" variant="contained">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Bulk action buttons
const UserBulkActionButtons = () => {
    const { selectedIds } = useListContext();
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                    startIcon={<Block />}
                    onClick={() => setBlockDialogOpen(true)}
                    disabled={selectedIds.length === 0}
                    color="error"
                    variant="outlined"
                    size="small"
                >
                    Block Users
                </Button>
                <Button
                    startIcon={<CheckCircle />}
                    onClick={() => setUnblockDialogOpen(true)}
                    disabled={selectedIds.length === 0}
                    color="success"
                    variant="outlined"
                    size="small"
                >
                    Unblock Users
                </Button>
                <Button
                    startIcon={<Person />}
                    onClick={() => setSuspendDialogOpen(true)}
                    disabled={selectedIds.length === 0}
                    color="warning"
                    variant="outlined"
                    size="small"
                >
                    Suspend Users
                </Button>
                <BulkExportButton />
                <BulkDeleteButton />
            </Box>

            <StatusChangeDialog
                open={blockDialogOpen}
                onClose={() => setBlockDialogOpen(false)}
                selectedIds={selectedIds}
                action="block"
            />
            <StatusChangeDialog
                open={unblockDialogOpen}
                onClose={() => setUnblockDialogOpen(false)}
                selectedIds={selectedIds}
                action="unblock"
            />
            <StatusChangeDialog
                open={suspendDialogOpen}
                onClose={() => setSuspendDialogOpen(false)}
                selectedIds={selectedIds}
                action="suspend"
            />
        </>
    );
};

export const AdminUserList = () => {
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
                                    {record.email}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                />
                <TextField source="userId" label="User ID" />
                <FunctionField
                    label="Role"
                    render={(record: any) => (
                        <Chip
                            label={record.role || 'user'}
                            color={record.role === 'premium' ? 'primary' : 'default'}
                            variant="outlined"
                            size="small"
                            icon={record.role === 'premium' ? <AdminPanelSettings /> : <Person />}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                />
                <FunctionField
                    label="Status"
                    render={(record: any) => (
                        <Chip
                            label={record.status || 'active'}
                            color={
                                record.status === 'active' ? 'success' :
                                    record.status === 'blocked' ? 'error' : 'warning'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                />
                <FunctionField
                    label="Country"
                    render={(record: any) => (
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {record.country || 'N/A'}
                        </Typography>
                    )}
                />
                <FunctionField
                    label="Created"
                    render={(record: any) => (
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                    )}
                />
                <FunctionField
                    label="Last Login"
                    render={(record: any) => (
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {record.lastLoginAt ? new Date(record.lastLoginAt).toLocaleDateString() : 'Never'}
                        </Typography>
                    )}
                />
            </Datagrid>
        </List>
    );
};
