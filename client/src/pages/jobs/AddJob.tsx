import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface JobFormData {
  title: string;
  company: string;
  location: string;
  status: string;
  description?: string;
  salary?: number;
  salaryTimeFrame?: string;
  remoteStatus?: string;
  jobPostingLink?: string;
}

const AddJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    status: 'Applied',
    description: '',
    salary: undefined,
    salaryTimeFrame: 'Yearly',
    remoteStatus: 'On-site',
    jobPostingLink: ''
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? undefined : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting job data:', formData);
      
      // Make sure to use the full API URL
      const response = await axios.post('/api/jobs', formData);
      
      console.log('Job created response:', response.data);
      toast.success('Job added successfully');
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error adding job:', error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.error || 'Failed to add job';
      toast.error(errorMessage);
      
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add New Job</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Required Fields */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Company <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
              <option value="Accepted">Accepted</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Not Applied">Not Applied</option>
            </select>
          </div>
          
          {/* Optional Fields */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Remote Status</label>
            <select
              name="remoteStatus"
              value={formData.remoteStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              min="0"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Salary Time Frame</label>
            <select
              name="salaryTimeFrame"
              value={formData.salaryTimeFrame}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Hourly">Hourly</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Job Posting Link</label>
            <input
              type="url"
              name="jobPostingLink"
              value={formData.jobPostingLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>
        
        <div className="mb-4 col-span-2">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={5}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            type="button" 
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddJob; 