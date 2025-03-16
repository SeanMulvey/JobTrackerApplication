const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  addJobNote,
  addInterview,
  updateInterview,
  addOfferDetails
} = require('../controllers/jobs');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Job routes
router.route('/')
  .get(getJobs)
  .post(createJob);

router.route('/:id')
  .get(getJob)
  .put(updateJob)
  .delete(deleteJob);

// Job notes route
router.route('/:id/notes')
  .put(addJobNote);

// Interview routes
router.route('/:id/interviews')
  .put(addInterview);

router.route('/:id/interviews/:interviewId')
  .put(updateInterview);

// Offer details route
router.route('/:id/offer')
  .put(addOfferDetails);

module.exports = router; 