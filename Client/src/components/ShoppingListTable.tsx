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
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { ShoppingListItem } from '../types/ShoppingListItem';
import { shoppingListApi } from '../services/api';

interface ShoppingListTableProps {
    onEditItem: (item: ShoppingListItem) => void;
}

const ShoppingListTable: React.FC<ShoppingListTableProps> = ({ onEditItem }) => {
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchItems();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Shopping List Items
            </Typography>
            
            {items.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No items in your shopping list yet.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Add some items to get started!
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {item.itemName}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={item.quantity} 
                                            color="primary" 
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={item.category} 
                                            variant="outlined" 
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => onEditItem(item)}
                                            color="primary"
                                            sx={{ mr: 1 }}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(item.id)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ShoppingListTable; 