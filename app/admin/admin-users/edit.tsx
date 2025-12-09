"use client";

import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    DateTimeInput,
    required,
    useNotify,
    useRefresh,
    SaveButton,
    Toolbar,
    DeleteButton,
    useRecordContext,
} from "react-admin";
import { Box, Typography, Card, CardContent, Alert } from "@mui/material";
import { useQueryClient } from '@tanstack/react-query';

// Admin user IDs that cannot be blocked
const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
];

const UserEditToolbar = () => {
    console.log('🔧 UserEditToolbar rendered');

    return (
        <Toolbar>
            <SaveButton />
            <DeleteButton />
        </Toolbar>
    );
};

// Custom component to conditionally show blocking input
const BlockingInput = () => {
    const record = useRecordContext();
    const isAdmin = record && adminIds.includes(record.userId);

    if (isAdmin) {
        return (
            <Box sx={{ mb: 2 }}>
                <Alert severity="info">
                    This is an admin account and cannot be blocked.
                </Alert>
            </Box>
        );
    }

    return (
        <SelectInput
            source="status"
            label="Status"
            choices={[
                { id: 'active', name: 'Active' },
                { id: 'blocked', name: 'Blocked' },
                { id: 'suspended', name: 'Suspended' },
            ]}
            validate={required()}
        />
    );
};

export const AdminUserEdit = () => {
    console.log('🎯🎯🎯 NEW CODE IS RUNNING! 🎯🎯🎯');

    const notify = useNotify();
    const refresh = useRefresh();
    const queryClient = useQueryClient();

    // Transform function to remove protected fields from update data
    // Keep 'id' for React-Admin, but remove userId, createdAt, updatedAt, lastLoginAt
    const transform = (data: any) => {
        console.log('🔄 Transform - Original data:', data);

        // Remove protected fields and null timestamp fields
        const { userId, createdAt, updatedAt, lastLoginAt, ...rest } = data;

        // Remove any null or undefined values to prevent validation errors
        const cleaned = Object.fromEntries(
            Object.entries(rest).filter(([_, value]) => value !== null && value !== undefined)
        );

        console.log('🔄 Transform - Cleaned data:', cleaned);
        return cleaned;
    };

    const onSuccess = async (data: any) => {
        console.log('✅ User update successful:', data);
        notify('User updated successfully', { type: 'success' });

        // Invalidate all queries to force refetch
        await queryClient.invalidateQueries({ queryKey: ['users'] });
        await queryClient.invalidateQueries({ queryKey: ['users', 'getOne'] });

        console.log('🔄 Cache invalidated');

        // Small delay to ensure refetch completes
        setTimeout(() => {
            refresh();
            console.log('🔄 Refreshed');
        }, 100);
    };

    const onError = (error: any) => {
        console.error('❌ User update error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            body: error.body
        });

        let errorMessage = 'Error updating user';
        if (error.status === 403) {
            errorMessage = 'Cannot update admin account';
        } else if (error.status === 404) {
            errorMessage = 'User not found';
        } else if (error.status === 409) {
            errorMessage = 'Email already exists';
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }

        notify(errorMessage, { type: 'error' });
    };

    return (
        <Edit
            transform={transform}
            sx={{
                '& .RaEdit-main': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            }}
        >
            <SimpleForm
                toolbar={<UserEditToolbar />}
                sanitizeEmptyValues
            >
                <Box sx={{ width: '100%', maxWidth: 800 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                        User Information
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
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextInput
                                        source="email"
                                        label="Email"
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

                            {/* userId field removed - not needed in form */}
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                                Account Settings
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <BlockingInput />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <SelectInput
                                        source="role"
                                        label="Role"
                                        choices={[
                                            { id: 'STUDENT', name: 'Student' },
                                            { id: 'TEACHER', name: 'Teacher' },
                                            { id: 'ADMIN', name: 'Admin' },
                                        ]}
                                        validate={required()}
                                        fullWidth
                                    />
                                </Box>
                            </Box>

                            <TextInput
                                source="userImageSrc"
                                label="Profile Image URL"
                                fullWidth
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
                                            { id: 'vi', name: 'Vietnamese' },
                                            { id: 'es', name: 'Spanish' },
                                            { id: 'fr', name: 'French' },
                                            { id: 'de', name: 'German' },
                                            { id: 'it', name: 'Italian' },
                                            { id: 'pt', name: 'Portuguese' },
                                        ]}
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
                                Timestamps
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
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
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <DateTimeInput
                                        source="createdAt"
                                        label="Created At"
                                        fullWidth
                                        disabled
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <DateTimeInput
                                        source="updatedAt"
                                        label="Updated At"
                                        fullWidth
                                        disabled
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </SimpleForm>
        </Edit>
    );
};
