import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  notes: string;
  jobs: string[];
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contacts', {
        params: {
          search: searchTerm || undefined
        }
      });
      
      console.log('Contact API response:', response.data);
      
      if (response.data && response.data.data) {
        setContacts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setContacts(response.data);
      } else {
        setContacts([]);
        toast.error('Unexpected API response format');
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      toast.error('Failed to load contacts');
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Link to="/contacts/add" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Contact
        </Link>
      </div>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
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
          {contacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No contacts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Company</th>
                    <th className="py-3 px-4 text-left">Role</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Phone</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{contact.name}</td>
                      <td className="py-3 px-4">{contact.company}</td>
                      <td className="py-3 px-4">{contact.role || 'N/A'}</td>
                      <td className="py-3 px-4">{contact.email || 'N/A'}</td>
                      <td className="py-3 px-4">{contact.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/contacts/${contact._id}`} className="text-blue-600 hover:underline mr-4">
                          View
                        </Link>
                        <Link to={`/contacts/${contact._id}/edit`} className="text-blue-600 hover:underline">
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

export default Contacts; 