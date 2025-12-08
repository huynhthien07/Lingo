"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import { defaultTheme } from 'react-admin';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Light theme configuration with custom color palette
const lightTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#18AA26', // Primary Green
      light: '#8CB841', // Sub Primary Light Green
      dark: '#148A1F',
    },
    secondary: {
      main: '#8CB841', // Sub Primary
      light: '#A5D65E',
      dark: '#7AA636',
    },
    warning: {
      main: '#FF9B2F', // Warning Orange
      light: '#FFB05C',
      dark: '#E68A2A',
    },
    error: {
      main: '#FB4141', // Failed/Error Red
      light: '#FC6868',
      dark: '#E23A3A',
    },
    success: {
      main: '#18AA26', // Same as primary
      light: '#8CB841',
      dark: '#148A1F',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    ...defaultTheme.typography,
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    ...defaultTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#18AA26', // Primary Green
          boxShadow: '0 2px 4px rgba(24, 170, 38, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#18AA26',
          '&:hover': {
            backgroundColor: '#148A1F',
          },
        },
        containedSecondary: {
          backgroundColor: '#8CB841',
          '&:hover': {
            backgroundColor: '#7AA636',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#18AA26',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#8CB841',
          color: '#ffffff',
        },
        colorWarning: {
          backgroundColor: '#FF9B2F',
          color: '#ffffff',
        },
        colorError: {
          backgroundColor: '#FB4141',
          color: '#ffffff',
        },
      },
    },
  },
});

// Dark theme configuration with custom color palette
const darkTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#18AA26', // Primary Green (same in dark mode)
      light: '#8CB841',
      dark: '#148A1F',
    },
    secondary: {
      main: '#8CB841', // Sub Primary
      light: '#A5D65E',
      dark: '#7AA636',
    },
    warning: {
      main: '#FF9B2F', // Warning Orange
      light: '#FFB05C',
      dark: '#E68A2A',
    },
    error: {
      main: '#FB4141', // Failed/Error Red
      light: '#FC6868',
      dark: '#E23A3A',
    },
    success: {
      main: '#18AA26',
      light: '#8CB841',
      dark: '#148A1F',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    divider: '#333333',
    action: {
      hover: '#333333',
      selected: '#2d2d2d',
    },
  },
  typography: {
    ...defaultTheme.typography,
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    ...defaultTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#121212 !important',
          color: '#ffffff',
        },
        '#root': {
          backgroundColor: '#121212 !important',
        },
        html: {
          backgroundColor: '#121212 !important',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e !important',
          boxShadow: '0 2px 4px rgba(24, 170, 38, 0.2)',
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#18AA26',
          '&:hover': {
            backgroundColor: '#148A1F',
          },
        },
        containedSecondary: {
          backgroundColor: '#8CB841',
          '&:hover': {
            backgroundColor: '#7AA636',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #333333',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#333333',
          },
          '&.Mui-selected': {
            backgroundColor: '#2d2d2d',
            '&:hover': {
              backgroundColor: '#333333',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #333333',
        },
        head: {
          backgroundColor: '#2d2d2d',
          color: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#333333',
          color: '#ffffff',
        },
        colorPrimary: {
          backgroundColor: '#18AA26',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#8CB841',
          color: '#ffffff',
        },
        colorWarning: {
          backgroundColor: '#FF9B2F',
          color: '#ffffff',
        },
        colorError: {
          backgroundColor: '#FB4141',
          color: '#ffffff',
        },
      },
    },
    // Global overrides for React Admin
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212 !important',
        },
      },
    },
    // Override all possible background elements
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
    '.RaSidebar-root': {
      backgroundColor: '#1e1e1e !important',
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
    '.RaDatagrid-row': {
      backgroundColor: '#1e1e1e !important',
      '&:hover': {
        backgroundColor: '#333333 !important',
      },
    },
  },
});

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-dark-mode');
    if (savedTheme) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('admin-dark-mode', JSON.stringify(newMode));
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
