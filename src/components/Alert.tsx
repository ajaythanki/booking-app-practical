import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearError } from '../store/slices/authSlice';
import { clearBookingState } from '../store/slices/bookingSlice';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const Alert = () => {
  const dispatch = useDispatch();
  const { error: authError } = useSelector((state: RootState) => state.auth);
  const { error: bookingError, success } = useSelector((state: RootState) => state.booking);

  useEffect(() => {
    if (authError || bookingError || success) {
      const timer = setTimeout(() => {
        if (authError) dispatch(clearError());
        if (bookingError || success) dispatch(clearBookingState());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [authError, bookingError, success, dispatch]);

  const handleClose = () => {
    if (authError) dispatch(clearError());
    if (bookingError || success) dispatch(clearBookingState());
  };

  if (!authError && !bookingError && !success) return null;

  return (
    <div className={`fixed top-20 right-4 z-50 max-w-md shadow-lg rounded-lg p-4 flex items-start space-x-3 ${
      success ? 'bg-green-50 text-green-800 border border-green-200' : 
      'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {success ? (
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
      )}
      
      <div className="flex-1">
        <p className="font-medium">
          {success ? 'Success!' : 'Error'}
        </p>
        <p className="text-sm mt-1">
          {authError || bookingError || 'Operation completed successfully.'}
        </p>
      </div>
      
      <button 
        onClick={handleClose}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Alert;