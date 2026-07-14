import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminProtectedRoute } from './components/AdminProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { UsersPage } from './pages/admin/UsersPage'
import { LoginPage } from './pages/LoginPage'

/*
 * Delivery scope:
 * Only requirement 1 (user profile management) is currently exposed.
 * The source pages for requirements 2–7 remain in src/pages/admin so they
 * can be restored later without losing the completed work.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route element={<AdminProtectedRoute permission="users.read" />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="users" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
