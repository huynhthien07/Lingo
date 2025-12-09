import {
    Typography,
    Box,
    Paper,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    School,
    People,
    Assignment,
    CheckCircle,
    Block,
    Star
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}) => (
    <Paper
        sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
        }}
    >
        <Avatar
            sx={{
                bgcolor: color,
                width: 56,
                height: 56,
            }}
        >
            {icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
                {value}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Paper>
);

/**
 * Admin Dashboard - User & Account Management Focus
 *
 * Displays statistics about:
 * - Total users by role (STUDENT, TEACHER, ADMIN)
 * - User status (active, blocked)
 * - Recent registrations
 * - Role distribution
 * - Language preferences
 *
 * Reference: UC34 - User Management
 */

// Types for our analytics data
interface UserAnalytics {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    monthlyNewUsers: number;
    studentCount: number;
    teacherCount: number;
    adminCount: number;
}

interface LanguageStats {
    en: number;
    vi: number;
}

export const Dashboard = () => {
    const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
    const [languageStats, setLanguageStats] = useState<LanguageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch user analytics
                const userResponse = await fetch('/api/admin/analytics/users');
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user analytics');
                }
                const users = await userResponse.json();

                // Fetch language statistics
                const langResponse = await fetch('/api/admin/analytics/languages');
                if (!langResponse.ok) {
                    throw new Error('Failed to fetch language statistics');
                }
                const languages = await langResponse.json();

                setUserAnalytics(users);
                setLanguageStats(languages);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                Admin Dashboard - User & Account Management
            </Typography>

            {/* User Statistics */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 3,
                mb: 4
            }}>
                <StatCard
                    title="Total Users"
                    value={userAnalytics?.totalUsers || 0}
                    icon={<People />}
                    color="#18AA26"
                    subtitle={`${userAnalytics?.monthlyNewUsers || 0} new this month`}
                />
                <StatCard
                    title="Active Users"
                    value={userAnalytics?.activeUsers || 0}
                    icon={<CheckCircle />}
                    color="#18AA26"
                    subtitle="Can log in"
                />
                <StatCard
                    title="Blocked Users"
                    value={userAnalytics?.blockedUsers || 0}
                    icon={<Block />}
                    color="#FB4141"
                    subtitle="Cannot log in"
                />
            </Box>

            {/* Role Distribution */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                Role Distribution
            </Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 3,
                mb: 4
            }}>
                <StatCard
                    title="Students"
                    value={userAnalytics?.studentCount || 0}
                    icon={<School />}
                    color="#18AA26"
                    subtitle="STUDENT role"
                />
                <StatCard
                    title="Teachers"
                    value={userAnalytics?.teacherCount || 0}
                    icon={<Assignment />}
                    color="#FF9B2F"
                    subtitle="TEACHER role"
                />
                <StatCard
                    title="Admins"
                    value={userAnalytics?.adminCount || 0}
                    icon={<Star />}
                    color="#FB4141"
                    subtitle="ADMIN role"
                />
            </Box>

            {/* Language & System Statistics */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                System Overview
            </Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3
            }}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardHeader title="Language Preferences" />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">🇬🇧 English Users</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {languageStats?.en || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">🇻🇳 Vietnamese Users</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {languageStats?.vi || 0}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
