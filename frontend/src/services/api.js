/**
 * API Service for UCU Reporta
 * 
 * Handles all HTTP requests to the FastAPI backend.
 * Includes automatic token injection for authenticated requests.
 */
import axios from 'axios';

// Base URL from environment variable or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo limpiar auth y redirigir si es un 401 en una ruta protegida
    // NO en el login mismo
    if (error.response?.status === 401 && error.config.url !== '/auth/login') {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Usar navigate en lugar de window.location para evitar refresh
      // El componente que reciba el error manejará el redirect
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} User data
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user and get access token
 * @param {Object} credentials - Email and password
 * @returns {Promise} Token and user data
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} User data
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ============================================================================
// Reports API
// ============================================================================

/**
 * Create a new report
 * @param {Object} reportData - Report data
 * @returns {Promise} Created report
 */
export const createReport = async (reportData) => {
  const response = await api.post('/reports', reportData);
  return response.data;
};

/**
 * Get reports with optional filters
 * @param {Object} filters - Query parameters (status, category, etc.)
 * @returns {Promise} Array of reports
 */
export const getReports = async (filters = {}) => {
  const response = await api.get('/reports', { params: filters });
  return response.data;
};

/**
 * Get single report by ID
 * @param {number} reportId - Report ID
 * @returns {Promise} Report data
 */
export const getReport = async (reportId) => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

/**
 * Delete a report
 * @param {number} reportId - Report ID
 * @returns {Promise} void
 */
export const deleteReport = async (reportId) => {
  const response = await api.delete(`/reports/${reportId}`);
  return response.data;
};

/**
 * Upload photo for a report
 * @param {number} reportId - Report ID
 * @param {File} file - Image file
 * @returns {Promise} Updated report with photo_url
 */
export const uploadReportPhoto = async (reportId, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await api.post(`/reports/${reportId}/upload-photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ============================================================================
// Admin API
// ============================================================================

/**
 * Get admin dashboard summary
 * @returns {Promise} Dashboard metrics
 */
export const getAdminSummary = async () => {
  const response = await api.get('/admin/reports/summary');
  return response.data;
};

/**
 * Update report status (admin only)
 * @param {number} reportId - Report ID
 * @param {Object} statusData - New status and optional comment
 * @returns {Promise} Updated report
 */
export const updateReportStatus = async (reportId, statusData) => {
  const response = await api.patch(`/admin/reports/${reportId}/status`, statusData);
  return response.data;
};

/**
 * Get all users (admin only)
 * @returns {Promise} List of all users
 */
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

/**
 * Update user role (admin only)
 * @param {number} userId - User ID
 * @param {string} role - New role (citizen or admin)
 * @returns {Promise} Updated user
 */
export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get full URL for uploaded photos
 * @param {string} photoUrl - Relative photo URL from backend
 * @returns {string} Full URL
 */
export const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) return photoUrl;
  return `${BASE_URL}${photoUrl}`;
};

export default api;
