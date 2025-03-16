import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            Job Tracker
          </Link>
          <nav className="flex space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600">Jobs</Link>
            <Link to="/contacts" className="text-gray-600 hover:text-blue-600">Contacts</Link>
            <Link to="/reminders" className="text-gray-600 hover:text-blue-600">Reminders</Link>
            <Link to="/job-value-comparison" className="text-gray-600 hover:text-blue-600">Compare Jobs</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-blue-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-white shadow-inner py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Job Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 