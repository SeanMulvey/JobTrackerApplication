import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/jobs/${id}`);
        
        console.log('Job data response:', response.data);
        
        // Check response format and extract job data
        if (response.data && response.data.data) {
          setFormData({
            title: response.data.data.title || '',
            company: response.data.data.company || '',
            location: response.data.data.location || '',
            status: response.data.data.status || 'Applied',
            description: response.data.data.description || '',
            salary: response.data.data.salary,
            salaryTimeFrame: response.data.data.salaryTimeFrame || 'Yearly',
            remoteStatus: response.data.data.remoteStatus || 'On-site',
            jobPostingLink: response.data.data.jobPostingLink || ''
          });
        } else if (response.data) {
          setFormData({
            title: response.data.title || '',
            company: response.data.company || '',
            location: response.data.location || '',
            status: response.data.status || 'Applied',
            description: response.data.description || '',
            salary: response.data.salary,
            salaryTimeFrame: response.data.salaryTimeFrame || 'Yearly',
            remoteStatus: response.data.remoteStatus || 'On-site',
            jobPostingLink: response.data.jobPostingLink || ''
          });
        } else {
          toast.error('Invalid job data format');
        }
      } catch (error) {
        toast.error('Failed to load job data');
        console.error('Error fetching job data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

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
    setSubmitting(true);
    
    try {
      console.log('Submitting job update:', formData);
      const response = await axios.put(`/api/jobs/${id}`, formData);
      console.log('Update response:', response.data);
      toast.success('Job updated successfully');
      navigate(`/jobs/${id}`);
    } catch (error: any) {
      console.error('Error updating job:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update job';
      toast.error(errorMessage);
      
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Job</h1>
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
            onClick={() => navigate(`/jobs/${id}`)}
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob; 