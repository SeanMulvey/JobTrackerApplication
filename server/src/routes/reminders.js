const express = require('express');
const {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  getUpcomingReminders,
  sendTestEmail
} = require('../controllers/reminders');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Special route for upcoming reminders
router.get('/upcoming', getUpcomingReminders);

// Test email route
router.post('/:id/send-test-email', sendTestEmail);

// Standard CRUD routes
router.route('/')
  .get(getReminders)
  .post(createReminder);

router.route('/:id')
  .get(getReminder)
  .put(updateReminder)
  .delete(deleteReminder);

module.exports = router; 