import {
    Datagrid,
    List,
    NumberField,
    ReferenceField,
    SelectField,
    TextField,
    FunctionField,
    CreateButton,
    ExportButton,
    TopToolbar,
    TextInput,
    SelectInput,
    ReferenceInput
} from "react-admin";
import { Chip, Box, Typography } from "@mui/material";
import { Quiz, VolumeUp, MenuBook, Spellcheck } from "@mui/icons-material";

const challengeFilters = [
    <TextInput source="question" label="Search question" alwaysOn />,
    <SelectInput source="type" label="Type" choices={[
        { id: 'GRAMMAR', name: 'Grammar' },
        { id: 'VOCABULARY', name: 'Vocabulary' },
        { id: 'LISTENING', name: 'Listening' },
        { id: 'READING', name: 'Reading' },
    ]} />,
    <ReferenceInput source="lessonId" reference="lessons" label="Lesson">
        <SelectInput optionText="title" />
    </ReferenceInput>,
];

const ChallengeListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'GRAMMAR': return <Spellcheck sx={{ fontSize: 16 }} />;
        case 'VOCABULARY': return <MenuBook sx={{ fontSize: 16 }} />;
        case 'LISTENING': return <VolumeUp sx={{ fontSize: 16 }} />;
        case 'READING': return <Quiz sx={{ fontSize: 16 }} />;
        default: return <Quiz sx={{ fontSize: 16 }} />;
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'GRAMMAR': return '#1976d2';
        case 'VOCABULARY': return '#2e7d32';
        case 'LISTENING': return '#ed6c02';
        case 'READING': return '#9c27b0';
        default: return '#666';
    }
};

export const ChallengeList = () => {
    return (
        <List
            filters={challengeFilters}
            actions={<ChallengeListActions />}
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
                <FunctionField
                    label="Question"
                    render={(record: any) => (
                        <Box sx={{ maxWidth: 300 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 500,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {record.question}
                            </Typography>
                        </Box>
                    )}
                />
                <FunctionField
                    label="Type"
                    render={(record: any) => (
                        <Chip
                            icon={getTypeIcon(record.type)}
                            label={record.type}
                            size="small"
                            sx={{
                                backgroundColor: getTypeColor(record.type),
                                color: 'white',
                                fontWeight: 500,
                                '& .MuiChip-icon': {
                                    color: 'white',
                                },
                            }}
                        />
                    )}
                />
                <ReferenceField
                    source="lessonId"
                    reference="lessons"
                    label="Lesson"
                    sx={{ '& .RaReferenceField-link': { textDecoration: 'none' } }}
                >
                    <TextField source="title" />
                </ReferenceField>
                <FunctionField
                    label="Order"
                    render={(record: any) => (
                        <Chip
                            label={`#${record.order}`}
                            variant="outlined"
                            size="small"
                            color="primary"
                        />
                    )}
                />
            </Datagrid>
        </List>
    );
};