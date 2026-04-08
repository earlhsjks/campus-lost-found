import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PackageSearch, LogOut, User } from 'lucide-react';
import NotificationBell from './NotificationBell';
import api from '../services/api'; // Make sure this points to your axios instance!

export default function Navbar() {
  const { user, setUser, setShowLoginModal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error("Logout failed on backend", error);
    } finally {
      setUser(null);
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b-2 border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT SIDE: Brand & Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <div className="bg-primary text-white p-2 rounded-lg">
              <PackageSearch className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 hidden sm:block">
              Campus Found.
            </span>
          </Link>

          {/* RIGHT SIDE: Navigation & Auth */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* The "Report Item" Button (Always visible) */}
            <Link 
              to="/report" 
              className="font-bold text-sm text-gray-600 hover:text-primary transition-colors hidden sm:block"
            >
              Report Item
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            {user ? (
              // --- LOGGED IN STATE ---
              <div className="flex items-center gap-4 sm:gap-5">
                
                {/* 1. The Bell */}
                <NotificationBell />
                
                {/* 2. User Avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center border-2 border-blue-200">
                    {/* Show the first letter of their name, or a default icon */}
                    {user.name ? (
                      <span className="font-extrabold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-gray-700 hidden md:block">
                    {user.name?.split(' ')[0]} {/* Just show their first name */}
                  </span>
                </div>

                {/* 3. Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // --- LOGGED OUT STATE ---
              <button 
                onClick={() => setShowLoginModal(true)}
                className="bg-primary text-white px-5 py-2 rounded-md font-bold hover:bg-blue-600 transition-colors"
              >
                Log In
              </button>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}