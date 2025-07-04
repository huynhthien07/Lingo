import {
    Datagrid,
    List,
    TextField,
    ImageField,
    FunctionField,
    CreateButton,
    ExportButton,
    TopToolbar,
    TextInput
} from "react-admin";
import { Chip, Avatar } from "@mui/material";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";

const courseFilters = [
    <TextInput source="title" label="Search by title" alwaysOn />,
];

const CourseListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

export const CourseList = () => {
    // Enable auto-refresh functionality
    useAutoRefresh();
    useVisibilityRefresh();

    return (
        <List
            filters={courseFilters}
            actions={<CourseListActions />}
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
                <FunctionField
                    label="Course"
                    render={(record: any) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar
                                src={record.imageSrc}
                                sx={{ width: 40, height: 40 }}
                            />
                            <div>
                                <div style={{ fontWeight: 600, color: '#374151' }}>
                                    {record.title}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    Course ID: {record.id}
                                </div>
                            </div>
                        </div>
                    )}
                />
                <FunctionField
                    label="Status"
                    render={() => (
                        <Chip
                            label="Active"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 500 }}
                        />
                    )}
                />
                <ImageField
                    source="imageSrc"
                    label="Flag"
                    sx={{
                        '& img': {
                            width: 32,
                            height: 24,
                            borderRadius: 1,
                            objectFit: 'cover',
                        },
                    }}
                />
            </Datagrid>
        </List>
    );
};