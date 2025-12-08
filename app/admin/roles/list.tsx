"use client";

import {
    List,
    Datagrid,
    TextField,
    ChipField,
    FunctionField,
    EditButton,
    TopToolbar,
    ExportButton,
    FilterButton,
    TextInput,
} from "react-admin";
import { Box, Chip } from "@mui/material";

const roleFilters = [
    <TextInput key="search" label="Search" source="q" alwaysOn />,
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <ExportButton />
    </TopToolbar>
);

export const RoleList = () => {
    return (
        <List
            filters={roleFilters}
            actions={<ListActions />}
            title="Role & Permission Management"
            perPage={25}
        >
            <Datagrid rowClick="edit" bulkActionButtons={false}>
                <TextField source="id" label="ID" />
                <TextField source="name" label="Role Name" />
                <TextField source="description" label="Description" />
                
                <FunctionField
                    label="Permissions"
                    render={(record: any) => (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {record.permissions?.slice(0, 3).map((perm: string, index: number) => (
                                <Chip
                                    key={index}
                                    label={perm}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                            {record.permissions?.length > 3 && (
                                <Chip
                                    label={`+${record.permissions.length - 3} more`}
                                    size="small"
                                    color="default"
                                />
                            )}
                        </Box>
                    )}
                />

                <FunctionField
                    label="User Count"
                    render={(record: any) => (
                        <Chip
                            label={record.userCount || 0}
                            size="small"
                            color="secondary"
                        />
                    )}
                />

                <ChipField source="status" label="Status" />
                <EditButton />
            </Datagrid>
        </List>
    );
};

