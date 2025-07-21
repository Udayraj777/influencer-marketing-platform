import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './components/LandingPage'
import Register from './components/Register'
import Login from './components/Login'
import InfluencerOnboarding from './components/onboarding/InfluencerOnboarding'
import BusinessOnboarding from './components/onboarding/BusinessOnboarding'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding/influencer" element={<InfluencerOnboarding />} />
          <Route path="/onboarding/business" element={<BusinessOnboarding />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Catch-all route for /onboarding without role - redirect to register */}
          <Route path="/onboarding" element={<Navigate to="/register" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
