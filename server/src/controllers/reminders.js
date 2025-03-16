const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Reminder = require('../models/Reminder');
const Job = require('../models/Job');
const { sendReminderEmail } = require('../utils/reminderNotificationService');
const User = require('../models/User');

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
exports.getReminders = asyncHandler(async (req, res, next) => {
  // Prepare filtering
  const filter = { user: req.user.id };
  
  // Add additional filtering based on query params
  if (req.query.completed !== undefined) {
    filter.completed = req.query.completed === 'true';
  }
  
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  // Filter by job if provided
  if (req.query.job) {
    filter.job = req.query.job;
  }

  // Filter by contact if provided
  if (req.query.contact) {
    filter.contact = req.query.contact;
  }

  // Date range filtering
  if (req.query.startDate && req.query.endDate) {
    filter.dueDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  } else if (req.query.startDate) {
    filter.dueDate = { $gte: new Date(req.query.startDate) };
  } else if (req.query.endDate) {
    filter.dueDate = { $lte: new Date(req.query.endDate) };
  }

  // Filter for upcoming reminders
  if (req.query.upcoming === 'true') {
    filter.dueDate = { $gte: new Date() };
    if (!req.query.completed) {
      filter.completed = false;
    }
  }

  // Handle pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Reminder.countDocuments(filter);

  // Execute query with pagination
  const reminders = await Reminder.find(filter)
    .populate('job', 'company title')
    .populate('contact', 'name company role')
    .skip(startIndex)
    .limit(limit)
    .sort({ dueDate: 1 });

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: reminders.length,
    pagination,
    data: reminders
  });
});

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
exports.getReminder = asyncHandler(async (req, res, next) => {
  const reminder = await Reminder.findById(req.params.id)
    .populate('job', 'company title status')
    .populate('contact', 'name company role');

  if (!reminder) {
    return next(new ErrorResponse(`Reminder not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns reminder
  if (reminder.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this reminder`, 401));
  }

  res.status(200).json({
    success: true,
    data: reminder
  });
});

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;
  
  // Check if job exists and belongs to user
  if (req.body.job) {
    const job = await Job.findById(req.body.job);
    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.body.job}`, 404));
    }
    
    if (job.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to add reminder to this job`, 401));
    }

    // Add activity to job
    job.activities.push({
      type: 'Reminder Set',
      description: `Reminder set: ${req.body.title} for ${new Date(req.body.dueDate).toLocaleDateString()}`
    });
    await job.save();
  }

  const reminder = await Reminder.create(req.body);

  res.status(201).json({
    success: true,
    data: reminder
  });
});

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminder = asyncHandler(async (req, res, next) => {
  let reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    return next(new ErrorResponse(`Reminder not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns reminder
  if (reminder.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this reminder`, 401));
  }

  // If completing the reminder and it's linked to a job, update job activities
  if (req.body.completed === true && reminder.completed === false && reminder.job) {
    const job = await Job.findById(reminder.job);
    if (job) {
      job.activities.push({
        type: 'Other',
        description: `Completed reminder: ${reminder.title}`
      });
      await job.save();
    }
  }

  reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: reminder
  });
});

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = asyncHandler(async (req, res, next) => {
  const reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    return next(new ErrorResponse(`Reminder not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns reminder
  if (reminder.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this reminder`, 401));
  }

  await Reminder.findByIdAndDelete(reminder._id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get upcoming reminders (for notifications)
// @route   GET /api/reminders/upcoming
// @access  Private
exports.getUpcomingReminders = asyncHandler(async (req, res, next) => {
  // Get reminders due in the next 24 hours
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);

  const reminders = await Reminder.find({
    user: req.user.id,
    completed: false,
    dueDate: {
      $gte: new Date(),
      $lte: tomorrow
    }
  })
    .populate('job', 'company title')
    .populate('contact', 'name company role')
    .sort({ dueDate: 1 });

  res.status(200).json({
    success: true,
    count: reminders.length,
    data: reminders
  });
});

// @desc    Send test email for a reminder
// @route   POST /api/reminders/:id/send-test-email
// @access  Private
exports.sendTestEmail = asyncHandler(async (req, res, next) => {
  const reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    return next(new ErrorResponse(`Reminder not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns reminder
  if (reminder.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this reminder`, 401));
  }

  // Get the user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  // Send the test email
  const result = await sendReminderEmail(reminder, user);

  if (result) {
    res.status(200).json({
      success: true,
      data: { message: 'Test email sent successfully' }
    });
  } else {
    return next(new ErrorResponse('Failed to send test email', 500));
  }
}); 