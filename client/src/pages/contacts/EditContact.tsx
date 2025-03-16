import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  notes: string;
  linkedInProfile: string;
}

const EditContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    role: 'Recruiter',
    notes: '',
    linkedInProfile: ''
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/contacts/${id}`);
        
        console.log('Contact data response:', response.data);
        
        // Check response format and extract contact data
        if (response.data && response.data.data) {
          setFormData({
            name: response.data.data.name || '',
            company: response.data.data.company || '',
            email: response.data.data.email || '',
            phone: response.data.data.phone || '',
            role: response.data.data.role || 'Recruiter',
            notes: response.data.data.notes || '',
            linkedInProfile: response.data.data.linkedInProfile || ''
          });
        } else if (response.data) {
          setFormData({
            name: response.data.name || '',
            company: response.data.company || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            role: response.data.role || 'Recruiter',
            notes: response.data.notes || '',
            linkedInProfile: response.data.linkedInProfile || ''
          });
        } else {
          toast.error('Invalid contact data format');
        }
      } catch (error) {
        toast.error('Failed to load contact data');
        console.error('Error fetching contact data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      console.log('Submitting contact update:', formData);
      const response = await axios.put(`/api/contacts/${id}`, formData);
      console.log('Update response:', response.data);
      toast.success('Contact updated successfully');
      navigate(`/contacts/${id}`);
    } catch (error: any) {
      console.error('Error updating contact:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update contact';
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
      <h1 className="text-2xl font-bold mb-4">Edit Contact</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Required Fields */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
            <label className="block text-gray-700 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Recruiter">Recruiter</option>
              <option value="Hiring Manager">Hiring Manager</option>
              <option value="HR">HR</option>
              <option value="Team Member">Team Member</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="email@example.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="(123) 456-7890"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">LinkedIn Profile</label>
            <input
              type="url"
              name="linkedInProfile"
              value={formData.linkedInProfile}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
        
        <div className="mb-4 col-span-2">
          <label className="block text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={5}
            placeholder="Add any notes about this contact..."
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            type="button" 
            onClick={() => navigate(`/contacts/${id}`)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContact; 