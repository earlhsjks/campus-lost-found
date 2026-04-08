import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.get('/auth/me'); 
      await setUser(response.data); // Adjust based on your backend response shape (e.g., response.data.user)
    } catch (err) {
      console.log("No active session found.");
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 2. Real Login
  const login = async (email, password) => {
    try {
      // The backend will send a Set-Cookie header in the response here
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data); // Update state with the returned user data
      setShowLoginModal(false); 
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // 3. Real Sign Up
  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      // Assuming your signup route also logs them in and sets the cookie
      setUser(response.data); 
      setShowLoginModal(false); 
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Signup failed" };
    }
  };

  // 4. Real Logout
  const logout = async () => {
    try {
      // Tell the backend to clear the httpOnly cookie
      await api.post('/auth/logout'); 
      setUser(null); // Clear the user from React state
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Don't render the app until we know who the user is (prevents UI flashing)
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-muted">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);