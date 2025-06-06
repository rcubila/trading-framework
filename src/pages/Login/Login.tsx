import { useState } from 'react';
import { FiMail, FiLock, FiGithub } from 'react-icons/fi';
import { SiBlockchaindotcom } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { AnimatedButton } from '../../components/AnimatedButton';
import { FaGithub } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signInWithGoogle, error: authError, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          // Get the redirect path from location state or default to '/'
          const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
          navigate(from);
        }
      } catch (err: any) {
        console.error('Login failed:', err);
        setError(err.message);
      }
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  const handleGithubLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Implementation for GitHub login
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <SiBlockchaindotcom className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Trading Framework</h1>
          <p className="text-gray-400">Advanced Trading Solutions</p>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-xl shadow-2xl p-8"
        >
          {(error || authError) && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 mr-2"
                  disabled={loading}
                />
                Remember me
              </label>
              <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <AnimatedButton
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </AnimatedButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-4 space-y-3">
            {/* Google Login Button */}
            <AnimatedButton
              type="button"
              variant="secondary"
              className="w-full"
              onClick={(e) => handleGoogleLogin(e)}
              icon={<FcGoogle className="w-5 h-5" />}
            >
              Continue with Google
            </AnimatedButton>

            {/* GitHub Login Button */}
            <AnimatedButton
              type="button"
              variant="secondary"
              className="w-full"
              onClick={(e) => handleGithubLogin(e)}
              icon={<FaGithub className="w-5 h-5" />}
            >
              Continue with GitHub
            </AnimatedButton>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-gray-400">
            Don't have an account?{' '}
            <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">
              Sign up
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 