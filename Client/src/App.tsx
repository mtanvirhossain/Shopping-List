import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Paper,
} from '@mui/material';
import NavBar from './components/NavBar';
import ShoppingListTable from './components/ShoppingListTable';
import AddItemForm from './components/AddItemForm';
import SearchItem from './components/SearchItem';
import ConnectionStatus from './components/ConnectionStatus';
import { Login } from './components/Login';
import { ShoppingListItem } from './types/ShoppingListItem';
import { authService } from './services/auth';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    textTransform: 'none',
                },
            },
        },
    },
});

const App: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleTabChange = (tab: number) => {
        setCurrentTab(tab);
        if (tab !== 1) {
            setEditingItem(null);
        }
    };

    const handleEditItem = (item: ShoppingListItem) => {
        setEditingItem(item);
        setCurrentTab(1); // Switch to Add Item tab for editing
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
        setIsAuthenticated(true);
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
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <div>Loading...</div>
                </Box>
            </ThemeProvider>
        );
    }

    if (!isAuthenticated) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Login onLoginSuccess={handleLoginSuccess} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <NavBar currentTab={currentTab} onTabChange={handleTabChange} onLogout={handleLogout} />
                
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <ConnectionStatus />
                    <Paper sx={{ p: 4, minHeight: '70vh' }}>
                        {renderTabContent()}
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default App; 