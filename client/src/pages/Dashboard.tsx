import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SankeyChart from '../components/SankeyChart';

interface Reminder {
  _id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface DashboardStats {
  totalJobs: number;
  totalContacts: number;
  totalReminders: number;
  upcomingReminders: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalContacts: 0,
    totalReminders: 0,
    upcomingReminders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch jobs, contacts, and reminders in parallel
        const [jobsRes, contactsRes, remindersRes] = await Promise.all([
          axios.get('/api/jobs'),
          axios.get('/api/contacts'),
          axios.get('/api/reminders')
        ]);
        
        // Process jobs response
        let jobs = [];
        if (jobsRes.data && jobsRes.data.data) {
          jobs = jobsRes.data.data;
        } else if (Array.isArray(jobsRes.data)) {
          jobs = jobsRes.data;
        }
        
        // Process contacts response
        let contacts = [];
        if (contactsRes.data && contactsRes.data.data) {
          contacts = contactsRes.data.data;
        } else if (Array.isArray(contactsRes.data)) {
          contacts = contactsRes.data;
        }
        
        // Process reminders response
        let reminders: Reminder[] = [];
        if (remindersRes.data && remindersRes.data.data) {
          reminders = remindersRes.data.data;
        } else if (Array.isArray(remindersRes.data)) {
          reminders = remindersRes.data;
        }
        
        // Count upcoming reminders (not completed and due date is in the future or today)
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to start of day
        
        const upcomingReminders = reminders.filter((reminder: Reminder) => {
          if (reminder.completed) return false;
          
          const dueDate = new Date(reminder.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          return dueDate >= now;
        }).length;
        
        setStats({
          totalJobs: jobs.length,
          totalContacts: contacts.length,
          totalReminders: reminders.length,
          upcomingReminders
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link 
          to="/analytics" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Full Analytics
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Job Applications</h2>
              <p className="text-3xl font-bold text-blue-600 mb-4">{stats.totalJobs}</p>
              <p className="text-gray-500 mb-4">Manage and track your job applications</p>
              <Link to="/jobs" className="text-blue-600 hover:underline">View all jobs</Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Contacts</h2>
              <p className="text-3xl font-bold text-blue-600 mb-4">{stats.totalContacts}</p>
              <p className="text-gray-500 mb-4">Manage your professional network</p>
              <Link to="/contacts" className="text-blue-600 hover:underline">View all contacts</Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Reminders</h2>
              <p className="text-3xl font-bold text-blue-600 mb-4">{stats.upcomingReminders}</p>
              <p className="text-gray-500 mb-4">You have {stats.upcomingReminders} upcoming reminders</p>
              <Link to="/reminders" className="text-blue-600 hover:underline">View all reminders</Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <SankeyChart />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/jobs/add" className="block px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                  Add New Job
                </Link>
                <Link to="/contacts/add" className="block px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
                  Add New Contact
                </Link>
                <Link to="/reminders/add" className="block px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">
                  Add New Reminder
                </Link>
                <Link to="/job-value-comparison" className="block px-4 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
                  Compare Job Offers
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Job Value Comparison</h2>
            <p className="text-gray-500 mb-4">
              Compare different job offers based on salary, benefits, and other factors
            </p>
            <Link to="/job-value-comparison" className="text-blue-600 hover:underline">
              Compare job offers
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 