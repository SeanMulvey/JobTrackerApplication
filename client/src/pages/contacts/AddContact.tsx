import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ContactFormData {
  name: string;
  company: string;
  jobTitle: string;
  email: string;
  phone: string;
  notes: string;
}

const AddContact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('/api/contacts', formData);
      toast.success('Contact added successfully');
      navigate('/contacts');
    } catch (error) {
      toast.error('Failed to add contact');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add New Contact</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
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
          <label className="block text-gray-700 mb-2">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
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
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            type="button" 
            onClick={() => navigate('/contacts')}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Contact
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContact; 