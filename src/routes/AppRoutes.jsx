import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ProtectedRoute from '../auth/ProtectedRoute';
import RoleRoute from '../auth/RoleRoute';

// Layout
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Public & Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import JobListingsPage from '../pages/employee/JobListingsPage';
import JobDetailsPage from '../pages/employee/JobDetailsPage';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import EmployeeProfilePage from '../pages/employee/EmployeeProfilePage';
import MyApplicationsPage from '../pages/employee/MyApplicationsPage';
import RecommendationsPage from '../pages/employee/RecommendationsPage';

// Employer Pages
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import CreateEditJobPage from '../pages/employer/CreateEditJobPage';
import ManageJobsPage from '../pages/employer/ManageJobsPage';
import ApplicantsPage from '../pages/employer/ApplicantsPage';
import EmployerProfilePage from '../pages/employer/EmployerProfilePage';

// Shared Pages
import ForbiddenPage from '../pages/shared/ForbiddenPage';
import NotFoundPage from '../pages/shared/NotFoundPage';

// Helper Root Redirector
function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/jobs" replace />;
  }
  if (role === 'employer') {
    return <Navigate to="/employer/dashboard" replace />;
  }
  return <Navigate to="/employee/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Index Route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public & Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />

          {/* Employee Routes (Protected + Role Guard) */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employee">
                  <EmployeeDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employee">
                  <EmployeeProfilePage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/applications"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employee">
                  <MyApplicationsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/recommendations"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employee">
                  <RecommendationsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Employer Routes (Protected + Role Guard) */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employer">
                  <EmployerDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employer">
                  <ManageJobsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs/create"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employer">
                  <CreateEditJobPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs/:id/edit"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employer">
                  <CreateEditJobPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/applicants"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employer">
                  <ApplicantsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="employer">
                  <EmployerProfilePage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Error & Fallback Routes */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
