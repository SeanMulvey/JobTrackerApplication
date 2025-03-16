import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  createdAt: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/jobs', {
        params: {
          search: searchTerm || undefined
        }
      });
      
      console.log('API response:', response.data);
      
      if (response.data && response.data.data) {
        setJobs(response.data.data);
      } else if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        setJobs([]);
        toast.error('Unexpected API response format');
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
      case 'interviewing':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
      case 'offer received':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link to="/jobs/add" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Job
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs..."
            className="flex-grow px-4 py-2 border rounded-l focus:outline-none"
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-r"
          >
            Search
          </button>
        </div>
      </form>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No jobs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Job Title</th>
                    <th className="py-3 px-4 text-left">Company</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Date Applied</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{job.title}</td>
                      <td className="py-3 px-4">{job.company}</td>
                      <td className="py-3 px-4">{job.location || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/jobs/${job._id}`} className="text-blue-600 hover:underline mr-4">
                          View
                        </Link>
                        <Link to={`/jobs/${job._id}/edit`} className="text-blue-600 hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs; 