"use client";

import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    PasswordInput,
    required,
    email,
    useNotify,
    useRedirect,
    SaveButton,
    Toolbar,
} from "react-admin";
import { Box, Typography, Card, CardContent, Alert } from "@mui/material";

const UserCreateToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

export const AdminUserCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const onSuccess = (data: any) => {
        notify('User created successfully', { type: 'success' });
        redirect('list', 'admin-users');
    };

    const onError = (error: any) => {
        notify(`Error creating user: ${error.message}`, { type: 'error' });
    };

    return (
        <Create
            mutationOptions={{ onSuccess, onError }}
            sx={{
                '& .RaCreate-main': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            }}
        >
            <SimpleForm toolbar={<UserCreateToolbar />}>
                <Box sx={{ width: '100%', maxWidth: 800 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                        Create New User via Clerk
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        This will create a new user in Clerk and sync to the database.
                        If password is not provided, Clerk will send a verification email to the user.
                    </Alert>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                                Basic Information
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="email"
                                        label="Email"
                                        validate={[required(), email()]}
                                        fullWidth
                                        type="email"
                                        helperText="User's email address (required)"
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="userName"
                                        label="Username"
                                        validate={required()}
                                        fullWidth
                                        helperText="Unique username (required)"
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="firstName"
                                        label="First Name"
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="lastName"
                                        label="Last Name"
                                        fullWidth
                                    />
                                </Box>
                            </Box>

                            <PasswordInput
                                source="password"
                                label="Password (Optional)"
                                fullWidth
                                helperText="Leave empty to send verification email instead"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                                Account Settings
                            </Typography>

                            <SelectInput
                                source="role"
                                label="Role"
                                choices={[
                                    { id: 'STUDENT', name: 'Student' },
                                    { id: 'TEACHER', name: 'Teacher' },
                                    { id: 'ADMIN', name: 'Admin' },
                                ]}
                                defaultValue="STUDENT"
                                validate={required()}
                                fullWidth
                                helperText="User role in the system"
                            />
                        </CardContent>
                    </Card>
                </Box>
            </SimpleForm>
        </Create>
    );
};
