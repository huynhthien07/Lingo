import {
    BooleanField,
    Datagrid,
    List,
    ReferenceField,
    TextField,
    TextInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    CreateButton,
    ExportButton,
    TopToolbar,
    Pagination
} from "react-admin";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";

const challengeOptionFilters = [
    <TextInput source="text" label="Search by text" alwaysOn />,
    <BooleanInput source="correct" label="Correct answers only" />,
    <ReferenceInput source="challengeId" reference="challenges" label="Challenge">
        <SelectInput optionText="question" />
    </ReferenceInput>,
];

// Custom pagination component with per-page options
const ChallengeOptionPagination = () => (
    <Pagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        showFirstButton
        showLastButton
    />
);

const ChallengeOptionListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

export const ChallengeOptionList = () => {
    // Enable auto-refresh functionality
    useAutoRefresh();
    useVisibilityRefresh();

    return (
        <List
            filters={challengeOptionFilters}
            actions={<ChallengeOptionListActions />}
            perPage={25}
            pagination={<ChallengeOptionPagination />}
            sx={{
                '& .RaList-main': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
                '& .RaList-pagination': {
                    display: 'flex !important',
                    visibility: 'visible !important',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderTop: '1px solid #e0e0e0',
                },
            }}
        >
            <Datagrid
                rowClick="edit"
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
                <TextField source="text" label="Option Text" />
                <BooleanField source="correct" label="Correct" />
                <ReferenceField source="challengeId" reference="challenges" label="Challenge">
                    <TextField source="question" />
                </ReferenceField>
                <TextField source="imageSrc" label="Image" />
                <TextField source="audioSrc" label="Audio" />
            </Datagrid>
        </List>
    )
}