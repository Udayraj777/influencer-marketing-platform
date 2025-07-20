import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

// Extract ProgressIndicator component outside to prevent re-creation
const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { label: 'Company Info', number: 1 },
    { label: 'Target Audience', number: 2 },
    { label: 'Campaign Prefs', number: 3 },
    { label: 'Goals & Setup', number: 4 }
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

// Extract Step1CompanyInfo component outside to prevent re-creation
const Step1CompanyInfo = ({ formData, handleInputChange }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Welcome to Our Platform</h1>
      <p className="text-gray-600 text-lg">
        Let's start by gathering some basic information about your company to create your business profile.
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block font-semibold text-gray-800 mb-2">Company Name *</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter your company name"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Industry *</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select your industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="retail">E-commerce</option>
            <option value="beauty">Beauty</option>
            <option value="fashion">Fashion and clothing</option>
            <option value="food">Food</option>
            <option value="travel">Travel & Hospitality</option>
            <option value="automotive">Automotive</option>
            <option value="real-estate">Real Estate</option>
            <option value="education">Education</option>
            <option value="entertainment">Entertainment</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Company Size *</label>
          <select
            name="companySize"
            value={formData.companySize}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            required
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-100">51-100 employees</option>
            <option value="101-500">101-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Company Website</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="https://yourcompany.com"
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Company Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Brief description of your company and what you do..."
        />
      </div>
    </div>
  </div>
);

// Extract Step2TargetAudience component outside to prevent re-creation
const Step2TargetAudience = ({ formData, handleInputChange }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Target Audience</h1>
      <p className="text-gray-600 text-lg">
        Help us understand who your ideal customers are so we can match you with the right influencers.
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block font-semibold text-gray-800 mb-2">Primary Age Range *</label>
        <select
          name="ageRange"
          value={formData.ageRange}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Gender Focus</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">No preference</option>
            <option value="male">Primarily Male</option>
            <option value="female">Primarily Female</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-800 mb-2">Income Level</label>
          <select
            name="incomeLevel"
            value={formData.incomeLevel}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">No preference</option>
            <option value="low">Low income</option>
            <option value="middle">Middle income</option>
            <option value="high">High income</option>
            <option value="mixed">Mixed income levels</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-3">Primary Markets *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
            'Italy', 'Spain', 'Brazil', 'Mexico', 'India', 'Japan', 'Global'
          ].map((market) => (
            <label key={market} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="markets"
                value={market}
                checked={formData.markets.includes(market)}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{market}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-3">Audience Interests *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Fashion', 'Beauty', 'Technology', 'Gaming', 'Food', 'Travel',
            'Fitness', 'Health', 'Lifestyle', 'Business', 'Art', 'Music',
            'Sports', 'Education', 'Parenting', 'Home & Garden'
          ].map((interest) => (
            <label key={interest} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="interests"
                value={interest}
                checked={formData.interests.includes(interest)}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Extract Step3CampaignPreferences component outside to prevent re-creation
const Step3CampaignPreferences = ({ formData, handleInputChange }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Campaign Preferences</h1>
      <p className="text-gray-600 text-lg">
        Tell us about your campaign preferences and budget to help us find the perfect influencers.
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block font-semibold text-gray-800 mb-3">Preferred Social Media Platforms *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn',
            'Pinterest', 'Snapchat', 'Twitch'
          ].map((platform) => (
            <label key={platform} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="platforms"
                value={platform}
                checked={formData.platforms.includes(platform)}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{platform}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Monthly Budget Range *</label>
        <select
          name="budget"
          value={formData.budget}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          required
        >
          <option value="">Select budget range</option>
          <option value="under-1000">Under $1,000</option>
          <option value="1000-5000">$1,000 - $5,000</option>
          <option value="5000-10000">$5,000 - $10,000</option>
          <option value="10000-25000">$10,000 - $25,000</option>
          <option value="25000-50000">$25,000 - $50,000</option>
          <option value="50000+">$50,000+</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Content Requirements</label>
        <textarea
          name="contentRequirements"
          value={formData.contentRequirements}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Describe any specific content requirements, brand guidelines, or messaging you want influencers to follow..."
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Industry Compliance Requirements</label>
        <textarea
          name="industryCompliance"
          value={formData.industryCompliance}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Any specific compliance requirements for your industry (e.g., FDA disclaimers, FTC guidelines, etc.)"
        />
      </div>
    </div>
  </div>
);

// Extract Step4GoalsSetup component outside to prevent re-creation
const Step4GoalsSetup = ({ formData, handleInputChange }) => (
  <div className="bg-white rounded-xl p-10 shadow-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-3">Goals & Final Setup</h1>
      <p className="text-gray-600 text-lg">
        Review your profile information and add any final details to complete your setup.
      </p>
    </div>

    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Company:</strong> {formData.companyName || 'Not specified'}</p>
            <p><strong>Industry:</strong> {formData.industry || 'Not specified'}</p>
            <p><strong>Size:</strong> {formData.companySize || 'Not specified'}</p>
          </div>
          <div>
            <p><strong>Target Age:</strong> {formData.ageRange || 'Not specified'}</p>
            <p><strong>Budget:</strong> {formData.budget || 'Not specified'}</p>
            <p><strong>Platforms:</strong> {formData.platforms.length > 0 ? formData.platforms.join(', ') : 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-800 mb-2">Additional Notes</label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          placeholder="Any additional information about your company, goals, or what you're looking for in influencer partnerships..."
        />
      </div>
    </div>
  </div>
);

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Company Info
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    
    // Step 2 - Target Audience
    ageRange: '',
    gender: '',
    incomeLevel: '',
    markets: [],
    interests: [],
    
    // Step 3 - Campaign Preferences
    platforms: [],
    budget: '',
    contentRequirements: '',
    industryCompliance: '',
    
    // Step 4 - Goals & Setup
    additionalNotes: ''
  });

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'markets' || name === 'interests' || name === 'platforms') {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value
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
        return formData.companyName && formData.industry && formData.companySize;
      case 2:
        return formData.ageRange && formData.markets.length > 0 && formData.interests.length > 0;
      case 3:
        return formData.platforms.length > 0 && formData.budget;
      case 4:
        return true; // Final step has no required fields
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
        const stepData = getBusinessStepData(step);
        if (Object.keys(stepData).length > 0) {
          await apiService.updateBusinessOnboardingStep(step, stepData);
        }
      }
      
      console.log('Business onboarding completed:', formData);
      
      // Store the completed onboarding data
      localStorage.setItem('businessProfile', JSON.stringify(formData));
      localStorage.setItem('userData', JSON.stringify({ role: 'business', ...formData }));
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

  const getBusinessStepData = (step) => {
    switch (step) {
      case 1:
        return {
          companyName: formData.companyName,
          description: formData.description,
          industry: formData.industry,
          companySize: formData.companySize,
          website: formData.website
        };
      case 2:
        return {
          location: formData.location,
          contactInfo: formData.contactInfo
        };
      case 3:
        return {
          targetAudience: formData.targetAudience,
          idealCustomerProfile: formData.idealCustomerProfile
        };
      case 4:
        return {
          campaignPreferences: formData.campaignPreferences,
          matchingPreferences: formData.matchingPreferences
        };
      default:
        return {};
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1CompanyInfo formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step2TargetAudience formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step3CampaignPreferences formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step4GoalsSetup formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            Business Onboarding
          </h1>
          <p className="text-gray-600 text-lg">
            Complete your business profile to start connecting with influencers
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

export default BusinessOnboarding;