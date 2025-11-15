/**
 * Main App Component
 * 
 * Sets up routing with authentication and role-based access control.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportFormPage from './pages/ReportFormPage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes without layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen routes - require authentication */}
          <Route
            path="/reportar"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReportFormPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/panel"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CitizenDashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin routes - require authentication and admin role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout>
                  <AdminDashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout>
                  <UserManagementPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Supervisor routes - require supervisor or admin role */}
          <Route
            path="/supervisor"
            element={
              <ProtectedRoute requireMinRole="supervisor">
                <MainLayout>
                  <AdminDashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Operator routes - require operator, supervisor or admin role */}
          <Route
            path="/operator"
            element={
              <ProtectedRoute requireMinRole="operator">
                <MainLayout>
                  <AdminDashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
