const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  role: {
    type: String,
    enum: ['Recruiter', 'Hiring Manager', 'HR', 'Team Member', 'Other'],
    default: 'Recruiter'
  },
  notes: {
    type: String
  },
  linkedInProfile: {
    type: String
  },
  lastContacted: {
    type: Date
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  jobs: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Job'
  }],
  interactions: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['Email', 'Phone', 'Video Call', 'In-person', 'Other'],
      default: 'Other'
    },
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
ContactSchema.index({ 
  name: 'text', 
  company: 'text', 
  role: 'text', 
  notes: 'text',
  email: 'text'
});

module.exports = mongoose.model('Contact', ContactSchema); 