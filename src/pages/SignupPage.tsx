import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);
  const { signup, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect URL from query params
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';

  // Update page title
  useEffect(() => {
    document.title = 'Sign Up - BlockTix';
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      setFormError('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      setFormError('Please enter your email');
      return false;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    if (!otpVerified) {
      setFormError('Please verify the OTP sent to your email before creating the account');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    setFormError(null);
    setOtpInfo(null);
    const e = email.trim();
    if (!e) { setFormError('Please enter your email to receive OTP'); return; }
    try {
      setLoading(true);
      const resp = await sendOtp(e);
      setOtpSent(true);
      if (resp.dev?.code) {
        setOtpInfo(`Dev mode OTP: ${resp.dev.code} (expires in ${resp.expiresInSec}s)`);
      } else {
        setOtpInfo(`OTP sent to ${e}. Expires in ${resp.expiresInSec}s.`);
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setFormError(null);
    setOtpInfo(null);
    const e = email.trim();
    if (!e) { setFormError('Email is required'); return; }
    if (!otp.trim()) { setFormError('Enter the 6-digit OTP'); return; }
    try {
      setLoading(true);
      const resp = await verifyOtp(e, otp.trim());
      if (resp.verified) {
        setOtpVerified(true);
        setOtpInfo('Email verified successfully. You can now create your account.');
      } else {
        setFormError('OTP verification failed');
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await signup(email, password, name);
      navigate(redirectTo);
    } catch (error) {
      console.error('Signup error:', error);
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
              Create an Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join BlockTix to purchase and manage event tickets
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8">
            {(formError || authError || otpInfo) && (
              <div className="mb-6 p-3 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-400 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{formError || authError || otpInfo}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
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
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !email.trim()}
                    className="px-3 py-2 text-sm rounded-lg border border-primary-600 text-primary-700 hover:bg-primary-50 disabled:opacity-60"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e)=> setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || !otp.trim()}
                    className={`px-3 py-2 text-sm rounded-lg ${otpVerified ? 'bg-success-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'} disabled:opacity-60`}
                  >
                    {otpVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Create a password"
                  minLength={6}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="w-4 h-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                    I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center justify-center transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Benefits
              </h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Purchase tickets with your crypto wallet</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Manage all your tickets in one place</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Transfer or resell tickets securely</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Receive exclusive offers and early access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;