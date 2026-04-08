import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, login, signup } = useAuth();

  // Toggle between Login and Sign Up views
  const [isLogin, setIsLogin] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!showLoginModal) return null;

  // --- NEW: Password Validation Helper ---
  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character.";
    return null; // Null means validation passed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // Clear old errors

    // --- NEW: Run validation if signing up ---
    if (!isLogin) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        setErrorMsg(pwdError);
        return; // Stop submission if validation fails
      }
    }

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await signup(name, email, password);
    }

    if (!result.success) {
      setErrorMsg(result.message); // Show backend error to user
    }
  };

  // Reset form and close
  const handleClose = () => {
    setShowLoginModal(false);
    // Reset back to login mode and clear inputs for the next time it opens
    setTimeout(() => {
      setIsLogin(true);
      setName('');
      setEmail('');
      setPassword('');
      setErrorMsg('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/90 p-4">
      <div className="bg-white w-full max-w-md rounded-lg p-8 relative transition-all duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-foreground hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {/* Dynamic Header */}
        <h2 className="font-extrabold text-3xl mb-2 text-foreground">
          {isLogin ? 'Welcome Back.' : 'Join the Campus.'}
        </h2>
        <p className="text-gray-600 font-medium mb-8">
          {isLogin
            ? 'Log in to claim items or report something you found.'
            : 'Create an account to help keep our campus connected.'}
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 font-bold text-sm">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Only show Name field if we are signing up */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Earl Jeno Garcia"
                required={!isLogin}
                className="w-full bg-muted text-foreground p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-colors font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Student Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@ndmu.edu.ph"
              required
              className="w-full bg-muted text-foreground p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-colors font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-muted text-foreground p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-colors font-medium"
            />
            {/* --- NEW: Password requirements hint for sign ups --- */}
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Must be at least 8 characters, include an uppercase letter, a number, and a special character.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-extrabold text-lg py-4 rounded-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-600"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Footer */}
        <div className="mt-6 text-center pt-6 border-t-2 border-muted">
          <p className="text-sm font-medium text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg(''); // Clear errors when toggling views
              }}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}