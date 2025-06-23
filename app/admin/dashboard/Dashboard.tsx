import {
    Typography,
    Box,
    Paper,
    Avatar,
    Chip,
    Card,
    CardContent,
    CardHeader
} from '@mui/material';
import {
    School,
    People,
    Quiz,
    TrendingUp,
    MenuBook,
    Assignment
} from '@mui/icons-material';

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

export const Dashboard = () => {
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
                    title="Total Courses"
                    value="5"
                    icon={<School />}
                    color="#1976d2"
                    subtitle="English, French, Spanish"
                />
                <StatCard
                    title="Active Users"
                    value="1,234"
                    icon={<People />}
                    color="#2e7d32"
                    subtitle="Learning daily"
                />
                <StatCard
                    title="Total Challenges"
                    value="250"
                    icon={<Quiz />}
                    color="#ed6c02"
                    subtitle="Across all courses"
                />
                <StatCard
                    title="Units Created"
                    value="50"
                    icon={<MenuBook />}
                    color="#9c27b0"
                    subtitle="10 units per course"
                />
                <StatCard
                    title="Lessons Available"
                    value="250"
                    icon={<Assignment />}
                    color="#d32f2f"
                    subtitle="5 lessons per unit"
                />
                <StatCard
                    title="Growth Rate"
                    value="+12%"
                    icon={<TrendingUp />}
                    color="#0288d1"
                    subtitle="This month"
                />
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3
            }}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardHeader title="Course Status" />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>English Starter</Typography>
                                <Chip label="Active" color="success" size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>English 5.0</Typography>
                                <Chip label="Active" color="success" size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>English 6.0</Typography>
                                <Chip label="Active" color="success" size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>French Starter</Typography>
                                <Chip label="Active" color="success" size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Spanish Starter</Typography>
                                <Chip label="Active" color="success" size="small" />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardHeader title="Quick Actions" />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                • Create new course content
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                • Manage user accounts
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                • View learning statistics
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                • Add new challenges
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                • Monitor user progress
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
