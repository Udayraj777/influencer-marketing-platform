# Influencer-Business Marketplace Platform API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints (`/auth`)

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "influencer" | "business"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Profile Onboarding Endpoints

#### Influencer Profile Onboarding
```http
PUT /influencer-profiles/onboarding/{step}
Authorization: Bearer <token>
Content-Type: application/json
```

**Step 1 - Basic Info:**
```json
{
  "bio": "Fashion and lifestyle influencer based in NYC",
  "location": {
    "country": "United States",
    "state": "New York",
    "city": "New York"
  },
  "niches": ["fashion", "lifestyle", "beauty"],
  "audienceDescription": "Fashion-forward millennials and Gen Z"
}
```

**Step 2 - Social Media:**
```json
{
  "socialLinks": [
    {
      "platform": "instagram",
      "url": "https://instagram.com/username",
      "username": "username",
      "followers": 50000,
      "isVerified": true,
      "isPrimary": true
    }
  ]
}
```

**Step 3 - Demographics & Rates:**
```json
{
  "demographics": {
    "genderSplit": {
      "female": 70,
      "male": 30,
      "other": 0
    },
    "ageDistribution": [
      {
        "ageRange": "18-24",
        "percentage": 40
      },
      {
        "ageRange": "25-34",
        "percentage": 35
      }
    ]
  },
  "rates": {
    "postRate": 500,
    "storyRate": 200,
    "videoRate": 800,
    "currency": "USD"
  }
}
```

**Step 4 - Preferences & Availability:**
```json
{
  "availability": {
    "status": "available",
    "weeklyCapacity": 5,
    "responseTime": "within_day"
  },
  "preferences": {
    "preferredCampaignTypes": ["sponsored_post", "story", "video"],
    "minBudget": 300,
    "maxBudget": 2000
  }
}
```

#### Business Profile Onboarding
```http
PUT /business-profiles/onboarding/{step}
Authorization: Bearer <token>
Content-Type: application/json
```

**Step 1 - Company Info:**
```json
{
  "companyName": "Fashion Brand Co",
  "description": "Premium fashion brand for young professionals",
  "industry": "fashion",
  "companySize": "11-50",
  "website": "https://fashionbrand.com"
}
```

**Step 2 - Location & Contact:**
```json
{
  "location": {
    "country": "United States",
    "state": "California",
    "city": "Los Angeles",
    "address": "123 Fashion Ave"
  },
  "contactInfo": {
    "primaryContact": {
      "name": "Marketing Manager",
      "email": "marketing@fashionbrand.com",
      "phone": "+1-555-0123",
      "position": "Marketing Director"
    }
  }
}
```

**Step 3 - Target Audience:**
```json
{
  "targetAudience": {
    "demographics": {
      "ageRanges": ["18-24", "25-34"],
      "genders": ["female"],
      "interests": ["fashion", "lifestyle", "beauty"]
    },
    "geography": {
      "countries": ["United States", "Canada"],
      "languages": ["English"]
    },
    "platforms": ["instagram", "tiktok"]
  },
  "idealCustomerProfile": "Fashion-conscious women aged 18-34 interested in premium lifestyle brands"
}
```

**Step 4 - Campaign Preferences:**
```json
{
  "campaignPreferences": {
    "preferredCampaignTypes": ["sponsored_post", "story", "video"],
    "budgetRange": {
      "min": 500,
      "max": 5000,
      "currency": "USD"
    },
    "collaborationStyle": "collaborative",
    "contentApproval": "pre_approval",
    "deliveryTimeline": "within_month"
  },
  "preferences": {
    "matching": {
      "autoMatchEnabled": true,
      "matchingCriteria": {
        "minFollowers": 10000,
        "maxFollowers": 100000,
        "minEngagementRate": 2.0,
        "verifiedOnly": false
      }
    }
  }
}
```

### User Dashboard Endpoints

#### Get User Dashboard Data
```http
GET /users/dashboard
Authorization: Bearer <token>
```

#### Get User Statistics
```http
GET /users/stats
Authorization: Bearer <token>
```

### Profile Management

#### Get Own Profile
```http
GET /influencer-profiles/me/profile
Authorization: Bearer <token>
```

```http
GET /business-profiles/me/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /influencer-profiles/
Authorization: Bearer <token>
Content-Type: application/json
```

### Discovery & Matching

#### Get Influencers (Public)
```http
GET /influencer-profiles?page=1&limit=10&niche=fashion&country=United%20States&minFollowers=10000&maxFollowers=100000
```

#### Get Recommended Influencers (Business Only)
```http
GET /business-profiles/me/recommended-influencers?page=1&limit=10
Authorization: Bearer <token>
```

#### Find Matches (Business)
```http
GET /matching/influencers?limit=20&minScore=0.3&includeUnavailable=false
Authorization: Bearer <token>
```

#### Find Business Matches (Influencer)
```http
GET /matching/businesses?limit=20&minScore=0.3
Authorization: Bearer <token>
```

### Search

#### Search Influencers
```http
GET /influencer-profiles/search?q=fashion&page=1&limit=10
```

#### Search Businesses
```http
GET /business-profiles/search?q=fashion&page=1&limit=10
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

## Authentication Flow

1. **Register** - Create account with role selection
2. **Login** - Get JWT token and user data
3. **Profile Setup** - Complete onboarding steps based on role
4. **Dashboard Access** - Access role-specific features

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes

## CORS

Allowed origins:
- http://localhost:3000 (React dev server)
- http://localhost:5173 (Vite dev server)

## WebSocket Events (Socket.IO)

### Connection
```javascript
const socket = io('http://localhost:5000');

// Join user room for notifications
socket.emit('join-user-room', userId);
```

### Real-time Features
- Live notifications
- Message system
- Typing indicators
- Connection status updates