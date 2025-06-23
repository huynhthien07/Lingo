import { Layout, LayoutProps } from 'react-admin';
import { CustomAppBar } from './CustomAppBar';
import { CustomMenu } from './CustomMenu';

export const CustomLayout = (props: LayoutProps) => (
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
