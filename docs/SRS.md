# Job Tracker Application - Software Requirements Specification

## 1. Introduction

### 1.1 Purpose
This document outlines the software requirements for the Job Tracker Application, a web-based tool designed to help job seekers organize and track their job application process. It serves as the primary reference for functional and non-functional requirements.

### 1.2 Scope
The Job Tracker Application will provide a comprehensive system for users to track job applications, manage professional contacts, set reminders for important dates, and compare job offers based on salary and benefits. The application includes user authentication, data management, and analytics features.

### 1.3 Definitions, Acronyms, and Abbreviations
- **SPA**: Single Page Application
- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete

## 2. Overall Description

### 2.1 Product Perspective
The Job Tracker Application is a standalone web application with a React frontend and a Node.js backend. It utilizes a database to store user data and provides a RESTful API for data manipulation.

### 2.2 Product Features
- User authentication and account management
- Job application tracking with status updates
- Contact management for networking
- Reminder system for important dates and tasks
- Job value comparison calculator
- User profile management

### 2.3 User Classes and Characteristics
- **Job Seekers**: Primary users who need to track job applications
- **Career Counselors**: May use the system to help clients organize job searches
- **Recruiters**: Could potentially use the system to track candidate progress

### 2.4 Operating Environment
- Web browsers: Chrome, Firefox, Safari, Edge (latest versions)
- Devices: Desktop, tablet, and mobile devices
- Backend: Node.js server with database storage
- Frontend: React application

### 2.5 Design and Implementation Constraints
- Responsive design for different device sizes
- Secure authentication using JWT
- RESTful API architecture
- Modern JavaScript frameworks (React)
- Tailwind CSS for styling

### 2.6 User Documentation
- User guide for application functionality
- FAQ section for common questions
- Tooltips and guidance within the application

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
- **Landing Page**: Introduction and sign-up/login options
- **Dashboard**: Overview of job application status and upcoming reminders
- **Jobs Page**: List and management of job applications
- **Contacts Page**: List and management of professional contacts
- **Reminders Page**: List and management of reminders
- **Job Value Comparison Page**: Tool to compare job offers
- **Profile Page**: User profile management
- **Authentication Pages**: Login, Registration, Password Reset

#### 3.1.2 Hardware Interfaces
Not applicable - web-based application accessible from any device with a browser.

#### 3.1.3 Software Interfaces
- RESTful API for data exchange between frontend and backend
- Database system for data persistence
- Authentication service for user management

### 3.2 Functional Requirements

#### 3.2.1 User Authentication
- FR-1.1: Users shall be able to register with email and password
- FR-1.2: Users shall be able to log in with email and password
- FR-1.3: Users shall be able to request a password reset via email
- FR-1.4: Users shall be able to update their profile information
- FR-1.5: Users shall be able to change their password

#### 3.2.2 Job Application Management
- FR-2.1: Users shall be able to add new job applications
- FR-2.2: Users shall be able to view a list of their job applications
- FR-2.3: Users shall be able to update the status of job applications
- FR-2.4: Users shall be able to delete job applications
- FR-2.5: Users shall be able to search and filter job applications

#### 3.2.3 Contact Management
- FR-3.1: Users shall be able to add professional contacts
- FR-3.2: Users shall be able to view a list of their contacts
- FR-3.3: Users shall be able to update contact information
- FR-3.4: Users shall be able to delete contacts
- FR-3.5: Users shall be able to link contacts to job applications

#### 3.2.4 Reminder System
- FR-4.1: Users shall be able to create reminders for important dates
- FR-4.2: Users shall be able to view upcoming reminders
- FR-4.3: Users shall be able to update reminders
- FR-4.4: Users shall be able to delete reminders
- FR-4.5: Users shall be able to link reminders to job applications

#### 3.2.5 Job Value Comparison
- FR-5.1: Users shall be able to enter job offer details
- FR-5.2: Users shall be able to compare multiple job offers
- FR-5.3: The system shall calculate the total value of each offer
- FR-5.4: Users shall be able to add or remove benefits from comparison

### 3.3 Non-Functional Requirements

#### 3.3.1 Performance
- NFR-1.1: Page load time shall be less than 2 seconds
- NFR-1.2: API response time shall be less than 1 second
- NFR-1.3: The system shall support at least 100 concurrent users

#### 3.3.2 Security
- NFR-2.1: User passwords shall be securely hashed
- NFR-2.2: JWT tokens shall expire after 24 hours
- NFR-2.3: API endpoints shall require authentication
- NFR-2.4: Input validation shall be performed on all form submissions

#### 3.3.3 Usability
- NFR-3.1: The interface shall be responsive for different screen sizes
- NFR-3.2: The application shall provide feedback for user actions
- NFR-3.3: The application shall include form validation with clear error messages

#### 3.3.4 Reliability
- NFR-4.1: The system shall have a 99.9% uptime
- NFR-4.2: The system shall backup data daily

## 4. Traceability Matrix

| Requirement ID | Description | Component | Status |
|----------------|-------------|-----------|--------|
| FR-1.1 | User registration | Register.tsx | Implemented |
| FR-1.2 | User login | Login.tsx | Implemented |
| FR-1.3 | Password reset | ForgotPassword.tsx, ResetPassword.tsx | Implemented |
| FR-1.4 | Update profile | Profile.tsx | Implemented |
| FR-1.5 | Change password | Profile.tsx | Implemented |
| FR-2.1 | Add job applications | AddJob.tsx | Implemented |
| FR-2.2 | View job applications | Jobs.tsx | Implemented |
| FR-2.3 | Update job status | EditJob.tsx | Implemented |
| FR-2.4 | Delete job applications | Jobs.tsx | Implemented |
| FR-2.5 | Search jobs | Jobs.tsx | Implemented |
| FR-3.1 | Add contacts | AddContact.tsx | Implemented |
| FR-3.2 | View contacts | Contacts.tsx | Implemented |
| FR-3.3 | Update contacts | EditContact.tsx | Implemented |
| FR-3.4 | Delete contacts | Contacts.tsx | Implemented |
| FR-3.5 | Link contacts to jobs | AddJob.tsx, EditJob.tsx | Implemented |
| FR-4.1 | Create reminders | AddReminder.tsx | Implemented |
| FR-4.2 | View reminders | Reminders.tsx | Implemented |
| FR-4.3 | Update reminders | EditReminder.tsx | Implemented |
| FR-4.4 | Delete reminders | Reminders.tsx | Implemented |
| FR-4.5 | Link reminders to jobs | AddReminder.tsx | Implemented |
| FR-5.1 | Enter job offer details | JobValueComparison.tsx | Implemented |
| FR-5.2 | Compare job offers | JobValueComparison.tsx | Implemented |
| FR-5.3 | Calculate total value | JobValueComparison.tsx | Implemented |
| FR-5.4 | Add/remove benefits | JobValueComparison.tsx | Implemented |

## 5. Appendices

### 5.1 Assumptions and Dependencies
- Users have access to modern web browsers
- Backend server is operational and accessible
- Email service is available for password reset functionality

### 5.2 Technical Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT-based authentication
- Hosting: To be determined 