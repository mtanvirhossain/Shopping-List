import React, { useState, useEffect } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { shoppingListApi } from '../services/api';
import { ShoppingListItem } from '../types/ShoppingListItem';

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

interface AddItemFormProps {
    editingItem?: ShoppingListItem | null;
    onEditComplete?: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ editingItem, onEditComplete }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        quantity: 1,
        category: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!editingItem;

    // Update form data when editing item changes
    useEffect(() => {
        if (editingItem) {
            setFormData({
                itemName: editingItem.itemName,
                quantity: editingItem.quantity,
                category: editingItem.category
            });
        } else {
            setFormData({
                itemName: '',
                quantity: 1,
                category: ''
            });
        }
    }, [editingItem]);

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.itemName.trim() || !formData.category) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            if (isEditing && editingItem) {
                // Update existing item
                await shoppingListApi.updateItem(editingItem.id, {
                    ...editingItem,
                    ...formData
                });
                setSuccess(true);
                // Clear form after successful edit
                setFormData({
                    itemName: '',
                    quantity: 1,
                    category: ''
                });
                // Notify parent component that edit is complete
                if (onEditComplete) {
                    onEditComplete();
                }
            } else {
                // Add new item
                await shoppingListApi.addItem(formData);
                setSuccess(true);
                setFormData({
                    itemName: '',
                    quantity: 1,
                    category: ''
                });
            }
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(isEditing ? 'Failed to update item. Please try again.' : 'Failed to add item. Please try again.');
            console.error('Error saving item:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {isEditing ? 'Edit Item' : 'Add New Item'}
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {isEditing ? 'Item updated successfully!' : 'Item added successfully!'}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, maxWidth: 500 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Item Name"
                        value={formData.itemName}
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
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                        margin="normal"
                        required
                        variant="outlined"
                        inputProps={{ min: 1, max: 100 }}
                    />

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
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

                    <Box sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={isEditing ? <Edit /> : <Add />}
                            disabled={loading}
                            fullWidth
                            sx={{
                                py: 1.5,
                                backgroundColor: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                isEditing ? 'Update Item' : 'Add Item'
                            )}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default AddItemForm; 