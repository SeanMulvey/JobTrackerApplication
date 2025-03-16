import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Check your inbox</h2>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-gray-600 mb-8">
          If you don't see it within a few minutes, check your spam folder.
        </p>
        <Link
          to="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Reset your password
      </h2>
      <p className="text-center text-gray-600 mb-6">
        We'll send you an email with a link to reset your password.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword; 