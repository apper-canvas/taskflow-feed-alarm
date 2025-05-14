import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  
  if (!isAuthenticated) {
    // Redirect to login with the current path for redirect after login
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} 
        replace 
      />
    );
  }
  
  return <main className="container mx-auto px-4 py-6">{children}</main>;
}

export default ProtectedRoute;