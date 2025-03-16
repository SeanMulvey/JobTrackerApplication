import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">JobTracker</div>
        <nav className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600">
            Login
          </Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Track Your Job Applications with Ease
            </h1>
            <p className="text-xl text-gray-600">
              Keep all your job applications organized in one place. Track status, manage contacts, and analyze your job search progress.
            </p>
            <div className="space-x-4 pt-4">
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Get Started
              </Link>
              <Link to="/dashboard" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
                Learn More
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img 
              src="https://via.placeholder.com/600x400?text=Job+Tracker+Dashboard"
              alt="Job Tracker Dashboard Preview"
              className="rounded-lg shadow-xl w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">📝</div>
            <h2 className="text-xl font-bold mb-2">Manage Applications</h2>
            <p className="text-gray-600">Track all your job applications in one centralized dashboard. Never lose track of where you applied.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">📊</div>
            <h2 className="text-xl font-bold mb-2">Visualize Progress</h2>
            <p className="text-gray-600">Get insights into your job search with interactive analytics and visualizations.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">💰</div>
            <h2 className="text-xl font-bold mb-2">Compare Job Value</h2>
            <p className="text-gray-600">Compare salaries with cost of living to determine which opportunities offer the best value.</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-12 mt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold mb-4">JobTracker</div>
              <p className="text-gray-400 max-w-xs">
                Your comprehensive solution for managing and tracking job applications.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white">Sign Up</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
                <li><Link to="/profile" className="text-gray-400 hover:text-white">Profile</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            &copy; {new Date().getFullYear()} JobTracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 