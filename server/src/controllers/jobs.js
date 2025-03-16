const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Job = require('../models/Job');
const Contact = require('../models/Contact');
const axios = require('axios');
const cheerio = require('cheerio');

// @desc    Get all jobs for a user
// @route   GET /api/jobs
// @access  Private
exports.getJobs = asyncHandler(async (req, res, next) => {
  // Prepare filtering
  const filter = { user: req.user.id };
  
  // Add additional filtering based on query params
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.company) {
    filter.company = { $regex: req.query.company, $options: 'i' };
  }

  if (req.query.title) {
    filter.title = { $regex: req.query.title, $options: 'i' };
  }

  if (req.query.location) {
    filter.location = { $regex: req.query.location, $options: 'i' };
  }

  // Date range filtering
  if (req.query.startDate && req.query.endDate) {
    filter.dateApplied = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  } else if (req.query.startDate) {
    filter.dateApplied = { $gte: new Date(req.query.startDate) };
  } else if (req.query.endDate) {
    filter.dateApplied = { $lte: new Date(req.query.endDate) };
  }

  // Handle pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Job.countDocuments(filter);

  // Execute query with pagination
  const jobs = await Job.find(filter)
    .populate('contacts', 'name email phone role company')
    .skip(startIndex)
    .limit(limit)
    .sort({ dateApplied: -1 });

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
    count: jobs.length,
    pagination,
    data: jobs
  });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate('contacts', 'name email phone role company');

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this job`, 401));
  }

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
exports.createJob = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;
  
  // If job posting link provided and auto-populate requested
  if (req.body.jobPostingLink && req.body.autoPopulate) {
    try {
      const jobData = await scrapeJobPosting(req.body.jobPostingLink);
      // Merge scraped data with provided data (provided data takes precedence)
      req.body = { ...jobData, ...req.body };
    } catch (err) {
      console.error('Error scraping job data:', err);
      // Continue without auto-population if scraping fails
    }
  }

  const job = await Job.create(req.body);

  // If contacts are provided, link them to the job
  if (req.body.contacts && req.body.contacts.length > 0) {
    await Promise.all(
      req.body.contacts.map(async (contactId) => {
        const contact = await Contact.findById(contactId);
        if (contact && contact.user.toString() === req.user.id) {
          contact.jobs.push(job._id);
          await contact.save();
        }
      })
    );
  }

  res.status(201).json({
    success: true,
    data: job
  });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this job`, 401));
  }

  // Handle status change with activity log
  if (req.body.status && req.body.status !== job.status) {
    job.activities.push({
      type: 'Status Change',
      description: `Status changed from ${job.status} to ${req.body.status}`
    });
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this job`, 401));
  }

  // Remove job from any linked contacts
  await Contact.updateMany(
    { jobs: job._id },
    { $pull: { jobs: job._id } }
  );

  await Job.findByIdAndDelete(job._id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add note to job
// @route   PUT /api/jobs/:id/notes
// @access  Private
exports.addJobNote = asyncHandler(async (req, res, next) => {
  const { note } = req.body;

  if (!note) {
    return next(new ErrorResponse('Please provide a note', 400));
  }

  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this job`, 401));
  }

  // Add note to activities
  job.activities.push({
    type: 'Note Added',
    description: note
  });

  // Update the main notes field
  if (job.notes) {
    job.notes += `\n\n${note}`;
  } else {
    job.notes = note;
  }

  await job.save();

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Add interview to job
// @route   PUT /api/jobs/:id/interviews
// @access  Private
exports.addInterview = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this job`, 401));
  }

  // Add interview to job
  job.interview_process.push(req.body);

  // Update status to interviewing if not already past that stage
  if (job.status === 'Applied') {
    job.status = 'Interviewing';
  }

  // Add activity
  job.activities.push({
    type: 'Status Change',
    description: `Interview scheduled: ${req.body.type} on ${new Date(req.body.date).toLocaleDateString()}`
  });

  await job.save();

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Update interview in job
// @route   PUT /api/jobs/:id/interviews/:interviewId
// @access  Private
exports.updateInterview = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this job`, 401));
  }

  // Find interview
  const interviewIndex = job.interview_process.findIndex(
    interview => interview._id.toString() === req.params.interviewId
  );

  if (interviewIndex === -1) {
    return next(new ErrorResponse(`Interview not found with id of ${req.params.interviewId}`, 404));
  }

  // Update interview
  job.interview_process[interviewIndex] = {
    ...job.interview_process[interviewIndex].toObject(),
    ...req.body
  };

  await job.save();

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Add offer details to job
// @route   PUT /api/jobs/:id/offer
// @access  Private
exports.addOfferDetails = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this job`, 401));
  }

  // Update offer details
  job.offerDetails = {
    ...job.offerDetails,
    ...req.body
  };

  // Update status if not already at offer stage
  if (job.status !== 'Offer Received' && job.status !== 'Accepted') {
    job.status = 'Offer Received';
    
    // Add activity
    job.activities.push({
      type: 'Status Change',
      description: `Offer received with base salary of ${req.body.baseSalary}`
    });
  }

  await job.save();

  res.status(200).json({
    success: true,
    data: job
  });
});

// Helper function to scrape job data from posting
async function scrapeJobPosting(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Basic implementation - would need to be enhanced for different job sites
    const jobData = {
      title: $('h1').first().text().trim() || '',
      company: $('.company-name, .employer-name').first().text().trim() || '',
      location: $('.location, .job-location').first().text().trim() || '',
      description: $('.description, .job-description').first().text().trim() || '',
      requirements: []
    };

    // Extract requirements if available
    $('.requirements li, .qualifications li').each((i, el) => {
      jobData.requirements.push($(el).text().trim());
    });

    return jobData;
  } catch (error) {
    console.error('Error scraping job posting:', error);
    throw error;
  }
} 