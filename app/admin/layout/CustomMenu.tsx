import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import {
    Dashboard,
    People,
    Security,
    Language,
    Settings,
    AdminPanelSettings
} from '@mui/icons-material';
import { Box, Typography, Divider } from '@mui/material';

/**
 * Custom Admin Menu - User & Account Management Focus
 *
 * Admin Area Structure:
 * - Dashboard: Overview of users, roles, system stats
 * - User Management: User list, detail, edit, change status (UC34)
 * - Role Permission Management: Manage roles and permissions (RBAC)
 * - Language Pack Management: Multi-language UI support (UC36, BR141-BR144)
 * - System Settings: General system configuration
 *
 * Reference: NIST RBAC Model for role-based access control
 */
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
                        User & Account Management
                    </Typography>
                </Box>
            )}

            {/* Dashboard */}
            <MenuItemLink
                to="/"
                primaryText="Dashboard"
                leftIcon={<Dashboard />}
            />

            <Divider sx={{ my: 1 }} />

            {/* User Management Section */}
            <MenuItemLink
                to="/users"
                primaryText="User Management"
                leftIcon={<People />}
            />

            {/* Role & Permission Management */}
            <MenuItemLink
                to="/roles"
                primaryText="Role & Permissions"
                leftIcon={<Security />}
            />

            <Divider sx={{ my: 1 }} />

            {/* Language Pack Management (UC36) */}
            <MenuItemLink
                to="/language-packs"
                primaryText="Language Packs"
                leftIcon={<Language />}
            />

            {/* System Settings */}
            <MenuItemLink
                to="/settings"
                primaryText="System Settings"
                leftIcon={<Settings />}
            />
        </Menu>
    );
};
