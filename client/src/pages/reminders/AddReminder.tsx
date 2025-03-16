import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Job {
  _id: string;
  title: string;
  company: string;
}

interface Contact {
  _id: string;
  name: string;
  company: string;
}

interface ReminderFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  notificationType: string;
  remindAt?: string;
  repeating: boolean;
  repeatFrequency: string;
  job?: string;
  contact?: string;
}

const AddReminder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    notificationType: 'App',
    remindAt: '',
    repeating: false,
    repeatFrequency: 'None',
    job: '',
    contact: ''
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        
        // Fetch jobs and contacts in parallel
        const [jobsResponse, contactsResponse] = await Promise.all([
          axios.get('/api/jobs'),
          axios.get('/api/contacts')
        ]);
        
        // Process jobs response
        if (jobsResponse.data && jobsResponse.data.data) {
          setJobs(jobsResponse.data.data);
        } else if (Array.isArray(jobsResponse.data)) {
          setJobs(jobsResponse.data);
        }
        
        // Process contacts response
        if (contactsResponse.data && contactsResponse.data.data) {
          setContacts(contactsResponse.data.data);
        } else if (Array.isArray(contactsResponse.data)) {
          setContacts(contactsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast.error('Failed to load jobs and contacts');
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a copy of the form data to send to API
      const reminderData = { ...formData };
      
      // Remove empty optional fields
      if (!reminderData.job) delete reminderData.job;
      if (!reminderData.contact) delete reminderData.contact;
      if (!reminderData.remindAt) delete reminderData.remindAt;
      if (reminderData.repeatFrequency === 'None') {
        reminderData.repeating = false;
      }
      
      // If not repeating, set repeatFrequency to None
      if (!reminderData.repeating) {
        reminderData.repeatFrequency = 'None';
      }
      
      console.log('Submitting reminder:', reminderData);
      const response = await axios.post('/api/reminders', reminderData);
      console.log('Create response:', response.data);
      
      toast.success('Reminder created successfully');
      navigate('/reminders');
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add New Reminder</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="col-span-full mb-4">
            <label className="block text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          {/* Description */}
          <div className="col-span-full mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
          
          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          {/* Priority */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          {/* Notification Type */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Notification Type</label>
            <select
              name="notificationType"
              value={formData.notificationType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="App">App</option>
              <option value="Email">Email</option>
              <option value="Both">Both</option>
            </select>
          </div>
          
          {/* Remind At */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Remind Me At (Optional)</label>
            <input
              type="datetime-local"
              name="remindAt"
              value={formData.remindAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          {/* Repeating */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="repeating"
                checked={formData.repeating}
                onChange={handleChange}
                className="mr-2"
                id="repeating"
              />
              <label htmlFor="repeating" className="text-gray-700">
                Repeating Reminder
              </label>
            </div>
          </div>
          
          {/* Repeat Frequency - only shown if repeating is true */}
          {formData.repeating && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Repeat Frequency</label>
              <select
                name="repeatFrequency"
                value={formData.repeatFrequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          )}
          
          {/* Link to Job */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Link to Job (Optional)</label>
            <select
              name="job"
              value={formData.job}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              disabled={loadingResources}
            >
              <option value="">None</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.company} - {job.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Link to Contact */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Link to Contact (Optional)</label>
            <select
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              disabled={loadingResources}
            >
              <option value="">None</option>
              {contacts.map((contact) => (
                <option key={contact._id} value={contact._id}>
                  {contact.name} ({contact.company})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            type="button" 
            onClick={() => navigate('/reminders')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Add Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReminder; 