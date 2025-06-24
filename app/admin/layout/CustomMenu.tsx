import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import {
    Dashboard,
    School,
    MenuBook,
    Assignment,
    Quiz,
    RadioButtonChecked,
    People,
    BarChart
} from '@mui/icons-material';
import { Box, Typography, Divider } from '@mui/material';

export const CustomMenu = () => {
    const [open] = useSidebarState();

    return (
        <Menu
            sx={{
                '& .RaMenu-list': {
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e0e0e0',
                },
                '& .RaMenuItemLink-root': {
                    borderRadius: '8px',
                    margin: '4px 8px',
                    '&:hover': {
                        backgroundColor: '#f5f5f5',
                    },
                    '&.RaMenuItemLink-active': {
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        '& .MuiListItemIcon-root': {
                            color: '#1976d2',
                        },
                    },
                },
            }}
        >
            {open && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        Admin Panel
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                        Language Learning Management
                    </Typography>
                </Box>
            )}

            <MenuItemLink
                to="/"
                primaryText="Dashboard"
                leftIcon={<Dashboard />}
            />

            <Divider sx={{ my: 1 }} />

            <MenuItemLink
                to="/courses"
                primaryText="Courses"
                leftIcon={<School />}
            />
            <MenuItemLink
                to="/units"
                primaryText="Units"
                leftIcon={<MenuBook />}
            />
            <MenuItemLink
                to="/lessons"
                primaryText="Lessons"
                leftIcon={<Assignment />}
            />
            <MenuItemLink
                to="/challenges"
                primaryText="Challenges"
                leftIcon={<Quiz />}
            />
            <MenuItemLink
                to="/challengeOptions"
                primaryText="Challenge Options"
                leftIcon={<RadioButtonChecked />}
            />

            <Divider sx={{ my: 1 }} />

            <MenuItemLink
                to="/users"
                primaryText="User Progress"
                leftIcon={<People />}
            />
            <MenuItemLink
                to="/admin-users"
                primaryText="User Management"
                leftIcon={<People />}
            />
            <MenuItemLink
                to="/statistics"
                primaryText="Statistics"
                leftIcon={<BarChart />}
            />
        </Menu>
    );
};
