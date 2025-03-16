import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout.tsx';
import AuthLayout from './layouts/AuthLayout.tsx';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/jobs/Jobs';
import JobDetail from './pages/jobs/JobDetail.tsx';
import AddJob from './pages/jobs/AddJob.tsx';
import EditJob from './pages/jobs/EditJob.tsx';
import Contacts from './pages/contacts/Contacts';
import ContactDetail from './pages/contacts/ContactDetail.tsx';
import AddContact from './pages/contacts/AddContact.tsx';
import EditContact from './pages/contacts/EditContact.tsx';
import Reminders from './pages/reminders/Reminders';
import AddReminder from './pages/reminders/AddReminder';
import EditReminder from './pages/reminders/EditReminder';
import JobValueComparison from './pages/jobValue/JobValueComparison';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound.tsx';
import Analytics from './pages/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* Main App Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
          
          {/* Jobs Routes */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/add" element={<AddJob />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          
          {/* Contacts Routes */}
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/add" element={<AddContact />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="contacts/:id/edit" element={<EditContact />} />
          
          {/* Reminders Routes */}
          <Route path="reminders" element={<Reminders />} />
          <Route path="reminders/add" element={<AddReminder />} />
          <Route path="reminders/:id/edit" element={<EditReminder />} />
          
          {/* Job Value Routes */}
          <Route path="job-value-comparison" element={<JobValueComparison />} />
          
          {/* Profile Route */}
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App; 