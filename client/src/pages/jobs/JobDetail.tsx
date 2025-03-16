import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  remoteStatus?: string;
  salary?: number;
  salaryTimeFrame?: string;
  description?: string;
  jobPostingLink?: string;
  dateApplied: string;
  createdAt: string;
  contacts?: Array<{
    _id: string;
    name: string;
    company: string;
    role: string;
  }>;
  interview_process?: Array<{
    _id: string;
    type: string;
    date: string;
    notes: string;
    completed: boolean;
  }>;
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/jobs/${id}`);
        
        // Log the response to help with debugging
        console.log('Job details response:', response.data);
        
        // Check if the response is structured as expected
        if (response.data && response.data.data) {
          setJob(response.data.data);
        } else if (response.data) {
          setJob(response.data);
        } else {
          toast.error('Invalid job data format');
        }
      } catch (error) {
        toast.error('Failed to load job details');
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        setDeleting(true);
        await axios.delete(`/api/jobs/${id}`);
        toast.success('Job deleted successfully');
        navigate('/jobs');
      } catch (error) {
        toast.error('Failed to delete job');
        console.error('Error deleting job:', error);
        setDeleting(false);
      }
    }
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
      case 'withdrawn':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center mt-10">Job not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="flex space-x-2">
          <Link
            to={`/jobs/${id}/edit`}
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
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Company</p>
                  <p className="font-medium">{job.company}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <p>
                    <span className={`px-2 py-1 text-sm rounded-full inline-block ${getStatusClass(job.status)}`}>
                      {job.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Location</p>
                  <p>{job.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Remote Status</p>
                  <p>{job.remoteStatus || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date Applied</p>
                  <p>{new Date(job.dateApplied).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
              <div className="space-y-3">
                {job.salary && (
                  <div>
                    <p className="text-gray-600 text-sm">Salary</p>
                    <p>
                      ${job.salary.toLocaleString()} {job.salaryTimeFrame ? `(${job.salaryTimeFrame})` : ''}
                    </p>
                  </div>
                )}
                {job.jobPostingLink && (
                  <div>
                    <p className="text-gray-600 text-sm">Job Posting</p>
                    <a 
                      href={job.jobPostingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Job Posting
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {job.description && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {job.contacts && job.contacts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Contacts</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Company</th>
                      <th className="py-2 px-4 text-left">Role</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {job.contacts.map((contact) => (
                      <tr key={contact._id}>
                        <td className="py-2 px-4">{contact.name}</td>
                        <td className="py-2 px-4">{contact.company}</td>
                        <td className="py-2 px-4">{contact.role}</td>
                        <td className="py-2 px-4">
                          <Link
                            to={`/contacts/${contact._id}`}
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

          {job.interview_process && job.interview_process.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Interview Process</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Notes</th>
                      <th className="py-2 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {job.interview_process.map((interview) => (
                      <tr key={interview._id}>
                        <td className="py-2 px-4">{interview.type}</td>
                        <td className="py-2 px-4">{new Date(interview.date).toLocaleDateString()}</td>
                        <td className="py-2 px-4">{interview.notes}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${interview.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {interview.completed ? 'Completed' : 'Pending'}
                          </span>
                        </td>
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

export default JobDetail; 