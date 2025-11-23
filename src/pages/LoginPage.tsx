import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect URL from query params
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';

  // Update page title
  useEffect(() => {
    document.title = 'Login - BlockTix';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email.trim()) {
      setFormError('Please enter your email');
      return;
    }
    if (!password) {
      setFormError('Please enter your password');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      navigate(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      // Auth errors are handled by the context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your BlockTix account
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8">
            {(formError || authError) && (
              <div className="mb-6 p-3 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-400 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{formError || authError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center justify-center transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 rounded-xl bg-gray-50 dark:bg-gray-800 p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Need blockchain functionality but don't want to create an account yet?
            </p>
            <Link 
              to="/events" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse as Guest
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;