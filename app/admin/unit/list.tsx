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
    TopToolbar
} from "react-admin";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";

const unitFilters = [
    <TextInput source="title" label="Search by title" alwaysOn />,
    <TextInput source="description" label="Search description" />,
    <ReferenceInput source="courseId" reference="courses" label="Course">
        <SelectInput optionText="title" />
    </ReferenceInput>,
];

const UnitListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

export const UnitList = () => {
    // Enable auto-refresh functionality
    useAutoRefresh();
    useVisibilityRefresh();

    return (
        <List
            filters={unitFilters}
            actions={<UnitListActions />}
            sx={{
                '& .RaList-main': {
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Datagrid
                rowClick="edit"
                sx={{
                    '& .RaDatagrid-headerRow': {
                        '& .RaDatagrid-headerCell': {
                            fontWeight: 600,
                        },
                    },
                }}
            >
                <TextField source="id" label="ID" />
                <TextField source="title" label="Title" />
                <TextField source="description" label="Description" />
                <ReferenceField source="courseId" reference="courses" label="Course">
                    <TextField source="title" />
                </ReferenceField>
                <NumberField source="order" label="Order" />
            </Datagrid>
        </List>
    )
}