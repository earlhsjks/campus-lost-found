import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, AlertCircle } from 'lucide-react';
import { Button, Input } from './ui';

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!showLoginModal) return null;

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLogin) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        setErrorMsg(pwdError);
        return;
      }
    }

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await signup(name, email, password);
    }

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleClose = () => {
    setShowLoginModal(false);
    setTimeout(() => {
      setIsLogin(true);
      setName('');
      setEmail('');
      setPassword('');
      setErrorMsg('');
    }, 300);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-card border border-border w-full max-w-md rounded-2xl p-8 md:p-10 relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          {/* Header */}
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-2 gradient-text">
              {isLogin ? 'Welcome Back.' : 'Join the Campus.'}
            </h2>
            <p className="text-muted-foreground font-medium mb-8">
              {isLogin
                ? 'Log in to claim items or report something you found.'
                : 'Create an account to help keep our campus connected.'}
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex gap-3 items-start"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium text-sm">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    type="text"
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              type="email"
              label="Student Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jdcruz@ndmu.edu.ph"
              required
            />

            <div>
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {!isLogin && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground mt-2 font-medium"
                >
                  Min. 8 characters, 1 uppercase, 1 number, 1 special character
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-6"
            >
              {isLogin ? 'Log In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle Footer */}
          <motion.div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                }}
                className="text-accent font-semibold hover:text-accent/80 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}