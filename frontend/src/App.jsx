/**
 * Main App Component
 * 
 * Sets up routing with authentication and role-based access control.
 * Incluye timeout de sesión por inactividad (30 minutos).
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportFormPage from './pages/ReportFormPage';
import MeridaReportFormPage from './pages/MeridaReportFormPage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import OperatorReportDetailPage from './pages/OperatorReportDetailPage';
import HomePage from './pages/HomePage';

// Componente interno que usa el hook de timeout
function AppContent() {
  // Activar timeout de sesión
  useSessionTimeout();

  return (
    <Routes>
          {/* Public routes without layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* HomePage - Protected route with layout */}
          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

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
            path="/reportar-merida"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MeridaReportFormPage />
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

          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
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

          <Route
            path="/supervisor/users"
            element={
              <ProtectedRoute requireMinRole="supervisor">
                <MainLayout>
                  <UserManagementPage />
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
                  <OperatorDashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/operator/report/:id"
            element={
              <ProtectedRoute requireMinRole="operator">
                <MainLayout>
                  <OperatorReportDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
