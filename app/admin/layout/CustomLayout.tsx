import { Layout, LayoutProps } from 'react-admin';
import { CustomAppBar } from './CustomAppBar';
import { CustomMenu } from './CustomMenu';
import { useVisibilityRefresh } from '../hooks/useAutoRefresh';

export const CustomLayout = (props: LayoutProps) => {
    // Global auto-refresh when tab becomes visible
    useVisibilityRefresh();

    return (
        <Layout
            {...props}
            appBar={CustomAppBar}
            menu={CustomMenu}
            sx={{
                '& .RaLayout-content': {
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                },
            }}
        />
    );
};
