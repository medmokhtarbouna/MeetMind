import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { SignupPage } from './pages/SignupPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MeetingsListPage } from './pages/MeetingsListPage'
import { NewMeetingPage } from './pages/NewMeetingPage'
import { NewMeetingTextPage } from './pages/NewMeetingTextPage'
import { MeetingDetailPage } from './pages/MeetingDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings"
              element={
                <ProtectedRoute>
                  <MeetingsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings/new"
              element={
                <ProtectedRoute>
                  <NewMeetingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings/new-text"
              element={
                <ProtectedRoute>
                  <NewMeetingTextPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings/:id"
              element={
                <ProtectedRoute>
                  <MeetingDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
