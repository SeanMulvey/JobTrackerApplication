const mongoose = require('mongoose');

const JobValueSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  averageIndustrySalary: {
    type: Number
  },
  costOfLivingIndex: {
    type: Number
  },
  costOfLivingSource: {
    type: String
  },
  valueRatio: {
    type: Number
  },
  normalizedSalary: {
    type: Number,
    description: 'Salary adjusted for cost of living'
  },
  location: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  compareData: {
    similarJobs: [{
      title: String,
      averageSalary: Number,
      location: String
    }],
    housingCosts: {
      averageRent: Number,
      averageHomePurchase: Number
    },
    taxRate: Number
  },
  customWeights: {
    salary: {
      type: Number,
      default: 1.0
    },
    benefits: {
      type: Number,
      default: 0.5
    },
    costOfLiving: {
      type: Number,
      default: 0.8
    },
    commute: {
      type: Number,
      default: 0.3
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for user and job
JobValueSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('JobValue', JobValueSchema); 