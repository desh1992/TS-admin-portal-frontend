import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminProtectedRoute } from './components/AdminProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AuditLogsPage } from './pages/admin/AuditLogsPage'
import { EnrollmentsPage } from './pages/admin/EnrollmentsPage'
import { FinancePage } from './pages/admin/FinancePage'
import { MessagesPage } from './pages/admin/MessagesPage'
import { NotificationsPage } from './pages/admin/NotificationsPage'
import { ProgramsPage } from './pages/admin/ProgramsPage'
import { ProviderApplicationsPage } from './pages/admin/ProviderApplicationsPage'
import { ProvidersPage } from './pages/admin/ProvidersPage'
import { ReviewsPage } from './pages/admin/ReviewsPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { SupportPage } from './pages/admin/SupportPage'
import { UsersPage } from './pages/admin/UsersPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route element={<AdminProtectedRoute permission="users.read" />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="providers.read" />}>
            <Route path="providers" element={<ProvidersPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="providerApplications.review" />}>
            <Route path="provider-applications" element={<ProviderApplicationsPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="programs.read" />}>
            <Route path="programs" element={<ProgramsPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="enrollments.read" />}>
            <Route path="enrollments" element={<EnrollmentsPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="finance.read" />}>
            <Route path="finance" element={<FinancePage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="support.manage" />}>
            <Route path="support" element={<SupportPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="programs.moderate" />}>
            <Route path="reviews" element={<ReviewsPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="messages.metadata.read" />}>
            <Route path="messages" element={<MessagesPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="notifications.read" />}>
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
          <Route element={<AdminProtectedRoute permission="adminUsers.manage" />}>
            <Route path="admin-users" element={<AdminUsersPage />} />
          </Route>
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route element={<AdminProtectedRoute permission="systemSettings.manage" />}>
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
