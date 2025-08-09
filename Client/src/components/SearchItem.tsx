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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Search, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { ShoppingListItem } from '../types/ShoppingListItem';
import { shoppingListApi } from '../services/api';

const categories = [
    'Groceries',
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Books',
    'Sports',
    'Health & Beauty',
    'Other'
];

interface SearchItemProps {
    onEditItem: (item: ShoppingListItem) => void;
    onDeleteItem: (id: string) => void;
}

const SearchItem: React.FC<SearchItemProps> = ({ onEditItem, onDeleteItem }) => {
    const [searchId, setSearchId] = useState('');
    const [item, setItem] = useState<ShoppingListItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        itemName: '',
        quantity: 1,
        category: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

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

    const handleEditClick = (item: ShoppingListItem) => {
        setEditFormData({
            itemName: item.itemName,
            quantity: item.quantity,
            category: item.category
        });
        setEditModalOpen(true);
        setEditError(null);
        setEditSuccess(false);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editFormData.itemName.trim() || !editFormData.category) {
            setEditError('Please fill in all required fields');
            return;
        }

        if (!item) return;

        try {
            setEditLoading(true);
            setEditError(null);
            
            // Update the item
            const updatedItem = await shoppingListApi.updateItem(item.id, {
                ...item,
                ...editFormData
            });
            
            // Update the local item state
            setItem(updatedItem);
            setEditSuccess(true);
            
            // Close modal after a short delay
            setTimeout(() => {
                setEditModalOpen(false);
                setEditSuccess(false);
            }, 1500);
            
        } catch (err) {
            setEditError('Failed to update item. Please try again.');
            console.error('Error updating item:', err);
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditCancel = () => {
        setEditModalOpen(false);
        setEditError(null);
        setEditSuccess(false);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
                                onClick={() => handleEditClick(item)}
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

            {/* Edit Modal */}
            <Dialog 
                open={editModalOpen} 
                onClose={handleEditCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                    }
                }}
            >
                <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    Edit Item
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    {editSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Item updated successfully!
                        </Alert>
                    )}

                    {editError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {editError}
                        </Alert>
                    )}

                    <form onSubmit={handleEditSubmit}>
                        <TextField
                            fullWidth
                            label="Item Name"
                            value={editFormData.itemName}
                            onChange={(e) => handleInputChange('itemName', e.target.value)}
                            margin="normal"
                            required
                            variant="outlined"
                            placeholder="Enter item name"
                        />

                        <TextField
                            fullWidth
                            label="Quantity"
                            type="number"
                            value={editFormData.quantity}
                            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                            margin="normal"
                            required
                            variant="outlined"
                            inputProps={{ min: 1, max: 100 }}
                        />

                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={editFormData.category}
                                label="Category"
                                onChange={(e) => handleInputChange('category', e.target.value)}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </form>
                </DialogContent>
                
                <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Button
                        onClick={handleEditCancel}
                        startIcon={<Cancel />}
                        variant="outlined"
                        disabled={editLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        startIcon={editLoading ? <CircularProgress size={20} /> : <Save />}
                        variant="contained"
                        disabled={editLoading}
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            },
                        }}
                    >
                        {editLoading ? 'Updating...' : 'Update Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SearchItem; 