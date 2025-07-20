import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || 
                  (user.role === 'business' ? '/business/dashboard' : '/influencer/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // Clear errors when component mounts or email changes
  useEffect(() => {
    clearError();
  }, [formData.email, clearError]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Navigation will be handled by the useEffect above
    }
    // Error handling is managed by the AuthContext and displayed in the UI
  };

  const getFieldClasses = (fieldName) => {
    const baseClasses = "w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors";
    const errorClasses = "border-red-300 focus:border-red-500";
    const normalClasses = "border-gray-200 focus:border-blue-800";
    
    return `${baseClasses} ${validationErrors[fieldName] ? errorClasses : normalClasses}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Header */}
      <header className="bg-blue-800 text-white py-4 shadow-lg">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-3xl font-bold text-white">
              Upsaleit
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-white hover:text-blue-300 transition-colors">
                Home
              </Link>
              <Link to="/register" className="text-white hover:text-blue-300 transition-colors">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-5">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-800 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Sign in to your professional account
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center">
                  <div className="text-red-600 mr-3">⚠️</div>
                  <div>
                    <p className="text-red-800 font-medium">Sign In Failed</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block font-semibold text-gray-800 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={getFieldClasses('email')}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block font-semibold text-gray-800 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={getFieldClasses('password')}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <span className="text-gray-400 hover:text-gray-600">
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-800 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                    Keep me signed in
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-800 hover:text-blue-600 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-lg text-lg font-semibold transition-all ${
                  isLoading
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white hover:-translate-y-1 hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">📧</span>
                  Google
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">💼</span>
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-8 text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-800 font-semibold hover:text-blue-600 transition-colors">
                Create account
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <span>🔒</span>
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🛡️</span>
                  <span>Protected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>✓</span>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-6">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Upsaleit. Professional influencer marketing platform.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-amber-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-amber-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="text-gray-400 hover:text-amber-500 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;