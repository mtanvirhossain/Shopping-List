import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    Box,
    Container,
    Button,
    Paper,
} from '@mui/material';
import { ShoppingCart, Add, List, Search, Logout } from '@mui/icons-material';

interface NavBarProps {
    currentTab: number;
    onTabChange: (tab: number) => void;
    onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentTab, onTabChange, onLogout }) => {
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        onTabChange(newValue);
    };

    return (
        <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative',
                zIndex: 1,
            }}
        >
            <Container maxWidth="lg">
                <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
                    {/* Logo and Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                boxShadow: '0 4px 16px 0 rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            <ShoppingCart sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: { xs: 'none', sm: 'block' },
                            }}
                        >
                            Shopping List
                        </Typography>
                    </Box>

                    {/* Navigation Tabs */}
                    <Paper
                        elevation={0}
                        sx={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 2,
                            overflow: 'hidden',
                            display: { xs: 'none', md: 'block' },
                        }}
                    >
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTab-root': {
                                    color: '#a1a1aa',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    minHeight: 48,
                                    px: 3,
                                    '&.Mui-selected': {
                                        color: '#6366f1',
                                        background: 'rgba(99, 102, 241, 0.08)',
                                    },
                                    '&:hover': {
                                        color: '#ffffff',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                },
                                '& .MuiTabs-indicator': {
                                    display: 'none',
                                },
                            }}
                        >
                            <Tab
                                icon={<List sx={{ fontSize: 20 }} />}
                                label="All Items"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<Add sx={{ fontSize: 20 }} />}
                                label="Add Item"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<Search sx={{ fontSize: 20 }} />}
                                label="Search Item"
                                iconPosition="start"
                            />
                        </Tabs>
                    </Paper>

                    {/* Logout Button */}
                    <Button
                        variant="outlined"
                        onClick={onLogout}
                        startIcon={<Logout />}
                        sx={{ 
                            ml: 2,
                            color: '#a1a1aa',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.25)',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                color: '#ffffff',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavBar; 