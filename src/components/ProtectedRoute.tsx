import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user && !user.emailVerified) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-semibold text-yellow-800 mb-4">Email Verification Required</h2>
        <p className="text-yellow-700 mb-4">
          Please verify your email address before accessing this page. We've sent a verification link to your email.
        </p>
        <p className="text-yellow-700 text-sm">
          If you haven't received the email, please check your spam folder or contact support.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;