import React, { useState, useEffect } from 'react';
import {
    Alert,
    Box,
    Button,
    Typography,
    CircularProgress,
    Paper,
} from '@mui/material';
import { Refresh, CheckCircle, Error, Wifi, WifiOff } from '@mui/icons-material';
import { shoppingListApi } from '../services/api';

const ConnectionStatus: React.FC = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        try {
            const connected = await shoppingListApi.testConnection();
            setIsConnected(connected);
        } catch (error) {
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        testConnection();
    }, []);

    if (isConnected === null && !loading) {
        return null;
    }

    return (
        <Box sx={{ mb: 3 }}>
            {isConnected ? (
                <Paper
                    elevation={0}
                    sx={{
                        background: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: 1,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 24 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ color: '#22c55e', fontWeight: 600 }}>
                            Backend Connected
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#a1a1aa', mt: 0.5 }}>
                            Your shopping list is ready to use
                        </Typography>
                    </Box>
                </Paper>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 1,
                        p: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Error sx={{ color: '#ef4444', fontSize: 24, mt: 0.5 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ color: '#ef4444', fontWeight: 600 }}>
                                Backend Connection Failed
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#a1a1aa', mt: 0.5, mb: 2 }}>
                                Please ensure your backend is running on http://localhost:7071
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={testConnection}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
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
                                {loading ? 'Testing...' : 'Retry Connection'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default ConnectionStatus; 