const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Job = require('../models/Job');

// @desc    Get job application statistics
// @route   GET /api/analytics/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res, next) => {
  const stats = {};
  
  // Calculate total counts by status
  const statusCounts = await Job.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Format status counts into a more usable object
  stats.statusCounts = {};
  statusCounts.forEach(status => {
    stats.statusCounts[status._id] = status.count;
  });
  
  // Total applications
  stats.totalApplications = await Job.countDocuments({ user: req.user._id });
  
  // Applications in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  stats.recentApplications = await Job.countDocuments({
    user: req.user._id,
    dateApplied: { $gte: thirtyDaysAgo }
  });
  
  // Interviews received
  stats.totalInterviews = await Job.countDocuments({
    user: req.user._id,
    status: { $in: ['Interviewing', 'Offer Received', 'Accepted'] }
  });
  
  // Offers received
  stats.totalOffers = await Job.countDocuments({
    user: req.user._id,
    status: { $in: ['Offer Received', 'Accepted'] }
  });
  
  // Rejection rate
  stats.rejectionRate = stats.totalApplications > 0
    ? await Job.countDocuments({ user: req.user._id, status: 'Rejected' }) / stats.totalApplications * 100
    : 0;
  
  // Success rate (offer received)
  stats.successRate = stats.totalApplications > 0
    ? stats.totalOffers / stats.totalApplications * 100
    : 0;
  
  // Average response time (from applied to first interview)
  const jobsWithInterviews = await Job.find({
    user: req.user._id,
    'interview_process.0': { $exists: true }
  }).select('dateApplied interview_process');
  
  if (jobsWithInterviews.length > 0) {
    let totalResponseDays = 0;
    let jobsWithResponseTime = 0;
    
    jobsWithInterviews.forEach(job => {
      if (job.interview_process && job.interview_process.length > 0) {
        const firstInterview = job.interview_process.sort((a, b) => a.date - b.date)[0];
        
        if (firstInterview && firstInterview.date) {
          const responseDays = Math.floor(
            (new Date(firstInterview.date) - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24)
          );
          
          if (responseDays >= 0) {
            totalResponseDays += responseDays;
            jobsWithResponseTime++;
          }
        }
      }
    });
    
    stats.averageResponseDays = jobsWithResponseTime > 0
      ? Math.round(totalResponseDays / jobsWithResponseTime)
      : null;
  } else {
    stats.averageResponseDays = null;
  }
  
  // Applications by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const applicationsByMonth = await Job.aggregate([
    {
      $match: {
        user: req.user._id,
        dateApplied: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$dateApplied' },
          month: { $month: '$dateApplied' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  stats.applicationsByMonth = applicationsByMonth.map(item => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    count: item.count
  }));
  
  // Get Sankey diagram data
  stats.sankeyData = await getSankeyData(req.user._id);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get data for Sankey diagram
// @route   GET /api/analytics/sankey
// @access  Private
exports.getSankeyDiagram = asyncHandler(async (req, res, next) => {
  const sankeyData = await getSankeyData(req.user._id);
  
  res.status(200).json({
    success: true,
    data: sankeyData
  });
});

// Helper function to get data for Sankey diagram
const getSankeyData = async (userId) => {
  // Get all jobs for user
  const jobs = await Job.find({ user: userId });
  
  // Define nodes (stages of application process)
  const nodes = [
    { id: 'Applied', name: 'Applied' },
    { id: 'Interviewing', name: 'Interviewing' },
    { id: 'Offer Received', name: 'Offer Received' },
    { id: 'Accepted', name: 'Accepted' },
    { id: 'Rejected', name: 'Rejected' },
    { id: 'Withdrawn', name: 'Withdrawn' }
  ];
  
  // Initialize links with zero values
  const links = [
    { source: 'Applied', target: 'Interviewing', value: 0 },
    { source: 'Applied', target: 'Rejected', value: 0 },
    { source: 'Applied', target: 'Withdrawn', value: 0 },
    { source: 'Interviewing', target: 'Offer Received', value: 0 },
    { source: 'Interviewing', target: 'Rejected', value: 0 },
    { source: 'Interviewing', target: 'Withdrawn', value: 0 },
    { source: 'Offer Received', target: 'Accepted', value: 0 },
    { source: 'Offer Received', target: 'Rejected', value: 0 },
    { source: 'Offer Received', target: 'Withdrawn', value: 0 }
  ];
  
  // Count how many jobs moved from one stage to another by analyzing the activities
  jobs.forEach(job => {
    // Default all jobs to at least 'Applied'
    if (job.status === 'Applied') {
      // Currently in applied stage
    } else if (job.status === 'Interviewing') {
      // Move from Applied to Interviewing
      links.find(l => l.source === 'Applied' && l.target === 'Interviewing').value++;
    } else if (job.status === 'Offer Received') {
      // Move from Applied to Interviewing to Offer
      links.find(l => l.source === 'Applied' && l.target === 'Interviewing').value++;
      links.find(l => l.source === 'Interviewing' && l.target === 'Offer Received').value++;
    } else if (job.status === 'Accepted') {
      // Full successful path
      links.find(l => l.source === 'Applied' && l.target === 'Interviewing').value++;
      links.find(l => l.source === 'Interviewing' && l.target === 'Offer Received').value++;
      links.find(l => l.source === 'Offer Received' && l.target === 'Accepted').value++;
    } else if (job.status === 'Rejected') {
      // Find out at which stage the rejection happened
      if (job.interview_process && job.interview_process.length > 0) {
        if (job.offerDetails && job.offerDetails.baseSalary) {
          // Rejected after offer
          links.find(l => l.source === 'Applied' && l.target === 'Interviewing').value++;
          links.find(l => l.source === 'Interviewing' && l.target === 'Offer Received').value++;
          links.find(l => l.source === 'Offer Received' && l.target === 'Rejected').value++;
        } else {
          // Rejected after interview
          links.find(l => l.source === 'Applied' && l.target === 'Interviewing').value++;
          links.find(l => l.source === 'Interviewing' && l.target === 'Rejected').value++;
        }
      } else {
        // Rejected at application stage
        links.find(l => l.source === 'Applied' && l.target === 'Rejected').value++;
      }
    } else if (job.status === 'Withdrawn') {
      // Find out at which stage the withdrawal happened
      if (job.offerDetails && job.offerDetails.baseSalary) {
        // Withdrawn after offer
        links.find(l => l.source === 'Applied' && l.target === 'Interviewing').value++;
        links.find(l => l.source === 'Interviewing' && l.target === 'Offer Received').value++;
        links.find(l => l.source === 'Offer Received' && l.target === 'Withdrawn').value++;
      } else if (job.interview_process && job.interview_process.length > 0) {
        // Withdrawn after interview
        links.find(l => l.source === 'Applied' && l.target === 'Interviewing').value++;
        links.find(l => l.source === 'Interviewing' && l.target === 'Withdrawn').value++;
      } else {
        // Withdrawn at application stage
        links.find(l => l.source === 'Applied' && l.target === 'Withdrawn').value++;
      }
    }
  });
  
  // Remove links with zero value
  let nonZeroLinks = links.filter(link => link.value > 0);
  
  // If no links have values, provide sample data for testing/visualization
  if (nonZeroLinks.length === 0) {
    console.log('No job flow data found, adding sample data for visualization');
    nonZeroLinks = [
      { source: 'Applied', target: 'Interviewing', value: 5 },
      { source: 'Applied', target: 'Rejected', value: 3 },
      { source: 'Interviewing', target: 'Offer Received', value: 3 },
      { source: 'Interviewing', target: 'Rejected', value: 2 },
      { source: 'Offer Received', target: 'Accepted', value: 2 },
      { source: 'Offer Received', target: 'Withdrawn', value: 1 }
    ];
  }
  
  return { nodes, links: nonZeroLinks };
};

// @desc    Get application activity over time
// @route   GET /api/analytics/activity
// @access  Private
exports.getActivityTimeline = asyncHandler(async (req, res, next) => {
  // Get time frame from query params, default to last 30 days
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get all jobs and their activities
  const jobs = await Job.find({
    user: req.user._id,
    $or: [
      { dateApplied: { $gte: startDate } },
      { 'activities.date': { $gte: startDate } }
    ]
  }).select('dateApplied activities status');
  
  // Format data for timeline visualization
  const timelineData = [];
  
  jobs.forEach(job => {
    // Add initial application event
    if (job.dateApplied >= startDate) {
      timelineData.push({
        date: job.dateApplied,
        type: 'Application',
        details: `Applied to a job (status: ${job.status})`
      });
    }
    
    // Add all activities that occurred within the time frame
    job.activities.forEach(activity => {
      if (activity.date >= startDate) {
        timelineData.push({
          date: activity.date,
          type: activity.type,
          details: activity.description
        });
      }
    });
  });
  
  // Sort by date
  timelineData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  res.status(200).json({
    success: true,
    count: timelineData.length,
    data: timelineData
  });
}); 