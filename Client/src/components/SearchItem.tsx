import React, { useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import { ShoppingListItem } from '../types/ShoppingListItem';
import { shoppingListApi } from '../services/api';

interface SearchItemProps {
    onEditItem: (item: ShoppingListItem) => void;
    onDeleteItem: (id: string) => void;
}

const SearchItem: React.FC<SearchItemProps> = ({ onEditItem, onDeleteItem }) => {
    const [searchId, setSearchId] = useState('');
    const [item, setItem] = useState<ShoppingListItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchId.trim()) {
            setError('Please enter an item ID');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setItem(null);
            const data = await shoppingListApi.getItemById(searchId.trim());
            setItem(data);
        } catch (err) {
            setError('Item not found or failed to fetch item');
            setItem(null);
            console.error('Error fetching item:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await shoppingListApi.deleteItem(id);
            setItem(null);
            setSearchId('');
            setError(null);
        } catch (err) {
            setError('Failed to delete item');
            console.error('Error deleting item:', err);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Search Item by ID
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3, maxWidth: 500 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    <TextField
                        fullWidth
                        label="Item ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Enter item ID"
                        variant="outlined"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={loading}
                        startIcon={<Search />}
                        sx={{
                            py: 1.5,
                            px: 3,
                            backgroundColor: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={20} /> : 'Search'}
                    </Button>
                </Box>
            </Paper>

            {item && (
                <Card sx={{ maxWidth: 600, boxShadow: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Item Details
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ minWidth: 200, flex: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Item Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {item.itemName}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ minWidth: 100 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Quantity
                                    </Typography>
                                    <Chip 
                                        label={item.quantity} 
                                        color="primary" 
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                                <Box sx={{ minWidth: 200, flex: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Category
                                    </Typography>
                                    <Chip 
                                        label={item.category} 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                                
                                <Box sx={{ minWidth: 200, flex: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Item ID
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {item.id}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => onEditItem(item)}
                                color="primary"
                            >
                                Edit Item
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Delete />}
                                onClick={() => handleDelete(item.id)}
                                color="error"
                            >
                                Delete Item
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {!item && !loading && searchId && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No item found with the provided ID
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Please check the ID and try again
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default SearchItem; 