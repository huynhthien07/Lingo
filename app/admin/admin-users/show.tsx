"use client";

import {
    Show,
    SimpleShowLayout,
    TextField,
    EmailField,
    DateField,
    ChipField,
    FunctionField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
} from "react-admin";
import { Box, Typography, Card, CardContent, Grid, Chip, Avatar } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const ShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const UserTitle = () => {
    const record = useRecordContext();
    return <span>User: {record ? record.userName : ''}</span>;
};

const StatusChip = () => {
    const record = useRecordContext();
    if (!record) return null;

    const statusColors: any = {
        active: 'success',
        blocked: 'error',
        suspended: 'warning',
    };

    return (
        <Chip
            label={record.status?.toUpperCase()}
            color={statusColors[record.status] || 'default'}
            size="small"
        />
    );
};

const RoleChip = () => {
    const record = useRecordContext();
    if (!record) return null;

    const roleColors: any = {
        STUDENT: 'primary',
        TEACHER: 'secondary',
        ADMIN: 'error',
    };

    return (
        <Chip
            label={record.role}
            color={roleColors[record.role] || 'default'}
            size="small"
        />
    );
};

export const AdminUserShow = () => {
    return (
        <Show actions={<ShowActions />} title={<UserTitle />}>
            <SimpleShowLayout>
                <Box sx={{ width: '100%', maxWidth: 1200 }}>
                    {/* Header Card with Avatar */}
                    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #18AA26 0%, #8CB841 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <FunctionField
                                    render={(record: any) => (
                                        <Avatar
                                            src={record.userImageSrc}
                                            sx={{ width: 100, height: 100, border: '4px solid white' }}
                                        >
                                            {record.userName?.charAt(0)}
                                        </Avatar>
                                    )}
                                />
                                <Box sx={{ flex: 1, color: 'white' }}>
                                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                        <TextField source="userName" sx={{ color: 'white', fontSize: '2rem' }} />
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <StatusChip />
                                        <RoleChip />
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon /> Basic Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">User ID</Typography>
                                            <TextField source="userId" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">First Name</Typography>
                                            <TextField source="firstName" emptyText="-" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Last Name</Typography>
                                            <TextField source="lastName" emptyText="-" />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon /> Contact Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Email</Typography>
                                            <EmailField source="email" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                                            <TextField source="phoneNumber" emptyText="-" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Country</Typography>
                                            <TextField source="country" emptyText="-" />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Preferences */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LanguageIcon /> Preferences
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Language</Typography>
                                            <TextField source="language" emptyText="-" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Timezone</Typography>
                                            <TextField source="timezone" emptyText="-" />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Progress & Stats */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmojiEventsIcon /> Progress & Stats
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Points</Typography>
                                            <TextField source="points" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Level</Typography>
                                            <TextField source="level" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Overall Band Score</Typography>
                                            <TextField source="overallBandScore" />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Timestamps */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarTodayIcon /> Timestamps
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">Created At</Typography>
                                            <DateField source="createdAt" showTime />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">Updated At</Typography>
                                            <DateField source="updatedAt" showTime />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">Last Login</Typography>
                                            <DateField source="lastLoginAt" showTime emptyText="-" />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                                            <DateField source="dateOfBirth" emptyText="-" />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleShowLayout>
        </Show>
    );
};
