import {
    Typography,
    Box,
    Paper,
    Avatar,
    Chip,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    School,
    People,
    Quiz,
    TrendingUp,
    MenuBook,
    Assignment,
    PersonAdd,
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

// Types for our analytics data
interface AnalyticsData {
    users: {
        totalUsers: number;
        monthlyActiveUsers: number;
    };
    lessons: {
        usersWithCompletedLessons: number;
        totalLessonCompletions: number;
        monthlyLessonCompletions: number;
    };
    subscriptions: {
        totalSubscribers: number;
        activeSubscribers: number;
        monthlyNewSubscribers: number;
    };
}

interface ContentCounts {
    courses: number;
    units: number;
    lessons: number;
    challenges: number;
    blockedUsers: number;
}

export const Dashboard = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [contentCounts, setContentCounts] = useState<ContentCounts | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch analytics data
                const analyticsResponse = await fetch('/api/analytics/overview');
                if (!analyticsResponse.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                const analytics = await analyticsResponse.json();

                // Fetch content counts
                const contentResponse = await fetch('/api/analytics/content');
                if (!contentResponse.ok) {
                    throw new Error('Failed to fetch content statistics');
                }
                const content = await contentResponse.json();

                setAnalyticsData(analytics);
                setContentCounts(content);
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
                Dashboard Overview
            </Typography>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 3,
                mb: 4
            }}>
                <StatCard
                    title="Total Users"
                    value={analyticsData?.users.totalUsers || 0}
                    icon={<People />}
                    color="#1976d2"
                    subtitle={`${analyticsData?.users.monthlyActiveUsers || 0} monthly active`}
                />
                <StatCard
                    title="Total Courses"
                    value={contentCounts?.courses || 0}
                    icon={<School />}
                    color="#2e7d32"
                    subtitle="Available languages"
                />
                <StatCard
                    title="Total Challenges"
                    value={contentCounts?.challenges || 0}
                    icon={<Quiz />}
                    color="#ed6c02"
                    subtitle="Across all courses"
                />
                <StatCard
                    title="Units Created"
                    value={contentCounts?.units || 0}
                    icon={<MenuBook />}
                    color="#9c27b0"
                    subtitle="Learning modules"
                />
                <StatCard
                    title="Lessons Available"
                    value={contentCounts?.lessons || 0}
                    icon={<Assignment />}
                    color="#d32f2f"
                    subtitle="Total lessons"
                />
                <StatCard
                    title="Premium Subscribers"
                    value={analyticsData?.subscriptions.totalSubscribers || 0}
                    icon={<Star />}
                    color="#ff9800"
                    subtitle={`${analyticsData?.subscriptions.monthlyNewSubscribers || 0} new this month`}
                />
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 3
            }}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardHeader title="User Engagement" />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                                    <Typography variant="body2">Users with Progress</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {analyticsData?.lessons.usersWithCompletedLessons || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Assignment sx={{ color: '#2196f3', fontSize: 20 }} />
                                    <Typography variant="body2">Total Completions</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {analyticsData?.lessons.totalLessonCompletions || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUp sx={{ color: '#ff9800', fontSize: 20 }} />
                                    <Typography variant="body2">Monthly Completions</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {analyticsData?.lessons.monthlyLessonCompletions || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Block sx={{ color: '#f44336', fontSize: 20 }} />
                                    <Typography variant="body2">Blocked Users</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {contentCounts?.blockedUsers || 0}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardHeader title="Content Overview" />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">Courses Available</Typography>
                                <Chip
                                    label={contentCounts?.courses || 0}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">Learning Units</Typography>
                                <Chip
                                    label={contentCounts?.units || 0}
                                    color="secondary"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">Total Lessons</Typography>
                                <Chip
                                    label={contentCounts?.lessons || 0}
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">Practice Challenges</Typography>
                                <Chip
                                    label={contentCounts?.challenges || 0}
                                    color="warning"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardHeader title="Premium Insights" />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Star sx={{ color: '#ffc107', fontSize: 20 }} />
                                    <Typography variant="body2">Total Subscribers</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {analyticsData?.subscriptions.totalSubscribers || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                                    <Typography variant="body2">Active Subscriptions</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {analyticsData?.subscriptions.activeSubscribers || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonAdd sx={{ color: '#2196f3', fontSize: 20 }} />
                                    <Typography variant="body2">New This Month</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {analyticsData?.subscriptions.monthlyNewSubscribers || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                                    {analyticsData?.subscriptions.totalSubscribers > 0
                                        ? `${Math.round((analyticsData.subscriptions.activeSubscribers / analyticsData.subscriptions.totalSubscribers) * 100)}% retention rate`
                                        : 'No subscription data'
                                    }
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
