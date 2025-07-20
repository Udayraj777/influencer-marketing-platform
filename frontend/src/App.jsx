import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './components/LandingPage'
import Register from './components/Register'
import InfluencerOnboarding from './components/onboarding/InfluencerOnboarding'
import BusinessOnboarding from './components/onboarding/BusinessOnboarding'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding/influencer" element={<InfluencerOnboarding />} />
          <Route path="/onboarding/business" element={<BusinessOnboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
