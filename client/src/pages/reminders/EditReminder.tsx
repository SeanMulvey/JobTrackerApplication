import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditReminder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        setLoadingResources(true);
        
        // Fetch reminder, jobs, and contacts in parallel
        const [reminderResponse, jobsResponse, contactsResponse] = await Promise.all([
          axios.get(`/api/reminders/${id}`),
          axios.get('/api/jobs'),
          axios.get('/api/contacts')
        ]);
        
        console.log('Reminder data response:', reminderResponse.data);
        
        // Process reminder response
        let reminderData;
        if (reminderResponse.data && reminderResponse.data.data) {
          reminderData = reminderResponse.data.data;
        } else {
          reminderData = reminderResponse.data;
        }
        
        // Format dates for the form
        const formattedDueDate = reminderData.dueDate 
          ? new Date(reminderData.dueDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
          
        const formattedRemindAt = reminderData.remindAt
          ? new Date(reminderData.remindAt).toISOString().slice(0, 16) // Format for datetime-local input
          : '';
        
        setFormData({
          title: reminderData.title || '',
          description: reminderData.description || '',
          dueDate: formattedDueDate,
          priority: reminderData.priority || 'Medium',
          notificationType: reminderData.notificationType || 'App',
          remindAt: formattedRemindAt,
          repeating: reminderData.repeating || false,
          repeatFrequency: reminderData.repeatFrequency || 'None',
          job: reminderData.job?._id || reminderData.job || '',
          contact: reminderData.contact?._id || reminderData.contact || ''
        });
        
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
        console.error('Error fetching data:', error);
        toast.error('Failed to load reminder data');
        navigate('/reminders');
      } finally {
        setFetchLoading(false);
        setLoadingResources(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
      
      console.log('Updating reminder:', reminderData);
      const response = await axios.put(`/api/reminders/${id}`, reminderData);
      console.log('Update response:', response.data);
      
      toast.success('Reminder updated successfully');
      navigate('/reminders');
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Edit Reminder</h1>
        <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Reminder</h1>
      
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReminder; 