/**
 * Admin Client - User & Account Management Focus
 *
 * Admin Area Structure:
 * - Dashboard: User statistics, role distribution, language preferences
 * - User Management: User list, detail, edit, change status (UC34)
 * - Role & Permission Management: RBAC implementation
 * - Language Pack Management: Multi-language UI (UC36, BR141-BR144)
 * - System Settings: General configuration
 *
 * Reference: NIST RBAC Model for role-based access control
 */

"use client";

import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { Box, CssBaseline, GlobalStyles } from "@mui/material";
import { AdminUserList } from "./admin-users/list";
import { AdminUserEdit } from "./admin-users/edit";
import { AdminUserCreate } from "./admin-users/create";
import { RoleList } from "./roles/list";
import { RoleEdit } from "./roles/edit";
import { RoleCreate } from "./roles/create";
import { SettingsList } from "./settings/list";
import { SettingsEdit } from "./settings/edit";
import { CustomLayout } from "./layout/CustomLayout";
import { Dashboard } from "./dashboard/Dashboard";
import { useEffect } from "react";

import { AdminThemeProvider, useTheme } from "./context/ThemeContext";

const App = () => {
  return (
    <AdminThemeProvider>
      <AdminContent />
    </AdminThemeProvider>
  );
};

const AdminContent = () => {
  const { currentTheme, isDarkMode } = useTheme();

  // Force redirect from old route to new route
  useEffect(() => {
    const hash = window.location.hash;
    console.log('🔍 AdminContent mounted - Current hash:', hash);

    // Redirect from #/users to #/admin-users
    if (hash === '#/users' || hash.startsWith('#/users/')) {
      const newHash = hash.replace('#/users', '#/admin-users');
      console.log('🔄 Redirecting from', hash, 'to', newHash);
      window.location.hash = newHash;
    }

    // Also listen for hash changes
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      console.log('🔍 Hash changed to:', currentHash);

      if (currentHash === '#/users' || currentHash.startsWith('#/users/')) {
        const newHash = currentHash.replace('#/users', '#/admin-users');
        console.log('🔄 Redirecting from', currentHash, 'to', newHash);
        window.location.hash = newHash;
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const darkModeStyles = isDarkMode ? {
    'html, body, #root': {
      backgroundColor: '#121212 !important',
      color: '#ffffff !important',
    },
    '.RaLayout-root': {
      backgroundColor: '#121212 !important',
    },
    '.RaLayout-appFrame': {
      backgroundColor: '#121212 !important',
    },
    '.RaLayout-contentWithSidebar': {
      backgroundColor: '#121212 !important',
    },
    '.RaLayout-content': {
      backgroundColor: '#121212 !important',
    },
    '.RaSidebar-root .MuiDrawer-paper': {
      backgroundColor: '#1e1e1e !important',
      borderRight: '1px solid #333333 !important',
    },
    '.RaList-root': {
      backgroundColor: '#121212 !important',
    },
    '.RaList-main': {
      backgroundColor: '#1e1e1e !important',
    },
    '.RaDatagrid-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.RaDatagrid-table': {
      backgroundColor: '#1e1e1e !important',
    },
    '.RaDatagrid-headerRow': {
      backgroundColor: '#2d2d2d !important',
    },
    '.RaDatagrid-headerCell': {
      backgroundColor: '#2d2d2d !important',
      color: '#ffffff !important',
    },
    '.RaDatagrid-row': {
      backgroundColor: '#1e1e1e !important',
      '&:hover': {
        backgroundColor: '#333333 !important',
      },
    },
    '.RaDatagrid-rowCell': {
      borderBottom: '1px solid #333333 !important',
      color: '#ffffff !important',
    },
    '.MuiPaper-root': {
      backgroundColor: '#1e1e1e !important',
      color: '#ffffff !important',
    },
    '.MuiCard-root': {
      backgroundColor: '#2d2d2d !important',
      color: '#ffffff !important',
    },
    '.MuiTableContainer-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.MuiTable-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.MuiTableHead-root': {
      backgroundColor: '#2d2d2d !important',
    },
    '.MuiTableBody-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.MuiTableRow-root': {
      backgroundColor: '#1e1e1e !important',
      '&:hover': {
        backgroundColor: '#333333 !important',
      },
    },
    '.MuiTableCell-root': {
      borderBottom: '1px solid #333333 !important',
      color: '#ffffff !important',
    },
    '.MuiTableCell-head': {
      backgroundColor: '#2d2d2d !important',
      color: '#ffffff !important',
      fontWeight: 600,
    },
  } : {};

  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={darkModeStyles} />
      <Box
        sx={{
          backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
          minHeight: '100vh',
          color: isDarkMode ? '#ffffff' : '#333333',
        }}
      >
        <Admin
          dataProvider={dataProvider}
          theme={currentTheme}
          layout={CustomLayout}
          dashboard={Dashboard}
          title="IELTS Admin - User & Account Management"
        >
          {/* User Management - UC34 */}
          <Resource
            name="admin-users"
            list={AdminUserList}
            edit={AdminUserEdit}
            create={AdminUserCreate}
            recordRepresentation="userName"
            options={{ label: "👥 User Management" }}
          />

          {/* Role & Permission Management - RBAC */}
          <Resource
            name="roles"
            list={RoleList}
            edit={RoleEdit}
            recordRepresentation="name"
            options={{ label: "🔐 Role & Permissions" }}
          />

          {/* System Settings */}
          <Resource
            name="settings"
            list={SettingsList}
            edit={SettingsEdit}
            recordRepresentation="label"
            options={{ label: "⚙️ System Settings" }}
          />
        </Admin>
      </Box>
    </>
  );
};

export default App;