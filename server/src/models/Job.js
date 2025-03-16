const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  status: {
    type: String,
    required: [true, 'Please add a status'],
    enum: ['Applied', 'Interviewing', 'Offer Received', 'Rejected', 'Accepted', 'Withdrawn', 'Not Applied']
  },
  dateApplied: {
    type: Date,
    default: Date.now
  },
  jobPostingLink: {
    type: String,
    match: [
      /^(http|https):\/\/[^ "]+$/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  salaryTimeFrame: {
    type: String,
    enum: ['Hourly', 'Weekly', 'Monthly', 'Yearly'],
    default: 'Yearly'
  },
  location: {
    type: String,
    trim: true
  },
  remoteStatus: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site'],
    default: 'On-site'
  },
  description: {
    type: String
  },
  notes: {
    type: String
  },
  requirements: [String],
  benefits: [String],
  company_details: {
    size: String,
    industry: String,
    website: String
  },
  interview_process: [{
    type: {
      type: String,
      enum: ['Phone Screen', 'Technical', 'Behavioral', 'Take-home', 'Final Round', 'Other']
    },
    date: Date,
    duration: Number, // in minutes
    with: String,
    notes: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  activities: [{
    type: {
      type: String,
      enum: ['Status Change', 'Note Added', 'Reminder Set', 'Contact Added', 'Other']
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  contacts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Contact'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  offerDetails: {
    baseSalary: Number,
    bonus: Number,
    stockOptions: Number,
    benefits: {
      healthcare: Boolean,
      dental: Boolean,
      vision: Boolean,
      retirement: {
        has401k: Boolean,
        matchPercentage: Number
      },
      pto: Number, // days
      otherBenefits: [String]
    },
    negotiationNotes: String,
    offerDeadline: Date
  }
});

// Add text index for search functionality
JobSchema.index({ 
  company: 'text', 
  title: 'text', 
  location: 'text', 
  notes: 'text',
  description: 'text'
});

// Cascade delete activities when a job is deleted
JobSchema.pre('remove', async function (next) {
  await this.model('Reminder').deleteMany({ job: this._id });
  next();
});

module.exports = mongoose.model('Job', JobSchema); 