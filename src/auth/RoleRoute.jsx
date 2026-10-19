import React from 'react';
import { useAuth } from './AuthContext';
import ForbiddenPage from '../pages/shared/ForbiddenPage';
import Loader from '../components/common/Loader';

export default function RoleRoute({ allowedRole, children }) {
  const { role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader message="Verifying user permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || role !== allowedRole) {
    return <ForbiddenPage requiredRole={allowedRole} userRole={role} />;
  }

  return children;
}
