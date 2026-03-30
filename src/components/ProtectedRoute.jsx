import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--cream)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid var(--gray-200)',
            borderTopColor: 'var(--gold)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-md)',
          }} />
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gray-500)' }}>
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin can access everything; client cannot access admin routes
  if (requiredRole === 'admin' && userRole !== 'admin') {
    return <Navigate to="/client" replace />;
  }

  return children;
}
