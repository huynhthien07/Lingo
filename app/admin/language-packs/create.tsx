"use client";

import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    required,
    TopToolbar,
    ListButton,
} from "react-admin";
import { Grid } from "@mui/material";

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

export const LanguagePackCreate = () => {
    return (
        <Create actions={<CreateActions />} title="Create New Language Pack">
            <SimpleForm>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextInput
                            source="code"
                            label="Language Code (e.g., en, vi)"
                            validate={required()}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextInput
                            source="name"
                            label="Language Name (e.g., English)"
                            validate={required()}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextInput
                            source="nativeName"
                            label="Native Name (e.g., English)"
                            validate={required()}
                            fullWidth
                        />
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
                            defaultValue="draft"
                            validate={required()}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </SimpleForm>
        </Create>
    );
};

