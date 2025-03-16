import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Interaction {
  _id?: string;
  date: string;
  type: string;
  notes: string;
}

interface Job {
  _id: string;
  company: string;
  title: string;
  status: string;
  dateApplied?: string;
}

interface Contact {
  _id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  role?: string;
  notes?: string;
  linkedInProfile?: string;
  lastContacted?: string;
  jobs?: Job[];
  interactions?: Interaction[];
  createdAt: string;
}

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/contacts/${id}`);
        
        console.log('Contact details response:', response.data);
        
        // Check if the response is structured as expected
        if (response.data && response.data.data) {
          setContact(response.data.data);
        } else if (response.data) {
          setContact(response.data);
        } else {
          toast.error('Invalid contact data format');
        }
      } catch (error) {
        toast.error('Failed to load contact details');
        console.error('Error fetching contact details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`/api/contacts/${id}`);
      toast.success('Contact deleted successfully');
      navigate('/contacts');
    } catch (error) {
      toast.error('Failed to delete contact');
      console.error('Error deleting contact:', error);
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!contact) {
    return <div className="text-center mt-10">Contact not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{contact.name}</h1>
        <div className="space-x-2">
          <Link 
            to={`/contacts/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Company</p>
                  <p className="font-medium">{contact.company}</p>
                </div>
                {contact.role && (
                  <div>
                    <p className="text-gray-600 text-sm">Role</p>
                    <p>{contact.role}</p>
                  </div>
                )}
                {contact.email && (
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.linkedInProfile && (
                  <div>
                    <p className="text-gray-600 text-sm">LinkedIn</p>
                    <a 
                      href={contact.linkedInProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                {contact.lastContacted && (
                  <div>
                    <p className="text-gray-600 text-sm">Last Contacted</p>
                    <p>{formatDate(contact.lastContacted)}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 text-sm">Created</p>
                  <p>{formatDate(contact.createdAt)}</p>
                </div>
              </div>
            </div>
            
            {contact.notes && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Notes</h2>
                <p className="whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </div>

          {contact.jobs && contact.jobs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Linked Jobs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Company</th>
                      <th className="py-2 px-4 text-left">Title</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Date Applied</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contact.jobs.map((job) => (
                      <tr key={job._id}>
                        <td className="py-2 px-4">{job.company}</td>
                        <td className="py-2 px-4">{job.title}</td>
                        <td className="py-2 px-4">{job.status}</td>
                        <td className="py-2 px-4">
                          {job.dateApplied ? formatDate(job.dateApplied) : 'N/A'}
                        </td>
                        <td className="py-2 px-4">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {contact.interactions && contact.interactions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Interaction History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contact.interactions.map((interaction, index) => (
                      <tr key={interaction._id || index}>
                        <td className="py-2 px-4">{formatDate(interaction.date)}</td>
                        <td className="py-2 px-4">{interaction.type}</td>
                        <td className="py-2 px-4">{interaction.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetail; 