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
import { Box, Typography, Card, CardContent, Grid, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React from "react";

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

// Define all available permissions
const AVAILABLE_PERMISSIONS = {
    "User Management": [
        { id: "user.view", name: "View Users" },
        { id: "user.create", name: "Create Users" },
        { id: "user.edit", name: "Edit Users" },
        { id: "user.delete", name: "Delete Users" },
        { id: "user.block", name: "Block/Unblock Users" },
        { id: "user.export", name: "Export User Data" },
    ],
    "Course Management": [
        { id: "course.view", name: "View Courses" },
        { id: "course.create", name: "Create Courses" },
        { id: "course.edit", name: "Edit Courses" },
        { id: "course.delete", name: "Delete Courses" },
        { id: "course.publish", name: "Publish Courses" },
    ],
    "Content Management": [
        { id: "content.view", name: "View Content" },
        { id: "content.create", name: "Create Content" },
        { id: "content.edit", name: "Edit Content" },
        { id: "content.delete", name: "Delete Content" },
    ],
    "Grading & Feedback": [
        { id: "grade.view", name: "View Submissions" },
        { id: "grade.writing", name: "Grade Writing" },
        { id: "grade.speaking", name: "Grade Speaking" },
        { id: "feedback.create", name: "Provide Feedback" },
    ],
    "Analytics & Reports": [
        { id: "analytics.view", name: "View Analytics" },
        { id: "analytics.export", name: "Export Reports" },
        { id: "analytics.dashboard", name: "Access Dashboard" },
    ],
    "System Settings": [
        { id: "settings.view", name: "View Settings" },
        { id: "settings.edit", name: "Edit Settings" },
        { id: "role.manage", name: "Manage Roles" },
        { id: "language.manage", name: "Manage Languages" },
    ],
};

const PermissionCheckboxes = () => {
    const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

    const handleToggle = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Permissions
            </Typography>
            <Grid container spacing={3}>
                {Object.entries(AVAILABLE_PERMISSIONS).map(([category, permissions]) => (
                    <Grid item xs={12} md={6} key={category}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {category}
                                </Typography>
                                <FormGroup>
                                    {permissions.map((perm) => (
                                        <FormControlLabel
                                            key={perm.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedPermissions.includes(perm.id)}
                                                    onChange={() => handleToggle(perm.id)}
                                                />
                                            }
                                            label={perm.name}
                                        />
                                    ))}
                                </FormGroup>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <input
                type="hidden"
                name="permissions"
                value={JSON.stringify(selectedPermissions)}
            />
        </Box>
    );
};

export const RoleCreate = () => {
    return (
        <Create actions={<CreateActions />} title="Create New Role">
            <SimpleForm>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextInput
                            source="name"
                            label="Role Name"
                            validate={required()}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectInput
                            source="status"
                            label="Status"
                            choices={[
                                { id: 'active', name: 'Active' },
                                { id: 'inactive', name: 'Inactive' },
                            ]}
                            defaultValue="active"
                            validate={required()}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextInput
                            source="description"
                            label="Description"
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <PermissionCheckboxes />
            </SimpleForm>
        </Create>
    );
};

