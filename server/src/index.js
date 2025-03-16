require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { initReminderNotifications } = require('./utils/reminderNotificationService');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const contactRoutes = require('./routes/contacts');
const reminderRoutes = require('./routes/reminders');
const analyticsRoutes = require('./routes/analytics');
const jobValueRoutes = require('./routes/jobValue');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI ? 'URI exists' : 'URI is missing');
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB connected');
    
    // Initialize reminder notifications service after database is connected
    if (process.env.ENABLE_EMAIL_REMINDERS === 'true') {
      initReminderNotifications();
    } else {
      console.log('Email reminders are disabled. Set ENABLE_EMAIL_REMINDERS=true to enable.');
    }
  })
  .catch((err) => {
    console.log('MongoDB connection error details:');
    console.log('Error name:', err.name);
    console.log('Error message:', err.message);
    console.log('Full error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/job-value', jobValueRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client', 'dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
}); 