# Job Tracker Application - Debugging Guide

This guide provides troubleshooting steps for common issues that may arise during development, testing, and deployment of the Job Tracker Application.

## Table of Contents

1. [Frontend Issues](#frontend-issues)
2. [Backend Issues](#backend-issues)
3. [Authentication Issues](#authentication-issues)
4. [API Connection Issues](#api-connection-issues)
5. [Database Issues](#database-issues)
6. [Deployment Issues](#deployment-issues)

## Frontend Issues

### React Component Rendering Problems

#### Blank or Missing Components

**Symptoms**:
- Component doesn't render
- White screen appears instead of expected content

**Debugging Steps**:
1. Check browser console for error messages
2. Verify the component is correctly imported and exported
3. Check route configuration in App.tsx
4. Ensure the component is returning valid JSX

**Common Fixes**:
```typescript
// Example of properly imported component
import Dashboard from './pages/Dashboard';

// Example of proper component export
const Dashboard = () => {
  // Component code
};

export default Dashboard;
```

#### TypeScript Errors

**Symptoms**:
- Red squiggly lines in code editor
- Build failures with type errors

**Debugging Steps**:
1. Read the error message carefully to understand the type issue
2. Check component props for correct types
3. Verify interfaces and types are correctly defined

**Common Fixes**:
```typescript
// Define proper interfaces for props
interface JobProps {
  id: string;
  title: string;
  company: string;
}

// Use the interface in component
const JobItem: React.FC<JobProps> = ({ id, title, company }) => {
  // Component code
};
```

### Styling Issues

**Symptoms**:
- Unstyled components
- Misaligned content
- Incorrect colors or sizes

**Debugging Steps**:
1. Check if Tailwind CSS is properly installed and imported
2. Verify class names are correctly applied
3. Use browser developer tools to inspect element styles

**Common Fixes**:
- Check if tailwind.config.js is properly configured
- Ensure global CSS file is imported in the main entry file

### State Management Issues

**Symptoms**:
- Data not updating on user actions
- Stale data displayed
- Components not re-rendering

**Debugging Steps**:
1. Add console.log statements to track state changes
2. Verify state update functions are being called
3. Check useEffect dependencies

**Common Fixes**:
```typescript
// Add proper dependencies to useEffect
useEffect(() => {
  // Effect code
  console.log('searchTerm changed:', searchTerm);
  fetchData();
}, [searchTerm]); // Include all dependencies

// Correctly update state
setJobs([...jobs, newJob]); // Instead of modifying the array directly
```

## Backend Issues

### Server Startup Problems

**Symptoms**:
- Server fails to start
- Error messages in console

**Debugging Steps**:
1. Check console for error messages
2. Verify environment variables are set
3. Check port availability

**Common Fixes**:
- Ensure required environment variables are defined in .env file
- Kill any process using the same port (e.g., `lsof -i :5000`)

### Route Handling Issues

**Symptoms**:
- 404 Not Found errors
- API endpoints not responding

**Debugging Steps**:
1. Check route definitions in server
2. Verify HTTP method is correct (GET, POST, PUT, DELETE)
3. Test endpoint with Postman or curl

**Common Fixes**:
```javascript
// Ensure routes are properly defined
app.use('/api/jobs', jobRoutes);
app.use('/api/contacts', contactRoutes);
```

## Authentication Issues

### Registration Failures

**Symptoms**:
- Registration form submission fails
- No error message or unexpected error

**Debugging Steps**:
1. Check browser console for network requests
2. Verify registration API endpoint is configured correctly
3. Check request payload format
4. Review backend logs for validation errors

**Common Fixes**:
- Ensure password meets minimum requirements
- Check for duplicate email validation
- Verify CORS settings allow the request

### Login Issues

**Symptoms**:
- Unable to log in
- Credentials not accepted

**Debugging Steps**:
1. Verify email and password submitted are correct
2. Check browser console for network requests and response
3. Look for validation or authentication errors in backend logs

**Common Fixes**:
- Reset credentials if forgotten
- Check password hashing implementation
- Verify token generation and storage

### Token-Related Issues

**Symptoms**:
- Authentication state lost after refresh
- "Unauthorized" errors when accessing protected routes

**Debugging Steps**:
1. Check if token is being stored in localStorage
2. Verify token is included in request headers
3. Check token expiration

**Common Fixes**:
```typescript
// Correctly set token in axios headers
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Ensure token is saved to localStorage
localStorage.setItem('token', token);
```

## API Connection Issues

### Failed API Requests

**Symptoms**:
- Network errors in console
- "Failed to fetch" errors
- Timeout errors

**Debugging Steps**:
1. Check if backend server is running
2. Verify API endpoint URLs are correct
3. Check network tab in browser dev tools
4. Test API endpoints with Postman or curl

**Common Fixes**:
- Update API base URL to match server location
- Check for CORS issues
- Verify network connectivity

### CORS Issues

**Symptoms**:
- Cross-Origin Request Blocked errors in console
- API requests fail despite server running

**Debugging Steps**:
1. Check browser console for CORS error messages
2. Verify CORS middleware is configured on the backend
3. Check origin settings in backend CORS configuration

**Common Fixes**:
```javascript
// Backend CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## Database Issues

### Connection Issues

**Symptoms**:
- Server fails to start with database connection errors
- API requests involving database operations fail

**Debugging Steps**:
1. Check database connection string
2. Verify database credentials
3. Test direct connection to database
4. Check database logs for errors

**Common Fixes**:
- Update connection string in .env file
- Restart database service if it's down
- Check network connectivity to database server

### Query Issues

**Symptoms**:
- Unexpected data returned or not returned
- Database operation errors

**Debugging Steps**:
1. Log query parameters and results
2. Test queries directly in database client
3. Check error messages for syntax or permission issues

**Common Fixes**:
```javascript
// Add error handling to database operations
try {
  const result = await Model.findById(id);
  console.log('Query result:', result);
} catch (err) {
  console.error('Database error:', err);
  throw new Error('Failed to fetch data');
}
```

## Deployment Issues

### Build Failures

**Symptoms**:
- Build process fails
- Error messages during build step

**Debugging Steps**:
1. Check build logs for error messages
2. Verify build configuration
3. Run build locally to reproduce the issue

**Common Fixes**:
- Fix TypeScript errors flagged during build
- Update dependencies to compatible versions
- Ensure all required files are included in the build

### Environment Configuration

**Symptoms**:
- Application works locally but fails in production
- Configuration-related errors in logs

**Debugging Steps**:
1. Check environment variables in production
2. Verify API endpoint URLs for production
3. Check for environment-specific code

**Common Fixes**:
- Set all required environment variables in production
- Update API URLs for production environment
- Use conditional logic for environment-specific behavior

## Common Error Messages and Solutions

### "Cannot find module"

**Cause**: Module is not installed or path is incorrect

**Solution**:
1. Install the missing package: `npm install <package-name>`
2. Check import path for typos
3. Restart development server

### "TypeError: Cannot read property 'X' of undefined"

**Cause**: Trying to access a property on an undefined object

**Solution**:
1. Use optional chaining: `object?.property`
2. Add null checks before accessing properties
3. Provide default values: `const value = object?.property || defaultValue`

### "Invalid token"

**Cause**: JWT token is expired, malformed, or tampered with

**Solution**:
1. Clear localStorage and have user log in again
2. Check token generation and verification logic
3. Verify token expiration settings

### "Network Error"

**Cause**: API server is unreachable or request failed

**Solution**:
1. Check if API server is running
2. Verify network connectivity
3. Check for CORS issues
4. Increase request timeout

## Debugging Tools

### Browser DevTools

- **Console**: View JavaScript errors and logs
- **Network**: Monitor API requests and responses
- **Application**: Inspect localStorage and sessionStorage
- **React DevTools**: Examine component hierarchy and state

### Backend Logging

- Use Winston or similar for structured logging
- Log different levels (info, warning, error)
- Include request details and timestamps

### API Testing

- Postman for testing API endpoints
- curl for command-line API testing
- Jest for automated API tests

## Debugging Methodology

1. **Identify the Issue**:
   - What is the expected behavior?
   - What is the actual behavior?
   - When and where does the issue occur?

2. **Reproduce the Issue**:
   - Create a minimal reproducible case
   - Document the steps to reproduce

3. **Isolate the Problem**:
   - Is it frontend or backend?
   - Is it a network issue?
   - Is it an authentication issue?

4. **Add Logging**:
   - Add console.log statements at key points
   - Check server logs for errors

5. **Test Solutions**:
   - Make one change at a time
   - Verify the issue is fixed
   - Run tests to ensure no regressions

6. **Document the Solution**:
   - Update documentation with the fix
   - Add comments to prevent future issues 