import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Paper,
    GlobalStyles,
} from '@mui/material';
import NavBar from './components/NavBar';
import ShoppingListTable from './components/ShoppingListTable';
import AddItemForm from './components/AddItemForm';
import SearchItem from './components/SearchItem';
import ConnectionStatus from './components/ConnectionStatus';
import Login from './components/Login';
import AuthDebug from './components/AuthDebug';
import { ShoppingListItem } from './types/ShoppingListItem';
import { authService } from './services/auth';

// Create a beautiful dark theme with dot background - matching Lightswind design
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1', // Indigo
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#ec4899', // Pink
            light: '#f472b6',
            dark: '#db2777',
        },
        background: {
            default: '#0a0a0a', // Pure black background
            paper: 'rgba(255, 255, 255, 0.03)', // Very subtle glass effect
        },
        text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.025em',
        },
        h2: {
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        h3: {
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        h4: {
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        h5: {
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 20px',
                    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.3)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                },
                contained: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 6,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                        },
                        '&.Mui-focused': {
                            borderColor: '#6366f1',
                            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.15)',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#a1a1aa',
                        '&.Mui-focused': {
                            color: '#6366f1',
                        },
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    overflow: 'hidden',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                },
                head: {
                    fontWeight: 600,
                    color: '#ffffff',
                },
            },
        },
    },
});

// Global styles for dot background - matching Lightswind design
const globalStyles = {
    body: {
        background: '#0a0a0a',
        backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0',
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0',
            pointerEvents: 'none',
            zIndex: 0,
        },
    },
};

const App: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleTabChange = (tab: number) => {
        setCurrentTab(tab);
        // No need to clear editing item since we use inline editing now
    };

    const handleEditItem = (item: ShoppingListItem) => {
        // This is now handled by inline editing in each component
        // Keeping for backward compatibility but not switching tabs
        console.log('Edit item:', item);
    };

    const handleEditComplete = () => {
        setEditingItem(null);
        setRefreshKey(prev => prev + 1); // Force refresh of table data
    };

    const handleDeleteItem = (id: string) => {
        // This will be handled by individual components
        console.log('Delete item with ID:', id);
    };

    const handleLoginSuccess = () => {
        console.log('Login success - setting authenticated to true');
        setIsAuthenticated(true);
        // Force a small delay to ensure token is stored
        setTimeout(() => {
            const isAuth = authService.isAuthenticated();
            console.log('Authentication check after login:', isAuth);
            if (!isAuth) {
                console.log('Token not found, re-checking...');
                setIsAuthenticated(false);
            }
        }, 100);
    };

    const handleLogout = () => {
        authService.removeToken();
        setIsAuthenticated(false);
        setCurrentTab(0);
    };

    useEffect(() => {
        // Check if user is already authenticated
        const checkAuth = () => {
            const authenticated = authService.isAuthenticated();
            console.log('Initial authentication check:', authenticated);
            setIsAuthenticated(authenticated);
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const renderTabContent = () => {
        switch (currentTab) {
            case 0:
                return <ShoppingListTable key={refreshKey} onEditItem={handleEditItem} />;
            case 1:
                return <AddItemForm editingItem={editingItem} onEditComplete={handleEditComplete} />;
            case 2:
                return <SearchItem onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />;
            default:
                return <ShoppingListTable key={refreshKey} onEditItem={handleEditItem} />;
        }
    };

    if (isLoading) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles styles={globalStyles} />
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '100vh',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                    '0%': {
                                        transform: 'scale(1)',
                                        opacity: 1,
                                    },
                                    '50%': {
                                        transform: 'scale(1.1)',
                                        opacity: 0.7,
                                    },
                                    '100%': {
                                        transform: 'scale(1)',
                                        opacity: 1,
                                    },
                                },
                            }}
                        />
                        <Box sx={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 500 }}>
                            Loading...
                        </Box>
                    </Box>
                </Box>
            </ThemeProvider>
        );
    }

    if (!isAuthenticated) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles styles={globalStyles} />
                <Login onLoginSuccess={handleLoginSuccess} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles styles={globalStyles} />
            <Box sx={{ minHeight: '100vh', position: 'relative' }}>
                <NavBar currentTab={currentTab} onTabChange={handleTabChange} onLogout={handleLogout} />
                
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
                    <ConnectionStatus />
                    <AuthDebug />
                    <Paper 
                        sx={{ 
                            p: 4, 
                            minHeight: '70vh',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        {renderTabContent()}
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default App; 