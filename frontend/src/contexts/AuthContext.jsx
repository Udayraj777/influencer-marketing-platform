import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// API functions are now imported from the API service layer

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        console.log('🔄 AuthContext: Loading stored authentication...');
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        console.log('🔐 AuthContext: Found token:', !!token);
        console.log('👤 AuthContext: Found user:', !!user);

        if (token && user) {
          console.log('✅ AuthContext: Restoring authentication');
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              token,
              user: JSON.parse(user)
            }
          });
        } else {
          console.log('❌ AuthContext: No stored authentication found');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('💥 AuthContext: Error loading stored auth:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadStoredAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      // Refresh token every 6 hours
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 6 * 60 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [state.isAuthenticated, state.token]);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      console.log('🔐 AuthContext: Starting login for:', email);
      const data = await apiService.login({ email, password });
      console.log('📥 AuthContext: Login response:', data);

      // Store in localStorage using the same key as API service
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('💾 AuthContext: Stored login token and user in localStorage');

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: data
      });

      console.log('✅ AuthContext: Login successful, user authenticated');
      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      console.log('📝 AuthContext: Starting registration...');
      const data = await apiService.register(userData);
      console.log('📥 AuthContext: Registration response:', data);

      // Store in localStorage using the same key as API service
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('💾 AuthContext: Stored token and user in localStorage');

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: data
      });

      console.log('✅ AuthContext: Registration successful, user authenticated');
      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext: Registration failed:', error);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (state.token) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const data = await apiService.refreshToken();

      // Update stored token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
        payload: data
      });

      return { success: true };
    } catch (error) {
      // If refresh fails, logout user
      logout();
      return { success: false, error: error.message };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const data = await apiService.getCurrentUser();

      // Update stored user
      const updatedUser = { ...state.user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: data.user
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Get authenticated headers for API calls
  const getAuthHeaders = () => {
    return state.token
      ? { Authorization: `Bearer ${state.token}` }
      : {};
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user && state.user.role === role;
  };

  // Check if user profile is complete
  const isProfileComplete = () => {
    return state.user && state.user.profileId && state.user.isEmailVerified;
  };

  const contextValue = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    clearError,
    
    // Utilities
    getAuthHeaders,
    hasRole,
    isProfileComplete
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;