/**
 * Color Palette for IELTS Learning Platform Admin Area
 *
 * Main Colors:
 * - Primary: #18AA26 (Green) - Main brand color
 * - Sub Primary: #8CB841 (Light Green) - Secondary brand color
 * - Warning: #FF9B2F (Orange) - Warning states
 * - Failed/Error: #FB4141 (Red) - Error states
 *
 * Usage:
 * - Primary: Success states, active users, students
 * - Sub Primary: Secondary actions, highlights
 * - Warning: Teachers, pending states, warnings
 * - Error: Blocked users, admins, errors
 */

export const COLORS = {
  // Main Brand Colors
  primary: {
    main: '#18AA26',
    light: '#8CB841',
    dark: '#148A1F',
  },
  
  subPrimary: {
    main: '#8CB841',
    light: '#A5D65E',
    dark: '#7AA636',
  },
  
  warning: {
    main: '#FF9B2F',
    light: '#FFB05C',
    dark: '#E68A2A',
  },
  
  error: {
    main: '#FB4141',
    light: '#FC6868',
    dark: '#E23A3A',
  },
  
  // Semantic Colors
  success: {
    main: '#18AA26',
    light: '#8CB841',
    dark: '#148A1F',
  },

  // Role Colors
  roles: {
    STUDENT: '#18AA26',    // Primary Green
    TEACHER: '#FF9B2F',    // Warning Orange
    ADMIN: '#FB4141',      // Error Red
  },

  // Status Colors
  status: {
    active: '#18AA26',     // Primary Green
    blocked: '#FB4141',    // Error Red
    suspended: '#FF9B2F',  // Warning Orange
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  
  // Background Colors
  background: {
    light: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    dark: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  
  // Text Colors
  text: {
    light: {
      primary: '#333333',
      secondary: '#666666',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
};

/**
 * Get color by role
 */
export const getRoleColor = (role: 'STUDENT' | 'TEACHER' | 'ADMIN'): string => {
  return COLORS.roles[role] || COLORS.primary.main;
};

/**
 * Get color by status
 */
export const getStatusColor = (status: 'active' | 'blocked' | 'suspended'): string => {
  return COLORS.status[status] || COLORS.primary.main;
};

/**
 * Get MUI color name by role
 */
export const getRoleMuiColor = (role: 'STUDENT' | 'TEACHER' | 'ADMIN'): 'primary' | 'warning' | 'error' => {
  const colorMap = {
    STUDENT: 'primary' as const,
    TEACHER: 'warning' as const,
    ADMIN: 'error' as const,
  };
  return colorMap[role] || 'primary';
};

/**
 * Get MUI color name by status
 */
export const getStatusMuiColor = (status: 'active' | 'blocked' | 'suspended'): 'success' | 'error' | 'warning' => {
  const colorMap = {
    active: 'success' as const,
    blocked: 'error' as const,
    suspended: 'warning' as const,
  };
  return colorMap[status] || 'success';
};

