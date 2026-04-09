import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PackageSearch, LogOut, User } from 'lucide-react';
import { Button } from './ui';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, setShowLoginModal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* LEFT SIDE: Brand & Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              to="/" 
              className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
            >
              <motion.div 
                className="bg-gradient-accent p-2 rounded-xl text-white shadow-accent"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PackageSearch className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
              </motion.div>
              <span className="font-display font-bold text-lg md:text-xl gradient-text hidden sm:block">
                Campus Found.
              </span>
            </Link>
          </motion.div>

          {/* RIGHT SIDE: Navigation & Auth */}
          <motion.div 
            className="flex items-center gap-3 md:gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* The "Report Item" Button (Always visible) */}
            <Button
              onClick={() => {
                if (user) {
                  navigate('/report');
                } else {
                  setShowLoginModal(true);
                }
              }}
              variant="ghost"
              size="md"
              className="hidden sm:inline-flex text-sm"
            >
              Report Item
            </Button>

            {user ? (
              // --- LOGGED IN STATE ---
              <div className="flex items-center gap-3 md:gap-4">
                
                {/* 1. The Bell */}
                <NotificationBell />
                
                {/* 2. User Avatar */}
                <motion.div 
                  className="flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-accent/10 text-accent flex items-center justify-center border-2 border-accent/30 font-display font-bold text-sm">
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-medium text-sm text-foreground hidden md:block truncate max-w-24">
                    {user.name?.split(' ')[0]}
                  </span>
                </motion.div>

                {/* 3. Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-red-500 transition-colors p-2 hover:bg-red-50/30 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              // --- LOGGED OUT STATE ---
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="primary"
                size="md"
              >
                Log In
              </Button>
            )}

          </motion.div>
        </div>
      </div>
    </nav>
  );
}