const express = require('express');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  addInteraction,
  linkContactToJob
} = require('../controllers/contacts');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Contact routes
router.route('/')
  .get(getContacts)
  .post(createContact);

router.route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

// Interaction routes
router.route('/:id/interactions')
  .put(addInteraction);

// Link contact to job
router.route('/:id/jobs/:jobId')
  .put(linkContactToJob);

module.exports = router; 