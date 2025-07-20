import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    // Brand fields
    companyName: '',
    industry: '',
    website: '',
    // Influencer fields
    primaryPlatform: '',
    followerCount: '',
    contentCategories: '',
    bio: '',
    marketing: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select your professional role.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: selectedRole === 'brand' ? 'business' : selectedRole,
        ...formData
      };
      
      console.log('Registration data:', registrationData);
      
      const result = await register(registrationData);
      
      if (result.success) {
        // Store additional data for onboarding
        localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
        
        // Redirect to appropriate onboarding flow
        if (selectedRole === 'influencer') {
          navigate('/onboarding/influencer');
        } else if (selectedRole === 'brand') {
          navigate('/onboarding/business');
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedRole && termsAccepted;

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
              {/* Navigation can be added here */}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="bg-white p-12 rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-800 mb-2">
                Join Upsaleit
              </h1>
              <p className="text-gray-600">
                Create your professional account and start building meaningful partnerships
              </p>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Choose Your Professional Role
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    selectedRole === 'brand'
                      ? 'border-blue-800 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-800 hover:bg-gray-50'
                  }`}
                  onClick={() => handleRoleSelection('brand')}
                >
                  <div className="text-4xl mb-2">🏢</div>
                  <div className="font-semibold text-blue-800 mb-2">Brand / Agency</div>
                  <div className="text-sm text-gray-600">
                    Connect with premium influencers and manage campaigns
                  </div>
                </div>
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    selectedRole === 'influencer'
                      ? 'border-blue-800 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-800 hover:bg-gray-50'
                  }`}
                  onClick={() => handleRoleSelection('influencer')}
                >
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="font-semibold text-blue-800 mb-2">Content Creator</div>
                  <div className="text-sm text-gray-600">
                    Partner with leading brands and grow your business
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block font-semibold text-gray-800 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block font-semibold text-gray-800 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                    placeholder="Create a secure password"
                    required
                  />
                </div>
              </div>

              {/* Brand/Agency Specific Fields */}
              {selectedRole === 'brand' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                    Company Information
                  </h3>
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-800 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block font-semibold text-gray-800 mb-2">
                        Industry
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select your industry</option>
                        <option value="technology">Technology</option>
                        <option value="fashion">Fashion & Beauty</option>
                        <option value="fitness">Health & Fitness</option>
                        <option value="food">Food & Beverage</option>
                        <option value="travel">Travel & Lifestyle</option>
                        <option value="finance">Finance & Business</option>
                        <option value="automotive">Automotive</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      {/* Empty space for layout */}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-800 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      placeholder="https://www.yourcompany.com"
                    />
                  </div>
                </div>
              )}

              {/* Influencer Specific Fields */}
              {selectedRole === 'influencer' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                    Creator Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block font-semibold text-gray-800 mb-2">
                        Primary Platform
                      </label>
                      <select
                        name="primaryPlatform"
                        value={formData.primaryPlatform}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select primary platform</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitter">Twitter/X</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitch">Twitch</option>
                        <option value="podcast">Podcast</option>
                        <option value="blog">Blog/Website</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-800 mb-2">
                        Follower Count
                      </label>
                      <select
                        name="followerCount"
                        value={formData.followerCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select follower count</option>
                        <option value="1k-10k">1K - 10K</option>
                        <option value="10k-50k">10K - 50K</option>
                        <option value="50k-100k">50K - 100K</option>
                        <option value="100k-500k">100K - 500K</option>
                        <option value="500k-1m">500K - 1M</option>
                        <option value="1m+">1M+</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-800 mb-2">
                      Content Categories
                    </label>
                    <select
                      name="contentCategories"
                      value={formData.contentCategories}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select primary content category</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="fashion">Fashion & Beauty</option>
                      <option value="fitness">Health & Fitness</option>
                      <option value="food">Food & Cooking</option>
                      <option value="travel">Travel</option>
                      <option value="technology">Technology</option>
                      <option value="business">Business & Finance</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="parenting">Parenting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-800 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-vertical min-h-[100px]"
                      placeholder="Tell us about your content, audience, and what makes you unique as a creator..."
                    />
                  </div>
                </div>
              )}

              {/* Terms and Privacy */}
              <div className="mb-8">
                <div className="flex items-start space-x-3 mb-6">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 text-blue-800 mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-800 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-blue-800 font-medium hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-800 font-medium hover:underline">
                      Privacy Policy
                    </a>
                    . I understand that ConnectSphere is a professional platform for verified brands and content creators.
                  </label>
                </div>
                <div className="flex items-start space-x-3 mb-6">
                  <input
                    type="checkbox"
                    id="marketing"
                    name="marketing"
                    checked={formData.marketing}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-800 mt-1"
                  />
                  <label htmlFor="marketing" className="text-sm text-gray-800 leading-relaxed">
                    I would like to receive professional insights, industry updates, and platform news via email.
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-4 rounded-lg text-lg font-semibold transition-all mb-4 ${
                  isFormValid && !loading
                    ? 'bg-amber-500 hover:bg-amber-600 text-white hover:-translate-y-1 hover:shadow-lg'
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Professional Account'}
              </button>
            </form>

            {/* Trust Indicators */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-center items-center space-x-6 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    🔒
                  </div>
                  <span className="text-sm">Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    🛡️
                  </div>
                  <span className="text-sm">Data Protected</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                  <span className="text-sm">Verified Platform</span>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 leading-relaxed">
                Your information is protected with bank-level encryption. We verify all accounts to maintain platform quality and trust.
              </div>
            </div>

            <div className="text-center mt-6 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-800 font-semibold hover:text-blue-600 transition-colors">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 ConnectSphere. Professional influencer marketing platform.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                Security
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;