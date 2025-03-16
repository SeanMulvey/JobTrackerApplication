const express = require('express');
const {
  getStats,
  getSankeyDiagram,
  getActivityTimeline
} = require('../controllers/analytics');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Analytics routes
router.get('/stats', getStats);
router.get('/sankey', getSankeyDiagram);
router.get('/activity', getActivityTimeline);

module.exports = router; 