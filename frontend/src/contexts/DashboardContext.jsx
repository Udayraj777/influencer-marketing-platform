import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const DASHBOARD_ACTIONS = {
  SET_USER_DATA: 'SET_USER_DATA',
  SET_CAMPAIGNS: 'SET_CAMPAIGNS',
  SET_APPLICATIONS: 'SET_APPLICATIONS',
  SET_INVITATIONS: 'SET_INVITATIONS',
  SET_COLLABORATIONS: 'SET_COLLABORATIONS',
  SET_STATS: 'SET_STATS',
  ADD_APPLICATION: 'ADD_APPLICATION',
  UPDATE_APPLICATION: 'UPDATE_APPLICATION',
  ACCEPT_INVITATION: 'ACCEPT_INVITATION',
  DECLINE_INVITATION: 'DECLINE_INVITATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  user: {
    id: 'user_001',
    name: 'Sarah Anderson',
    avatar: 'SA',
    bio: 'Fashion & Beauty Content Creator',
    platforms: ['Instagram', 'TikTok'],
    followers: '125K',
    engagement: '7.2%',
    location: 'New York, USA',
    completionRate: 85
  },
  campaigns: [],
  applications: [],
  invitations: [],
  collaborations: {
    active: [],
    completed: [],
    stats: {
      overallRating: 4.9,
      totalReviews: 23,
      completionRate: 100,
      totalEarned: 4250,
      recommendationRate: 95
    }
  },
  stats: {
    activeCampaigns: 2,
    totalEarnings: 4250,
    profileViews: 847,
    newInvitations: 4
  },
  loading: false,
  error: null
};

// Reducer
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_USER_DATA:
      return { ...state, user: { ...state.user, ...action.payload } };
      
    case DASHBOARD_ACTIONS.SET_CAMPAIGNS:
      return { ...state, campaigns: action.payload };
      
    case DASHBOARD_ACTIONS.SET_APPLICATIONS:
      return { ...state, applications: action.payload };
      
    case DASHBOARD_ACTIONS.SET_INVITATIONS:
      return { ...state, invitations: action.payload };
      
    case DASHBOARD_ACTIONS.SET_COLLABORATIONS:
      return { ...state, collaborations: { ...state.collaborations, ...action.payload } };
      
    case DASHBOARD_ACTIONS.SET_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload } };
      
    case DASHBOARD_ACTIONS.ADD_APPLICATION:
      return {
        ...state,
        applications: [...state.applications, action.payload]
      };
      
    case DASHBOARD_ACTIONS.UPDATE_APPLICATION:
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? { ...app, ...action.payload } : app
        )
      };
      
    case DASHBOARD_ACTIONS.ACCEPT_INVITATION:
      return {
        ...state,
        invitations: state.invitations.filter(inv => inv.id !== action.payload.id),
        collaborations: {
          ...state.collaborations,
          active: [...state.collaborations.active, action.payload]
        }
      };
      
    case DASHBOARD_ACTIONS.DECLINE_INVITATION:
      return {
        ...state,
        invitations: state.invitations.filter(inv => inv.id !== action.payload)
      };
      
    case DASHBOARD_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case DASHBOARD_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
      
    case DASHBOARD_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
      
    default:
      return state;
  }
};

// Context
const DashboardContext = createContext();

// Provider component
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Action creators
  const actions = {
    setUserData: useCallback((userData) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_USER_DATA, payload: userData });
    }, []),

    setCampaigns: useCallback((campaigns) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_CAMPAIGNS, payload: campaigns });
    }, []),

    setApplications: useCallback((applications) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_APPLICATIONS, payload: applications });
    }, []),

    setInvitations: useCallback((invitations) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_INVITATIONS, payload: invitations });
    }, []),

    setCollaborations: useCallback((collaborations) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_COLLABORATIONS, payload: collaborations });
    }, []),

    setStats: useCallback((stats) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_STATS, payload: stats });
    }, []),

    addApplication: useCallback((application) => {
      dispatch({ type: DASHBOARD_ACTIONS.ADD_APPLICATION, payload: application });
    }, []),

    updateApplication: useCallback((applicationUpdate) => {
      dispatch({ type: DASHBOARD_ACTIONS.UPDATE_APPLICATION, payload: applicationUpdate });
    }, []),

    acceptInvitation: useCallback((invitation) => {
      dispatch({ type: DASHBOARD_ACTIONS.ACCEPT_INVITATION, payload: invitation });
    }, []),

    declineInvitation: useCallback((invitationId) => {
      dispatch({ type: DASHBOARD_ACTIONS.DECLINE_INVITATION, payload: invitationId });
    }, []),

    setLoading: useCallback((loading) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR });
    }, [])
  };

  const value = {
    ...state,
    actions
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;