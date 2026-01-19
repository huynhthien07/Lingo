"use client";

import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    NumberInput,
    SelectInput,
    required,
    TopToolbar,
    ListButton,
    useRecordContext,
} from "react-admin";
import { Box, Typography, Card, CardContent } from "@mui/material";

const EditActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const SettingTitle = () => {
    const record = useRecordContext();
    return <span>Edit Setting: {record ? record.label : ''}</span>;
};

const SettingValueInput = () => {
    const record = useRecordContext();

    if (!record) return null;

    switch (record.type) {
        case 'boolean':
            return <BooleanInput source="value" label="Value" />;
        case 'number':
            return <NumberInput source="value" label="Value" validate={required()} fullWidth />;
        case 'select':
            return (
                <SelectInput
                    source="value"
                    label="Value"
                    choices={record.options || []}
                    validate={required()}
                    fullWidth
                />
            );
        case 'text':
        default:
            return <TextInput source="value" label="Value" validate={required()} fullWidth />;
    }
};

export const SettingsEdit = () => {
    return (
        <Edit actions={<EditActions />} title={<SettingTitle />} mutationMode="pessimistic">
            <SimpleForm>
                <Card sx={{ mb: 3, width: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px' }}>
                                <TextField
                                    source="category"
                                    label="Category"
                                    disabled
                                    fullWidth
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px' }}>
                                <TextField
                                    source="key"
                                    label="Setting Key"
                                    disabled
                                    fullWidth
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 100%' }}>
                                <TextField
                                    source="label"
                                    label="Label"
                                    disabled
                                    fullWidth
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 100%' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body2">
                                    <TextInput source="description" multiline rows={2} fullWidth disabled />
                                </Typography>
                            </Box>
                            <Box sx={{ flex: '1 1 100%' }}>
                                <Box sx={{ mt: 2 }}>
                                    <SettingValueInput />
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </SimpleForm>
        </Edit>
    );
};

// Helper component for TextField (since we're using TextInput from react-admin)
const TextField = ({ source, label, disabled, fullWidth }: any) => {
    const record = useRecordContext();
    return (
        <Box>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1">
                {record?.[source] || '-'}
            </Typography>
        </Box>
    );
};

