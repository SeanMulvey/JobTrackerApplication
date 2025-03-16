const express = require('express');
const {
  getJobValues,
  getJobValue,
  updateJobValue,
  compareJobs,
  getCostOfLiving,
  getSalaryData,
  getMarketSalary
} = require('../controllers/jobValue');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Public routes - accessible without authentication
// Get market salary data
router.get('/market-salary', getMarketSalary);

// Cost of living data route - using query params instead of path params
router.get('/cost-of-living', getCostOfLiving);

// Protect all remaining routes
router.use(protect);

// Job value routes
router.route('/')
  .get(getJobValues);

router.route('/:jobId')
  .get(getJobValue)
  .put(updateJobValue);

// Compare jobs route
router.post('/compare', compareJobs);

// Salary data route
router.get('/salary-data/:city', getSalaryData);

module.exports = router; 