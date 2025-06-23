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
    SelectInput
} from "react-admin";
import { Chip, Avatar, Box, Typography } from "@mui/material";
import { Favorite, Stars } from "@mui/icons-material";

const userFilters = [
    <TextInput source="userName" label="Search by name" alwaysOn />,
    <BooleanInput source="blocked" label="Blocked users" />,
    <ReferenceInput source="activeCourseId" reference="courses" label="Course">
        <SelectInput optionText="title" />
    </ReferenceInput>,
];

const UserListActions = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

const UserBulkActionButtons = () => (
    <>
        <BulkExportButton />
        <BulkDeleteButton />
    </>
);

export const UserList = () => {
    return (
        <List
            filters={userFilters}
            actions={<UserListActions />}
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
