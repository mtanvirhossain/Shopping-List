import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from '@mui/material';
import { Delete, Edit, Add, Save, Cancel } from '@mui/icons-material';
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

interface ShoppingListTableProps {
    onEditItem: (item: ShoppingListItem) => void;
}

const ShoppingListTable: React.FC<ShoppingListTableProps> = ({ onEditItem }) => {
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
    const [editFormData, setEditFormData] = useState({
        itemName: '',
        quantity: 1,
        category: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await shoppingListApi.getAllItems();
            setItems(data);
        } catch (err) {
            setError('Failed to fetch shopping list items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await shoppingListApi.deleteItem(id);
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            setError('Failed to delete item');
            console.error('Error deleting item:', err);
        }
    };

    const handleEditClick = (item: ShoppingListItem) => {
        setEditingItem(item);
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

        if (!editingItem) return;

        try {
            setEditLoading(true);
            setEditError(null);
            
            // Update the item
            const updatedItem = await shoppingListApi.updateItem(editingItem.id, {
                ...editingItem,
                ...editFormData
            });
            
            // Update the local items state
            setItems(items.map(item => 
                item.id === editingItem.id ? updatedItem : item
            ));
            setEditSuccess(true);
            
            // Close modal after a short delay
            setTimeout(() => {
                setEditModalOpen(false);
                setEditSuccess(false);
                setEditingItem(null);
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
        setEditingItem(null);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        fetchItems();
    }, []);

    if (loading) {
        return (
            <Box 
                display="flex" 
                flexDirection="column"
                justifyContent="center" 
                alignItems="center" 
                minHeight="300px"
                gap={2}
            >
                <CircularProgress 
                    size={40}
                    sx={{ 
                        color: '#6366f1',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        },
                    }} 
                />
                <Typography variant="body2" color="text.secondary">
                    Loading your shopping list...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 2,
                    mb: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 600 }}>
                        Error Loading Items
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#ef4444', mt: 1 }}>
                    {error}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={fetchItems}
                    sx={{
                        mt: 2,
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        },
                    }}
                >
                    Retry
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Shopping List Items
                </Typography>
                <Typography variant="body1" sx={{ color: '#a1a1aa' }}>
                    Manage your shopping items with ease
                </Typography>
            </Box>

            {/* Empty State */}
            {items.length === 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem',
                        }}
                    >
                        <Add sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 1 }}>
                        No items yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                        Start by adding your first shopping item
                    </Typography>
                </Paper>
            )}

            {/* Table */}
            {items.length > 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                                    <TableCell 
                                        sx={{ 
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            py: 3,
                                            px: 3,
                                            borderBottom: 'none',
                                        }}
                                    >
                                        Item Name
                                    </TableCell>
                                    <TableCell 
                                        sx={{ 
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            py: 3,
                                            px: 3,
                                            borderBottom: 'none',
                                        }}
                                    >
                                        Quantity
                                    </TableCell>
                                    <TableCell 
                                        sx={{ 
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            py: 3,
                                            px: 3,
                                            borderBottom: 'none',
                                        }}
                                    >
                                        Category
                                    </TableCell>
                                    <TableCell 
                                        sx={{ 
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            py: 3,
                                            px: 3,
                                            borderBottom: 'none',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow
                                        key={item.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                            },
                                            borderBottom: index < items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        <TableCell 
                                            sx={{ 
                                                color: '#ffffff',
                                                fontWeight: 500,
                                                fontSize: '1rem',
                                                py: 2.5,
                                                px: 3,
                                                borderBottom: 'none',
                                            }}
                                        >
                                            {item.itemName}
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5, px: 3, borderBottom: 'none' }}>
                                            <Chip 
                                                label={item.quantity} 
                                                sx={{
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem',
                                                    height: 28,
                                                    minWidth: 40,
                                                    '& .MuiChip-label': {
                                                        px: 1.5,
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5, px: 3, borderBottom: 'none' }}>
                                            <Chip 
                                                label={item.category || 'General'} 
                                                variant="outlined"
                                                sx={{
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                    color: '#a1a1aa',
                                                    fontWeight: 500,
                                                    fontSize: '0.85rem',
                                                    height: 28,
                                                    '&:hover': {
                                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                                        color: '#ffffff',
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5, px: 3, borderBottom: 'none', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title="Edit item">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditClick(item)}
                                                        sx={{
                                                            color: '#6366f1',
                                                            background: 'rgba(99, 102, 241, 0.1)',
                                                            '&:hover': {
                                                                background: 'rgba(99, 102, 241, 0.2)',
                                                                transform: 'scale(1.05)',
                                                            },
                                                            transition: 'all 0.2s ease-in-out',
                                                        }}
                                                    >
                                                        <Edit sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete item">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(item.id)}
                                                        sx={{
                                                            color: '#ef4444',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            '&:hover': {
                                                                background: 'rgba(239, 68, 68, 0.2)',
                                                                transform: 'scale(1.05)',
                                                            },
                                                            transition: 'all 0.2s ease-in-out',
                                                        }}
                                                    >
                                                        <Delete sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
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

export default ShoppingListTable; 