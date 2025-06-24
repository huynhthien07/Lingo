"use client";

import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    DateTimeInput,
    required,
    useNotify,
    useRedirect,
    SaveButton,
    Toolbar,
} from "react-admin";
import { Box, Typography, Card, CardContent } from "@mui/material";

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
                        Create New User
                    </Typography>
                    
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                                Basic Information
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="userName"
                                        label="User Name"
                                        validate={required()}
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="email"
                                        label="Email"
                                        validate={required()}
                                        fullWidth
                                        type="email"
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

                            <TextInput
                                source="userId"
                                label="User ID (Clerk)"
                                validate={required()}
                                fullWidth
                                helperText="Enter the Clerk user ID for this user"
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                                Account Settings
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <SelectInput
                                        source="status"
                                        label="Status"
                                        choices={[
                                            { id: 'active', name: 'Active' },
                                            { id: 'blocked', name: 'Blocked' },
                                            { id: 'suspended', name: 'Suspended' },
                                        ]}
                                        defaultValue="active"
                                        validate={required()}
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <SelectInput
                                        source="role"
                                        label="Role"
                                        choices={[
                                            { id: 'user', name: 'User' },
                                            { id: 'premium', name: 'Premium' },
                                        ]}
                                        defaultValue="user"
                                        validate={required()}
                                        fullWidth
                                    />
                                </Box>
                            </Box>

                            <TextInput
                                source="userImageSrc"
                                label="Profile Image URL"
                                fullWidth
                                defaultValue="/mascot.svg"
                                helperText="URL to the user's profile image"
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                                Contact Information
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="phoneNumber"
                                        label="Phone Number"
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="country"
                                        label="Country"
                                        fullWidth
                                    />
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <SelectInput
                                        source="language"
                                        label="Preferred Language"
                                        choices={[
                                            { id: 'en', name: 'English' },
                                            { id: 'es', name: 'Spanish' },
                                            { id: 'fr', name: 'French' },
                                            { id: 'de', name: 'German' },
                                            { id: 'it', name: 'Italian' },
                                            { id: 'pt', name: 'Portuguese' },
                                        ]}
                                        defaultValue="en"
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="timezone"
                                        label="Timezone"
                                        fullWidth
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                                Optional Information
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <DateTimeInput
                                        source="dateOfBirth"
                                        label="Date of Birth"
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <DateTimeInput
                                        source="lastLoginAt"
                                        label="Last Login"
                                        fullWidth
                                        helperText="Leave empty if user has never logged in"
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </SimpleForm>
        </Create>
    );
};
