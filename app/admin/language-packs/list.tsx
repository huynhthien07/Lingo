"use client";

import {
    List,
    Datagrid,
    TextField,
    ChipField,
    FunctionField,
    EditButton,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton,
    TextInput,
    SelectInput,
    DateField,
} from "react-admin";
import { Box, Chip, Avatar } from "@mui/material";

const languageFilters = [
    <TextInput key="search" label="Search" source="q" alwaysOn />,
    <SelectInput
        key="status"
        label="Status"
        source="status"
        choices={[
            { id: 'active', name: 'Active' },
            { id: 'draft', name: 'Draft' },
            { id: 'archived', name: 'Archived' },
        ]}
    />,
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

const LanguageFlag = ({ code }: { code: string }) => {
    const flags: any = {
        'en': '🇬🇧',
        'vi': '🇻🇳',
        'es': '🇪🇸',
        'fr': '🇫🇷',
        'de': '🇩🇪',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'ja': '🇯🇵',
        'ko': '🇰🇷',
        'zh': '🇨🇳',
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '1.5rem' }}>{flags[code] || '🌐'}</span>
        </Box>
    );
};

export const LanguagePackList = () => {
    return (
        <List
            filters={languageFilters}
            actions={<ListActions />}
            title="Language Pack Management"
            perPage={25}
        >
            <Datagrid rowClick="edit" bulkActionButtons={false}>
                <FunctionField
                    label="Flag"
                    render={(record: any) => <LanguageFlag code={record.code} />}
                />
                
                <TextField source="code" label="Code" />
                <TextField source="name" label="Language Name" />
                <TextField source="nativeName" label="Native Name" />
                
                <FunctionField
                    label="Translation Progress"
                    render={(record: any) => {
                        const progress = record.translationProgress || 0;
                        const color = progress >= 90 ? 'success' : progress >= 50 ? 'warning' : 'error';
                        return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 8,
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            backgroundColor: color === 'success' ? '#4caf50' : color === 'warning' ? '#ff9800' : '#f44336',
                                        }}
                                    />
                                </Box>
                                <Chip label={`${progress}%`} size="small" color={color} />
                            </Box>
                        );
                    }}
                />

                <FunctionField
                    label="Total Keys"
                    render={(record: any) => (
                        <Chip
                            label={record.totalKeys || 0}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                />

                <ChipField source="status" label="Status" />
                <DateField source="updatedAt" label="Last Updated" showTime />
                <EditButton />
            </Datagrid>
        </List>
    );
};

