import { useEffect } from 'react';
import { useRefresh, useNotify } from 'react-admin';

/**
 * Custom hook that provides auto-refresh functionality for admin lists
 * This hook can be used to automatically refresh lists when operations complete
 */
export const useAutoRefresh = () => {
    const refresh = useRefresh();
    const notify = useNotify();

    // Note: Removed automatic refresh listener to prevent infinite loops
    // React Admin already handles refreshing after CRUD operations

    const refreshWithNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        refresh();
        if (message) {
            notify(message, { type });
        }
    };

    const handleCreateSuccess = (resource: string, data?: any) => {
        refreshWithNotification(`${resource} created successfully`);
    };

    const handleUpdateSuccess = (resource: string, data?: any) => {
        refreshWithNotification(`${resource} updated successfully`);
    };

    const handleDeleteSuccess = (resource: string, data?: any) => {
        refreshWithNotification(`${resource} deleted successfully`);
    };

    const handleBulkUpdateSuccess = (resource: string, count: number) => {
        refreshWithNotification(`${count} ${resource} updated successfully`);
    };

    const handleError = (error: any, operation: string) => {
        console.error(`Error during ${operation}:`, error);
        refreshWithNotification(`Error during ${operation}`, 'error');
    };

    return {
        refresh,
        refreshWithNotification,
        handleCreateSuccess,
        handleUpdateSuccess,
        handleDeleteSuccess,
        handleBulkUpdateSuccess,
        handleError
    };
};

/**
 * Hook that automatically refreshes the list at specified intervals
 * Useful for real-time updates when multiple users are working on the same data
 */
export const usePeriodicRefresh = (intervalMs: number = 30000) => {
    const refresh = useRefresh();

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [refresh, intervalMs]);

    return refresh;
};

/**
 * Hook that listens for browser visibility changes and refreshes when the tab becomes visible
 * This ensures data is fresh when users return to the admin interface
 */
export const useVisibilityRefresh = () => {
    const refresh = useRefresh();

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refresh();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [refresh]);

    return refresh;
};
