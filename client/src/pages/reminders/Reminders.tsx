import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface Reminder {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  job?: {
    _id: string;
    title: string;
    company: string;
  };
  contact?: {
    _id: string;
    name: string;
    company: string;
  };
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [sort, setSort] = useState<'dueDate' | 'priority'>('dueDate');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reminders');
      console.log('Reminders response:', response.data);
      
      if (response.data && response.data.data) {
        setReminders(response.data.data);
      } else if (Array.isArray(response.data)) {
        setReminders(response.data);
      } else {
        toast.error('Invalid reminders data format');
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await axios.put(`/api/reminders/${id}`, { completed: !completed });
      
      // Update local state
      setReminders(reminders.map(reminder => 
        reminder._id === id 
          ? { ...reminder, completed: !completed } 
          : reminder
      ));
      
      toast.success(`Reminder marked as ${!completed ? 'completed' : 'incomplete'}`);
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/reminders/${id}`);
      setReminders(reminders.filter(reminder => reminder._id !== id));
      toast.success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredReminders = () => {
    let filtered = [...reminders];
    
    if (filter === 'upcoming') {
      filtered = filtered.filter(r => !r.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(r => r.completed);
    }
    
    // Sort the filtered reminders
    filtered.sort((a, b) => {
      if (sort === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        // Sort by priority (High, Medium, Low)
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
    });
    
    return filtered;
  };

  const isOverdue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    return !isNaN(due.getTime()) && due < now;
  };

  const filteredReminders = getFilteredReminders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <Link to="/reminders/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Reminder
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1 rounded-md ${
                filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-md ${
                filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Completed
            </button>
          </div>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'dueDate' | 'priority')}
              className="border rounded p-1"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' 
              ? 'No reminders found. Add your first reminder!' 
              : filter === 'upcoming' 
                ? 'No upcoming reminders. All caught up!'
                : 'No completed reminders yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredReminders.map((reminder) => (
              <li 
                key={reminder._id} 
                className={`p-4 hover:bg-gray-50 ${reminder.completed ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <input
                      type="checkbox"
                      checked={reminder.completed}
                      onChange={() => handleToggleComplete(reminder._id, reminder.completed)}
                      className="mt-1 mr-3"
                    />
                    <div className={`flex-1 ${reminder.completed ? 'text-gray-500 line-through' : ''}`}>
                      <div className="flex items-center">
                        <h3 className="font-medium">{reminder.title}</h3>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityClass(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                      </div>
                      
                      {reminder.description && (
                        <p className="text-gray-600 text-sm mt-1">{reminder.description}</p>
                      )}
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className={`text-sm ${isOverdue(reminder.dueDate) && !reminder.completed ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          Due: {formatDate(reminder.dueDate)}
                          {isOverdue(reminder.dueDate) && !reminder.completed && (
                            <span className="ml-1">(Overdue)</span>
                          )}
                        </div>
                        
                        {reminder.job && (
                          <Link 
                            to={`/jobs/${reminder.job._id}`} 
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Job: {reminder.job.company} - {reminder.job.title}
                          </Link>
                        )}
                        
                        {reminder.contact && (
                          <Link 
                            to={`/contacts/${reminder.contact._id}`} 
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Contact: {reminder.contact.name} ({reminder.contact.company})
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <Link
                      to={`/reminders/${reminder._id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(reminder._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reminders; 