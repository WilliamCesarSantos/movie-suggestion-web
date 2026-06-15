import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RegisterUserPage } from './pages/RegisterUserPage'

function App() {
  return (
    <Routes>
      {/* Public placeholder routes */}
      <Route path="/login" element={<div className="p-8 text-gray-700">Login screen (coming soon)</div>} />
      <Route path="/" element={<div className="p-8 text-gray-700">Home</div>} />

      {/* Protected: requires users:write */}
      <Route element={<ProtectedRoute requiredRole="users:write" />}>
        <Route path="/users/new" element={<RegisterUserPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
