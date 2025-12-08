"use client";

import {
    List,
    Datagrid,
    TextField,
    EditButton,
    TopToolbar,
    FilterButton,
    TextInput,
    FunctionField,
} from "react-admin";
import { Chip } from "@mui/material";

const settingsFilters = [
    <TextInput key="search" label="Search" source="q" alwaysOn />,
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
    </TopToolbar>
);

export const SettingsList = () => {
    return (
        <List
            filters={settingsFilters}
            actions={<ListActions />}
            title="System Settings"
            perPage={25}
        >
            <Datagrid rowClick="edit" bulkActionButtons={false}>
                <TextField source="id" label="ID" />
                <TextField source="category" label="Category" />
                <TextField source="key" label="Setting Key" />
                <TextField source="label" label="Label" />
                
                <FunctionField
                    label="Value"
                    render={(record: any) => {
                        if (typeof record.value === 'boolean') {
                            return <Chip label={record.value ? 'Enabled' : 'Disabled'} color={record.value ? 'success' : 'default'} size="small" />;
                        }
                        return <span>{String(record.value)}</span>;
                    }}
                />

                <TextField source="description" label="Description" />
                <EditButton />
            </Datagrid>
        </List>
    );
};

