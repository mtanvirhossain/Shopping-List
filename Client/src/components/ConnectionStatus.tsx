import React, { useState, useEffect } from 'react';
import {
    Alert,
    Box,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
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
        <Box sx={{ mb: 2 }}>
            {isConnected ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                    ✅ Backend connected successfully
                </Alert>
            ) : (
                <Alert 
                    severity="error" 
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={testConnection}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
                        >
                            {loading ? 'Testing...' : 'Retry'}
                        </Button>
                    }
                    sx={{ mb: 2 }}
                >
                    ❌ Cannot connect to backend server
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Please ensure your backend is running on http://localhost:7071
                    </Typography>
                </Alert>
            )}
        </Box>
    );
};

export default ConnectionStatus; 