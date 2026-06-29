import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import RoleGuard from './components/RoleGuard'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import OwnerDashboard from './pages/OwnerDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import EmployeeChat from './pages/EmployeeChat'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Onboarding: authenticated but no role yet */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleGuard allow={['owner']}>
              <OwnerDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Manager / supervisor */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute>
            <RoleGuard allow={['owner', 'manager', 'supervisor']}>
              <ManagerDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Any authenticated role */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <RoleGuard allow={['owner', 'manager', 'supervisor', 'employee']}>
              <EmployeeChat />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
