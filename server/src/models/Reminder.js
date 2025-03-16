const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a reminder title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  notificationType: {
    type: String,
    enum: ['Email', 'App', 'Both'],
    default: 'App'
  },
  remindAt: {
    type: Date
  },
  repeating: {
    type: Boolean,
    default: false
  },
  repeatFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'None'],
    default: 'None'
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job'
  },
  contact: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contact'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // New fields for notification tracking
  emailSent: {
    type: Boolean,
    default: false
  },
  lastNotificationSent: {
    type: Date
  },
  nextNotificationDate: {
    type: Date
  }
});

// Ensure indexes for quick retrieval by user and due date
ReminderSchema.index({ user: 1, dueDate: 1 });
// Add index for notification querying
ReminderSchema.index({ remindAt: 1, notificationType: 1, emailSent: 1 });

module.exports = mongoose.model('Reminder', ReminderSchema); 