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
    CircularProgress,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, ShoppingCart } from '@mui/icons-material';
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
            console.log('Attempting login...');
            const response = await authService.login(loginData);
            console.log('Login successful, response:', response);
            
            // Store the JWT token in sessionStorage
            authService.setToken(response.token);
            console.log('Token stored in sessionStorage');
            
            // Verify token was stored
            const storedToken = authService.getToken();
            console.log('Stored token verification:', storedToken ? 'Token found' : 'Token not found');
            
            // If successful, call the onLoginSuccess callback
            console.log('Calling onLoginSuccess callback');
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
            console.log('Attempting registration...');
            const response = await authService.register(registerData);
            console.log('Registration successful, response:', response);
            
            // Store the JWT token in sessionStorage
            authService.setToken(response.token);
            console.log('Token stored in sessionStorage');
            
            // Verify token was stored
            const storedToken = authService.getToken();
            console.log('Stored token verification:', storedToken ? 'Token found' : 'Token not found');
            
            // If successful, call the onLoginSuccess callback (registration auto-logs in user)
            console.log('Calling onLoginSuccess callback');
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
        <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh',
                    justifyContent: 'center',
                }}
            >
                {/* Beautiful header with icon */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
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
                            mb: 2,
                            boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.3)',
                        }}
                    >
                        <ShoppingCart sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography 
                        component="h1" 
                        variant="h3" 
                        align="center" 
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                        }}
                    >
                        Shopping List
                    </Typography>
                    <Typography 
                        variant="body1" 
                        align="center" 
                        sx={{ 
                            color: '#a1a1aa',
                            fontSize: '1.1rem',
                        }}
                    >
                        Organize your shopping with elegance
                    </Typography>
                </Box>

                <Paper 
                    elevation={0}
                    sx={{ 
                        padding: 4, 
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                        borderRadius: 2,
                    }}
                >
                    {/* Tab navigation for Login/Register */}
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        centered
                        sx={{
                            mb: 3,
                            '& .MuiTab-root': {
                                color: '#a1a1aa',
                                fontWeight: 600,
                                fontSize: '1rem',
                                '&.Mui-selected': {
                                    color: '#6366f1',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#6366f1',
                                height: 3,
                                borderRadius: 2,
                            },
                        }}
                    >
                        <Tab label="Sign In" />
                        <Tab label="Create Account" />
                    </Tabs>

                    {/* Display error messages if any */}
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mt: 2, 
                                mb: 2,
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5',
                                '& .MuiAlert-icon': {
                                    color: '#fca5a5',
                                },
                            }}
                        >
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                }}
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
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: '#a1a1aa' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ 
                                    mt: 4, 
                                    mb: 2,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                ) : (
                                    'Sign In'
                                )}
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: '#a1a1aa',
                                    },
                                }}
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                }}
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                }}
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                }}
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
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: '#a1a1aa' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: '#a1a1aa',
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ 
                                    mt: 4, 
                                    mb: 2,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;