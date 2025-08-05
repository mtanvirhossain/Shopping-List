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
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
            <Container maxWidth="lg">
                <Toolbar>
                    <ShoppingCart sx={{ mr: 2, fontSize: 30 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Shopping List App
                    </Typography>
                    <Button
                        color="inherit"
                        onClick={onLogout}
                        startIcon={<Logout />}
                        sx={{ ml: 2 }}
                    >
                        Logout
                    </Button>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            textColor="inherit"
                            indicatorColor="secondary"
                            sx={{
                                '& .MuiTab-root': {
                                    color: 'white',
                                    '&.Mui-selected': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <Tab
                                icon={<List />}
                                label="All Items"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<Add />}
                                label="Add Item"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<Search />}
                                label="Search Item"
                                iconPosition="start"
                            />
                        </Tabs>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavBar; 