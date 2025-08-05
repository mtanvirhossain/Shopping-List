import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Tabs,
    Tab,
    FormControlLabel,
    Checkbox,
    CircularProgress
} from '@mui/material';
import { LoginRequest, RegisterRequest, AuthResponse, UserRole, UserStatus } from '../types/Auth';
import { authService } from '../services/auth';

/**
 * Interface for the Login component props
 * Defines the callback function when user successfully authenticates
 */
interface LoginProps {
    /** Callback function called when user successfully logs in or registers */
    onLoginSuccess: () => void;
}

/**
 * Login component that handles both user login and registration
 * Provides a tabbed interface for switching between login and registration forms
 */
const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    // State for controlling which tab is active (0 = Login, 1 = Register)
    const [tabValue, setTabValue] = useState(0);
    
    // State for login form data
    const [loginData, setLoginData] = useState<LoginRequest>({
        username: '',
        password: ''
    });
    
    // State for registration form data with all required fields
    const [registerData, setRegisterData] = useState<RegisterRequest>({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    
    // State for managing loading states during API calls
    const [loading, setLoading] = useState(false);
    
    // State for displaying error messages to users
    const [error, setError] = useState<string>('');
    
    // State for showing/hiding password in form fields
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Handles tab changes between Login and Register
     * Clears any existing errors when switching tabs
     */
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError(''); // Clear errors when switching tabs
    };

    /**
     * Handles changes to login form fields
     * Updates the loginData state with new field values
     */
    const handleLoginChange = (field: keyof LoginRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    /**
     * Handles changes to registration form fields
     * Updates the registerData state with new field values
     */
    const handleRegisterChange = (field: keyof RegisterRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    /**
     * Handles login form submission
     * Validates input, calls authentication service, and handles response
     */
    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default form submission
        
        // Basic client-side validation
        if (!loginData.username.trim() || !loginData.password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Call the authentication service to login
            const response = await authService.login(loginData);
            
            // Store the JWT token in localStorage
            authService.setToken(response.token);
            
            // If successful, call the onLoginSuccess callback
            onLoginSuccess();
        } catch (err: any) {
            // Handle login errors and display appropriate message
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles registration form submission
     * Validates input, calls registration service, and handles response
     */
    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default form submission
        
        // Basic client-side validation for all required fields
        const requiredFields = ['username', 'email', 'password', 'firstName', 'lastName'] as const;
        const emptyFields = requiredFields.filter(field => !registerData[field].trim());
        
        if (emptyFields.length > 0) {
            setError('Please fill in all fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Basic password validation
        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Call the authentication service to register
            const response = await authService.register(registerData);
            
            // Store the JWT token in localStorage
            authService.setToken(response.token);
            
            // If successful, call the onLoginSuccess callback (registration auto-logs in user)
            onLoginSuccess();
        } catch (err: any) {
            // Handle registration errors and display appropriate message
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage);
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Shopping List App
                    </Typography>
                    
                    {/* Tab navigation for Login/Register */}
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="Login" />
                        <Tab label="Register" />
                    </Tabs>

                    {/* Display error messages if any */}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    {tabValue === 0 && (
                        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="login-username"
                                label="Username or Email"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={loginData.username}
                                onChange={handleLoginChange('username')}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="login-password"
                                autoComplete="current-password"
                                value={loginData.password}
                                onChange={handleLoginChange('password')}
                                disabled={loading}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Show password"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Sign In'}
                            </Button>
                        </Box>
                    )}

                    {/* Registration Form */}
                    {tabValue === 1 && (
                        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="register-username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={registerData.username}
                                onChange={handleRegisterChange('username')}
                                disabled={loading}
                                helperText="Choose a unique username (3-50 characters)"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="register-email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                type="email"
                                value={registerData.email}
                                onChange={handleRegisterChange('email')}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="register-firstName"
                                label="First Name"
                                name="firstName"
                                autoComplete="given-name"
                                value={registerData.firstName}
                                onChange={handleRegisterChange('firstName')}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="register-lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="family-name"
                                value={registerData.lastName}
                                onChange={handleRegisterChange('lastName')}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="register-password"
                                autoComplete="new-password"
                                value={registerData.password}
                                onChange={handleRegisterChange('password')}
                                disabled={loading}
                                helperText="Minimum 6 characters"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Show password"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Create Account'}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;