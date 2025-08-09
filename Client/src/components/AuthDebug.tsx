import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { BugReport, Security, Clear } from '@mui/icons-material';
import { authService } from '../services/auth';

/**
 * Debug component to help troubleshoot authentication issues
 */
const AuthDebug: React.FC = () => {
    const checkAuthStatus = () => {
        console.log('=== AUTH DEBUG ===');
        console.log('isAuthenticated():', authService.isAuthenticated());
        console.log('getToken():', authService.getToken() ? 'Token exists' : 'No token');
        console.log('sessionStorage authToken:', sessionStorage.getItem('authToken') ? 'Exists' : 'Not found');
        console.log('==================');
    };

    const clearAuth = () => {
        authService.removeToken();
        console.log('Auth cleared');
        checkAuthStatus();
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 1,
                mb: 3,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BugReport sx={{ color: '#6366f1', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Authentication Debug
                </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 3 }}>
                Use these tools to troubleshoot authentication issues. Check the browser console for detailed logs.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    onClick={checkAuthStatus}
                    variant="outlined"
                    startIcon={<Security />}
                    sx={{
                        color: '#6366f1',
                        borderColor: 'rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    Check Auth Status
                </Button>
                <Button
                    onClick={clearAuth}
                    variant="outlined"
                    startIcon={<Clear />}
                    sx={{
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        '&:hover': {
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    Clear Auth
                </Button>
            </Box>
        </Paper>
    );
};

export default AuthDebug;

