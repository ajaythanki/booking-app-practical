import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { Calendar, User, LogOut, Menu, X, Home, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8" />
            <span className="text-xl font-bold">BookMySlot</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-indigo-200 transition-colors">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-indigo-200 transition-colors">
                  Dashboard
                </Link>
                <Link to="/booking/new" className="hover:text-indigo-200 transition-colors">
                  New Booking
                </Link>
                <Link to="/booking/calendar" className="hover:text-indigo-200 transition-colors">
                  Calendar
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{user?.firstName} {user?.lastName}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-indigo-200 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden focus:outline-none" 
            onClick={toggleMenu}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-indigo-500">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 hover:bg-indigo-700 px-3 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 hover:bg-indigo-700 px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/booking/new" 
                    className="flex items-center space-x-2 hover:bg-indigo-700 px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>New Booking</span>
                  </Link>
                  <Link 
                    to="/booking/calendar" 
                    className="flex items-center space-x-2 hover:bg-indigo-700 px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Calendar</span>
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 hover:bg-indigo-700 px-3 py-2 rounded-md text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hover:bg-indigo-700 px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;