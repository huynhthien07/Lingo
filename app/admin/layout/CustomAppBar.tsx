import { AppBar, TitlePortal, UserMenu } from 'react-admin';
import { Typography, Box, useTheme } from '@mui/material';
import { School } from '@mui/icons-material';
import { DarkModeToggle } from '../components/DarkModeToggle';

export const CustomAppBar = () => {
    const theme = useTheme();

    return (
        <AppBar
            sx={{
                '& .RaAppBar-toolbar': {
                    backgroundColor: theme.palette.primary.main,
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto', marginRight: 2 }}>
                <DarkModeToggle />
            </Box>
        </AppBar>
    );
