import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

// Extract ProgressIndicator component outside to prevent re-creation
const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { label: 'Basic Info', number: 1 },
    { label: 'Social Media', number: 2 },
    { label: 'Content & Audience', number: 3 },
    { label: 'Finalize', number: 4 }
  ];

  return (
    <div className="bg-white rounded-xl p-8 mb-8 shadow-lg">
      <div className="flex justify-between items-center mb-5 relative">
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>
        {steps.map((step) => (
          <div key={step.number} className="relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep === step.number
                  ? 'bg-blue-800 text-white'
                  : currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step.number ? '✓' : step.number}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {steps.map((step) => (
          <div 
            key={step.number}
            className={`text-xs text-center w-20 ${
              currentStep === step.number
                ? 'text-blue-800 font-semibold'
                : currentStep > step.number
                ? 'text-green-500 font-semibold'
                : 'text-gray-600'
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// Extract Step1BasicInfo component outside to prevent re-creation
const Step1BasicInfo = ({ formData, handleInputChange, profilePictureFile, removeProfilePicture }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Welcome Creator!</h1>
      <p className="text-gray-600 text-lg">
        Let's start by gathering some basic information about you to create your influencer profile.
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block font-semibold text-gray-800 mb-2">Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Profile Picture *</label>
        <div className="flex items-center space-x-4">
          {profilePictureFile ? (
            <div className="flex items-center space-x-4">
              <img
                src={URL.createObjectURL(profilePictureFile)}
                alt="Profile Preview"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-sm text-gray-600">{profilePictureFile.name}</p>
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
          <input
            type="file"
            name="profilePicture"
            onChange={handleInputChange}
            accept="image/*"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Bio/Description *</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Tell us about yourself, your content style, and what makes you unique as a creator..."
          required
        />
      </div>
    </div>
  </div>
);

// Extract Step2SocialMedia component outside to prevent re-creation
const Step2SocialMedia = ({ formData, handleInputChange }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Social Media Profiles</h1>
      <p className="text-gray-600 text-lg">
        Connect your social media accounts so brands can discover your content and audience.
      </p>
    </div>

    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Primary Platform *</label>
          <select
            name="primaryPlatform"
            value={formData.primaryPlatform}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select your main platform</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="pinterest">Pinterest</option>
            <option value="snapchat">Snapchat</option>
            <option value="twitch">Twitch</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Primary Platform URL *</label>
          <input
            type="url"
            name="primaryHandle"
            value={formData.primaryHandle}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            placeholder="https://instagram.com/yourusername"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Follower Count Range *</label>
          <select
            name="followerCount"
            value={formData.followerCount}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select follower count</option>
            <option value="1k-5k">1K - 5K</option>
            <option value="5k-10k">5K - 10K</option>
            <option value="10k-50k">10K - 50K</option>
            <option value="50k-100k">50K - 100K</option>
            <option value="100k-500k">100K - 500K</option>
            <option value="500k-1m">500K - 1M</option>
            <option value="1m+">1M+</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Content Niche *</label>
          <select
            name="contentNiche"
            value={formData.contentNiche}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select your niche</option>
            <option value="fashion">Fashion</option>
            <option value="beauty">Beauty</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="fitness">Fitness</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="technology">Technology</option>
            <option value="gaming">Gaming</option>
            <option value="business">Business</option>
            <option value="health">Health</option>
            <option value="parenting">Parenting</option>
            <option value="education">Education</option>
            <option value="entertainment">Entertainment</option>
            <option value="art">Art</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Secondary Platform</label>
          <select
            name="secondaryPlatform"
            value={formData.secondaryPlatform}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select secondary platform</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="pinterest">Pinterest</option>
            <option value="snapchat">Snapchat</option>
            <option value="twitch">Twitch</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Secondary Platform URL</label>
          <input
            type="url"
            name="secondaryHandle"
            value={formData.secondaryHandle}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            placeholder="https://tiktok.com/@yourusername"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Personal Website</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="https://yourwebsite.com"
        />
      </div>
    </div>
  </div>
);

// Extract Step3ContentAudience component outside to prevent re-creation
const Step3ContentAudience = ({ formData, handleInputChange }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Content & Audience</h1>
      <p className="text-gray-600 text-lg">
        Help brands understand your content style and audience demographics.
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block font-semibold text-gray-800 mb-3">Content Categories *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Fashion', 'Beauty', 'Lifestyle', 'Fitness', 'Food', 'Travel',
            'Technology', 'Gaming', 'Business', 'Health', 'Parenting', 'Education',
            'Entertainment', 'Art', 'Music', 'Sports', 'Home & Garden', 'Other'
          ].map((category) => (
            <label key={category} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="contentCategories"
                value={category}
                checked={formData.contentCategories.includes(category)}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Primary Audience Age Range *</label>
          <select
            name="primaryAgeRange"
            value={formData.primaryAgeRange}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select age range</option>
            <option value="13-17">13-17 years old</option>
            <option value="18-24">18-24 years old</option>
            <option value="25-34">25-34 years old</option>
            <option value="35-44">35-44 years old</option>
            <option value="45-54">45-54 years old</option>
            <option value="55+">55+ years old</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Gender Distribution</label>
          <select
            name="genderSplit"
            value={formData.genderSplit}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select gender split</option>
            <option value="mostly-male">Mostly Male (60%+)</option>
            <option value="mostly-female">Mostly Female (60%+)</option>
            <option value="balanced">Balanced (40-60%)</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Primary Audience Location *</label>
          <select
            name="primaryLocation"
            value={formData.primaryLocation}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select primary location</option>
            <option value="united-states">United States</option>
            <option value="canada">Canada</option>
            <option value="united-kingdom">United Kingdom</option>
            <option value="australia">Australia</option>
            <option value="germany">Germany</option>
            <option value="france">France</option>
            <option value="italy">Italy</option>
            <option value="spain">Spain</option>
            <option value="brazil">Brazil</option>
            <option value="mexico">Mexico</option>
            <option value="india">India</option>
            <option value="japan">Japan</option>
            <option value="global">Global/International</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Average Engagement Rate *</label>
          <select
            name="engagementRate"
            value={formData.engagementRate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select engagement rate</option>
            <option value="1-3%">1-3%</option>
            <option value="3-5%">3-5%</option>
            <option value="5-7%">5-7%</option>
            <option value="7-10%">7-10%</option>
            <option value="10%+">10%+</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Content Style *</label>
          <select
            name="contentStyle"
            value={formData.contentStyle}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select content style</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="educational">Educational</option>
            <option value="entertaining">Entertaining</option>
            <option value="inspirational">Inspirational</option>
            <option value="authentic">Authentic/Personal</option>
            <option value="creative">Creative/Artistic</option>
            <option value="humorous">Humorous</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Posting Frequency *</label>
          <select
            name="postingFrequency"
            value={formData.postingFrequency}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select posting frequency</option>
            <option value="daily">Daily</option>
            <option value="few-times-week">Few times per week</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="irregular">Irregular</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// Extract Step4FinalSetup component outside to prevent re-creation
const Step4FinalSetup = ({ formData, handleInputChange }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Final Setup</h1>
      <p className="text-gray-600 text-lg">
        Set your pricing expectations and communication preferences to complete your profile.
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Expectations (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-800 mb-2">Instagram Post</label>
            <input
              type="number"
              name="instagramPrice"
              value={formData.instagramPrice}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              placeholder="$100"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-2">TikTok Video</label>
            <input
              type="number"
              name="tiktokPrice"
              value={formData.tiktokPrice}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              placeholder="$75"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-2">Instagram Story</label>
            <input
              type="number"
              name="storyPrice"
              value={formData.storyPrice}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              placeholder="$25"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-2">YouTube Video</label>
            <input
              type="number"
              name="youtubePrice"
              value={formData.youtubePrice}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              placeholder="$200"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-3">Communication Preferences *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Email', 'Direct Messages', 'Phone/WhatsApp', 'Video Calls', 'In-person meetings'
          ].map((method) => (
            <label key={method} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="communications"
                value={method}
                checked={formData.communications.includes(method)}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{method}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Name:</strong> {formData.fullName || 'Not specified'}</p>
            <p><strong>Primary Platform:</strong> {formData.primaryPlatform || 'Not specified'}</p>
            <p><strong>Followers:</strong> {formData.followerCount || 'Not specified'}</p>
            <p><strong>Niche:</strong> {formData.contentNiche || 'Not specified'}</p>
          </div>
          <div>
            <p><strong>Age Range:</strong> {formData.primaryAgeRange || 'Not specified'}</p>
            <p><strong>Location:</strong> {formData.primaryLocation || 'Not specified'}</p>
            <p><strong>Engagement:</strong> {formData.engagementRate || 'Not specified'}</p>
            <p><strong>Content Style:</strong> {formData.contentStyle || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Additional Notes</label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Any additional information about your content, collaboration preferences, or special skills..."
        />
      </div>
    </div>
  </div>
);

const InfluencerOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Basic Info
    fullName: '',
    profilePicture: null,
    bio: '',
    
    // Step 2 - Social Media
    primaryPlatform: '',
    primaryHandle: '',
    followerCount: '',
    contentNiche: '',
    secondaryPlatform: '',
    secondaryHandle: '',
    website: '',
    
    // Step 3 - Content & Audience
    contentCategories: [],
    primaryAgeRange: '',
    genderSplit: '',
    primaryLocation: '',
    engagementRate: '',
    contentStyle: '',
    postingFrequency: '',
    
    // Step 4 - Final Setup
    instagramPrice: '',
    tiktokPrice: '',
    storyPrice: '',
    youtubePrice: '',
    communications: [],
    additionalNotes: ''
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'contentCategories' || name === 'communications') {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else if (type === 'file') {
      setProfilePictureFile(e.target.files[0]);
      setFormData(prev => ({
        ...prev,
        profilePicture: e.target.files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const validateStep = useCallback((step) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.profilePicture && formData.bio;
      case 2:
        return formData.primaryPlatform && formData.primaryHandle && 
               formData.followerCount && formData.contentNiche;
      case 3:
        return formData.contentCategories.length > 0 && formData.primaryAgeRange && 
               formData.primaryLocation && formData.engagementRate && 
               formData.contentStyle && formData.postingFrequency;
      case 4:
        return formData.communications.length > 0;
      default:
        return false;
    }
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        completeOnboarding();
      }
    } else {
      alert('Please fill in all required fields (marked with *)');
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const completeOnboarding = async () => {
    try {
      setLoading(true);
      
      // Submit profile data to backend via step-by-step updates
      for (let step = 1; step <= 4; step++) {
        const stepData = getStepData(step);
        if (Object.keys(stepData).length > 0) {
          await apiService.updateInfluencerOnboardingStep(step, stepData);
        }
      }
      
      console.log('Influencer onboarding completed:', formData);
      
      // Store the completed onboarding data
      localStorage.setItem('influencerProfile', JSON.stringify(formData));
      localStorage.setItem('userData', JSON.stringify({ role: 'influencer', ...formData }));
      localStorage.removeItem('pendingRegistration'); // Clean up temporary data
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding completion error:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepData = (step) => {
    switch (step) {
      case 1:
        return {
          bio: formData.bio,
          location: formData.location,
          niches: formData.niches,
          audienceDescription: formData.audienceDescription
        };
      case 2:
        return {
          socialLinks: formData.socialLinks
        };
      case 3:
        return {
          rates: formData.rates,
          demographics: formData.demographics
        };
      case 4:
        return {
          availability: formData.availability,
          preferences: formData.preferences
        };
      default:
        return {};
    }
  };

  const removeProfilePicture = useCallback(() => {
    setProfilePictureFile(null);
    setFormData(prev => ({
      ...prev,
      profilePicture: null
    }));
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo 
            formData={formData} 
            handleInputChange={handleInputChange}
            profilePictureFile={profilePictureFile}
            removeProfilePicture={removeProfilePicture}
          />
        );
      case 2:
        return <Step2SocialMedia formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step3ContentAudience formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step4FinalSetup formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            Influencer Onboarding
          </h1>
          <p className="text-gray-600 text-lg">
            Complete your creator profile to start connecting with brands
          </p>
        </div>

        <ProgressIndicator currentStep={currentStep} />

        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors"
          >
            {currentStep === 4 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerOnboarding;