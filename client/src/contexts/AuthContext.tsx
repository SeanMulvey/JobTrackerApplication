import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set auth token header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch current user
        const res = await axios.get('/api/auth/me');
        
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Clear localStorage on error
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    // DEBUG: Log login attempt to verify function is called
    console.log('Login attempt with email:', email);
    try {
      // DEBUG: Log the API endpoint we're calling
      console.log('Calling API endpoint: /api/auth/login');
      
      const res = await axios.post('/api/auth/login', { email, password });
      
      // DEBUG: Log the API response structure
      console.log('Login API response structure:', {
        success: res.data.success,
        hasToken: !!res.data.token,
        dataKeys: Object.keys(res.data)
      });
      
      if (res.data.success) {
        // DEBUG: Log successful login
        console.log('Login successful, token received');
        
        // Set token to localStorage
        localStorage.setItem('token', res.data.token);
        
        // Set auth token header
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // DEBUG: Log the attempt to fetch user data
        console.log('Fetching user data after login');
        
        // Fetch user data
        const userRes = await axios.get('/api/auth/me');
        
        // DEBUG: Log user data response
        console.log('User data received:', userRes.data);
        
        setUser(userRes.data.data);
        setIsAuthenticated(true);
        
        toast.success('Login successful');
      } else {
        // DEBUG: Log when response is successful but doesn't contain success flag
        console.error('Login response did not include success flag:', res.data);
        toast.error('Login failed: Unexpected response format');
      }
    } catch (error: any) {
      // DEBUG: Log detailed error information
      console.error('Login error:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      
      // DEBUG: Check if API server is reachable
      if (!error.response) {
        console.error('No response from server. Check if API server is running.');
        toast.error('Server unreachable. Please try again later.');
      }
      
      throw error;
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    // DEBUG: Log registration attempt to verify function is called
    console.log('Registration attempt with:', { name, email, password: '******' });
    try {
      // DEBUG: Log the API endpoint we're calling
      console.log('Calling API endpoint: /api/auth/register');
      
      const res = await axios.post('/api/auth/register', { name, email, password });
      
      // DEBUG: Log the API response
      console.log('Registration API response:', res.data);
      
      if (res.data.success) {
        // DEBUG: Log successful registration and token
        console.log('Registration successful, token received');
        
        // Set token to localStorage
        localStorage.setItem('token', res.data.token);
        
        // Set auth token header
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // DEBUG: Log the attempt to fetch user data
        console.log('Fetching user data after registration');
        
        // Fetch user data
        const userRes = await axios.get('/api/auth/me');
        
        // DEBUG: Log user data response
        console.log('User data received:', userRes.data);
        
        setUser(userRes.data.data);
        setIsAuthenticated(true);
        
        toast.success('Registration successful');
      } else {
        // DEBUG: Log when response is successful but doesn't contain success flag
        console.error('Registration response did not include success flag:', res.data);
        toast.error('Registration failed: Unexpected response format');
      }
    } catch (error: any) {
      // DEBUG: Log detailed error information
      console.error('Registration error:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      // Check for duplicate email error
      if (error.response?.data?.includes('duplicate key error') && error.response?.data?.includes('email')) {
        toast.error('An account with this email already exists. Please use a different email or try logging in.');
      } else {
        const message = error.response?.data?.error || 'Registration failed';
        toast.error(message);
      }
      
      // DEBUG: Check if API server is reachable
      if (!error.response) {
        console.error('No response from server. Check if API server is running.');
        toast.error('Server unreachable. Please try again later.');
      }
      
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logged out successfully');
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      const res = await axios.post('/api/auth/forgotpassword', { email });
      
      if (res.data.success) {
        toast.success('Password reset email sent');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    try {
      const res = await axios.put(`/api/auth/resetpassword/${token}`, { password });
      
      if (res.data.success) {
        toast.success('Password reset successful');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reset password';
      toast.error(message);
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (name: string, email: string) => {
    try {
      const res = await axios.put('/api/auth/updatedetails', { name, email });
      
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await axios.put('/api/auth/updatepassword', { 
        currentPassword, 
        newPassword 
      });
      
      if (res.data.success) {
        toast.success('Password updated successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update password';
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 