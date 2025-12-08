"use client";

import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    required,
    TopToolbar,
    ListButton,
    useRecordContext,
} from "react-admin";
import { Box, Typography, Card, CardContent, Grid, TextField as MuiTextField, Button, IconButton } from "@mui/material";
import React from "react";
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const EditActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const LanguagePackTitle = () => {
    const record = useRecordContext();
    return <span>Edit Language Pack: {record ? record.name : ''}</span>;
};

const TranslationEditor = () => {
    const record = useRecordContext();
    const [translations, setTranslations] = React.useState<any>(record?.translations || {});

    React.useEffect(() => {
        if (record?.translations) {
            setTranslations(record.translations);
        }
    }, [record]);

    const handleChange = (key: string, value: string) => {
        setTranslations((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleAddKey = () => {
        const newKey = prompt("Enter new translation key:");
        if (newKey && !translations[newKey]) {
            setTranslations((prev: any) => ({ ...prev, [newKey]: "" }));
        }
    };

    const handleDeleteKey = (key: string) => {
        if (confirm(`Delete translation key "${key}"?`)) {
            setTranslations((prev: any) => {
                const newTranslations = { ...prev };
                delete newTranslations[key];
                return newTranslations;
            });
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(translations, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${record?.code || 'language'}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event: any) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    setTranslations(imported);
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Translations ({Object.keys(translations).length} keys)</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} size="small">
                        Export JSON
                    </Button>
                    <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleImport} size="small">
                        Import JSON
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddKey} size="small">
                        Add Key
                    </Button>
                </Box>
            </Box>
            <Card variant="outlined">
                <CardContent>
                    <Grid container spacing={2}>
                        {Object.entries(translations).map(([key, value]) => (
                            <Grid item xs={12} key={key}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                    <MuiTextField label="Key" value={key} disabled size="small" sx={{ flex: 1 }} />
                                    <MuiTextField
                                        label="Translation"
                                        value={value as string}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                        size="small"
                                        multiline
                                        sx={{ flex: 2 }}
                                    />
                                    <IconButton onClick={() => handleDeleteKey(key)} color="error" size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
            <input type="hidden" name="translations" value={JSON.stringify(translations)} />
        </Box>
    );
};

export const LanguagePackEdit = () => {
    return (
        <Edit actions={<EditActions />} title={<LanguagePackTitle />} mutationMode="pessimistic">
            <SimpleForm>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextInput source="code" label="Language Code" validate={required()} fullWidth disabled />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextInput source="name" label="Language Name" validate={required()} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextInput source="nativeName" label="Native Name" validate={required()} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <SelectInput
                            source="status"
                            label="Status"
                            choices={[
                                { id: 'active', name: 'Active' },
                                { id: 'draft', name: 'Draft' },
                                { id: 'archived', name: 'Archived' },
                            ]}
                            validate={required()}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <TranslationEditor />
            </SimpleForm>
        </Edit>
    );
};

