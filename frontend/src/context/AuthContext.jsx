/**
 * Authentication Context
 * 
 * Manages user authentication state across the application.
 * Handles login, logout, and session persistence.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log in a user
   * @param {Object} userData - User data from login response
   * @param {string} authToken - JWT token
   */
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Update user data in context and localStorage
   * @param {Object} updatedUserData - Updated user information
   */
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  /**
   * Check if user is supervisor
   * @returns {boolean}
   */
  const isSupervisor = () => {
    return user?.role === 'supervisor';
  };

  /**
   * Check if user is operator
   * @returns {boolean}
   */
  const isOperator = () => {
    return user?.role === 'operator';
  };

  /**
   * Check if user is citizen
   * @returns {boolean}
   */
  const isCitizen = () => {
    return user?.role === 'citizen';
  };

  /**
   * Check if user is staff (operator, supervisor, or admin)
   * @returns {boolean}
   */
  const isStaff = () => {
    return ['operator', 'supervisor', 'admin'].includes(user?.role);
  };

  /**
   * Get role level for permission checks
   * @returns {number} Role level (0-3)
   */
  const getRoleLevel = () => {
    const levels = {
      'citizen': 0,
      'operator': 1,
      'supervisor': 2,
      'admin': 3
    };
    return levels[user?.role] || 0;
  };

  /**
   * Check if user has minimum role level
   * @param {string} requiredRole - Minimum required role
   * @returns {boolean}
   */
  const hasMinRole = (requiredRole) => {
    const levels = {
      'citizen': 0,
      'operator': 1,
      'supervisor': 2,
      'admin': 3
    };
    return getRoleLevel() >= (levels[requiredRole] || 0);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    isSupervisor,
    isOperator,
    isCitizen,
    isStaff,
    getRoleLevel,
    hasMinRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
