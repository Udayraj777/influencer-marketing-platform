// API service for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeAuthToken();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshToken() {
    return this.request('/auth/refresh-token', { method: 'POST' });
  }

  // Profile methods
  async createInfluencerProfile(profileData) {
    return this.request('/profile/influencer', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getInfluencerProfile() {
    return this.request('/profile/influencer');
  }

  async updateInfluencerProfile(profileData) {
    return this.request('/profile/influencer', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Business Profile methods
  async createBusinessProfile(profileData) {
    return this.request('/profile/business', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getBusinessProfile() {
    return this.request('/profile/business');
  }

  async updateBusinessProfile(profileData) {
    return this.request('/profile/business', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateInfluencerOnboardingStep(step, data) {
    return this.request(`/influencer-profiles/onboarding/${step}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }


  async updateBusinessOnboardingStep(step, data) {
    return this.request(`/business-profiles/onboarding/${step}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Campaign methods
  async getCampaigns(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/campaigns?${params}`);
  }

  async createCampaign(campaignData) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getBusinessCampaigns() {
    return this.request('/campaigns/my-campaigns');
  }

  async applyToCampaign(campaignId, applicationData) {
    return this.request(`/campaigns/${campaignId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async sendDirectInvite(campaignId, inviteData) {
    return this.request(`/campaigns/${campaignId}/invite`, {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }

  // Matching methods
  async getInfluencerMatches(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/matching/influencers?${params}`);
  }

  async getBusinessMatches(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/matching/businesses?${params}`);
  }

  // Dashboard data
  async getDashboardData() {
    return this.request('/users/dashboard');
  }

  async getUserStats() {
    return this.request('/users/stats');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;