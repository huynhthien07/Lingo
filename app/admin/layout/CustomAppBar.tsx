import { AppBar, TitlePortal, UserMenu } from 'react-admin';
import { Typography, Box } from '@mui/material';
import { School } from '@mui/icons-material';

export const CustomAppBar = () => (
    <AppBar
        sx={{
            '& .RaAppBar-toolbar': {
                backgroundColor: '#1976d2',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                minHeight: '64px',
            },
        }}
        userMenu={<UserMenu />}
    >
        <TitlePortal />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School sx={{ color: 'white', fontSize: 28 }} />
            <Typography
                variant="h6"
                sx={{
                    color: 'white',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                }}
            >
                Lingo Admin
            </Typography>
        </Box>
    </AppBar>
);
