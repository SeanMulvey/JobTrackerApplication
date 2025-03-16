# Job Tracker Application

A comprehensive web application for tracking job applications, managing professional contacts, setting reminders, and comparing job offers.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Overview

The Job Tracker Application is designed to help job seekers organize and streamline their job search process. It provides tools for tracking job applications, managing professional contacts, setting reminders for important dates, and comparing job offers based on salary and benefits.

## Features

- **User Authentication**:
  - User registration and login
  - Password reset functionality
  - Profile management

- **Job Application Management**:
  - Create, view, update, and delete job applications
  - Track application status (Applied, Interview, Offer, Rejected)
  - Search and filter job applications

- **Contact Management**:
  - Store professional contacts
  - Associate contacts with job applications
  - Track communication history

- **Reminder System**:
  - Set reminders for important dates and tasks
  - Link reminders to job applications
  - Receive notifications for upcoming events

- **Job Value Comparison**:
  - Compare multiple job offers
  - Calculate total compensation including benefits
  - Make informed decisions about job offers

## Tech Stack

### Frontend
- **React**: UI library
- **TypeScript**: Type checking and improved developer experience
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **React-Toastify**: Notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **Bcrypt**: Password hashing

## Project Structure

```
job-tracker-application/
├── client/                # Frontend React application
│   ├── public/            # Static assets
│   │   ├── src/               # React source code
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── contexts/      # React context providers
│   │   │   ├── layouts/       # Layout components
│   │   │   ├── pages/         # Page components
│   │   │   │   ├── auth/      # Authentication pages
│   │   │   │   ├── jobs/      # Job management pages
│   │   │   │   ├── contacts/  # Contact management pages
│   │   │   │   └── reminders/ # Reminder management pages
│   │   │   │   ├── App.tsx        # Main application component
│   │   │   │   └── main.tsx       # Entry point
│   │   │   └── index.css      # Global styles
│   │   ├── package.json       # Frontend dependencies
│   │   └── vite.config.js     # Vite configuration
│   ├── server/                # Backend Node.js/Express API
│   │   ├── src/               # API source code
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── models/        # Database models
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Custom middleware
│   │   │   ├── utils/         # Utility functions
│   │   │   └── index.js       # Entry point
│   │   ├── .env               # Environment variables
│   │   └── package.json       # Backend dependencies
│   ├── docs/                  # Documentation
│   │   ├── SRS.md             # Software Requirements Specification
│   │   ├── Architecture.md    # Architecture documentation
│   │   ├── UserGuide.md       # User guide
│   │   └── DebuggingGuide.md  # Debugging guide
│   └── README.md              # Project overview
```

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB

### Client Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/job-tracker-application.git
cd job-tracker-application

# Install frontend dependencies
cd client
npm install

# Add required environment variables
cp .env.example .env
# Edit .env file with your configuration
```

### Server Installation
```bash
# From the project root
cd server
npm install

# Add required environment variables
cp .env.example .env
# Edit .env file with your configuration
```

#### Environment Variables

**Client (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

**Server (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

## Running the Application

### Development Mode

**Client**
```bash
cd client
npm run dev
```

**Server**
```bash
cd server
npm run dev
```

### Production Build

**Client**
```bash
cd client
npm run build
```

**Server**
```bash
cd server
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Change password

### Job Endpoints

- `GET /api/jobs` - Get all jobs for current user
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Contact Endpoints

- `GET /api/contacts` - Get all contacts for current user
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Reminder Endpoints

- `GET /api/reminders` - Get all reminders for current user
- `GET /api/reminders/:id` - Get reminder by ID
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## Troubleshooting

See [DebuggingGuide.md](docs/DebuggingGuide.md) for detailed troubleshooting steps and common issues.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request 