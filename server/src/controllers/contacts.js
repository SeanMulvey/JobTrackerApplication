const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Contact = require('../models/Contact');
const Job = require('../models/Job');

// @desc    Get all contacts for a user
// @route   GET /api/contacts
// @access  Private
exports.getContacts = asyncHandler(async (req, res, next) => {
  // Prepare filtering
  const filter = { user: req.user.id };
  
  // Add additional filtering based on query params
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  if (req.query.company) {
    filter.company = { $regex: req.query.company, $options: 'i' };
  }

  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: 'i' };
  }

  // Handle search query
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Handle filtering by job
  if (req.query.job) {
    filter.jobs = req.query.job;
  }

  // Handle pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Contact.countDocuments(filter);

  // Execute query with pagination
  const contacts = await Contact.find(filter)
    .populate('jobs', 'company title status')
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });

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
    count: contacts.length,
    pagination,
    data: contacts
  });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id).populate('jobs', 'company title status dateApplied');

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns contact
  if (contact.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this contact`, 401));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
exports.createContact = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;
  
  const contact = await Contact.create(req.body);

  // If jobs are provided, link them to the contact
  if (req.body.jobs && req.body.jobs.length > 0) {
    await Promise.all(
      req.body.jobs.map(async (jobId) => {
        const job = await Job.findById(jobId);
        if (job && job.user.toString() === req.user.id) {
          if (!job.contacts.includes(contact._id)) {
            job.contacts.push(contact._id);
            await job.save();
          }
        }
      })
    );
  }

  res.status(201).json({
    success: true,
    data: contact
  });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = asyncHandler(async (req, res, next) => {
  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns contact
  if (contact.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this contact`, 401));
  }

  contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns contact
  if (contact.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this contact`, 401));
  }

  // Remove contact from any linked jobs
  await Job.updateMany(
    { contacts: contact._id },
    { $pull: { contacts: contact._id } }
  );

  await Contact.findByIdAndDelete(contact._id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add interaction to contact
// @route   PUT /api/contacts/:id/interactions
// @access  Private
exports.addInteraction = asyncHandler(async (req, res, next) => {
  const { type, notes } = req.body;

  if (!type || !notes) {
    return next(new ErrorResponse('Please provide interaction type and notes', 400));
  }

  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns contact
  if (contact.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this contact`, 401));
  }

  // Add interaction
  contact.interactions.push({
    type,
    notes,
    date: new Date()
  });

  // Update last contacted date
  contact.lastContacted = new Date();

  await contact.save();

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Link contact to job
// @route   PUT /api/contacts/:id/jobs/:jobId
// @access  Private
exports.linkContactToJob = asyncHandler(async (req, res, next) => {
  let contact = await Contact.findById(req.params.id);
  const job = await Job.findById(req.params.jobId);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.jobId}`, 404));
  }

  // Make sure user owns both contact and job
  if (contact.user.toString() !== req.user.id || job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update these resources`, 401));
  }

  // Check if already linked
  if (contact.jobs.includes(job._id)) {
    return next(new ErrorResponse(`Contact is already linked to this job`, 400));
  }

  // Link job to contact
  contact.jobs.push(job._id);
  await contact.save();

  // Link contact to job
  job.contacts.push(contact._id);
  await job.save();

  // Add activity to job
  job.activities.push({
    type: 'Contact Added',
    description: `Contact ${contact.name} (${contact.role}) added to job`
  });
  await job.save();

  res.status(200).json({
    success: true,
    data: contact
  });
}); 