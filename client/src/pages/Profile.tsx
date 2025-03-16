import React from 'react';

const Profile = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500 mb-4">
          Profile management functionality will be implemented here.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p>User profile information form will be displayed here.</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Change Password</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p>Password change form will be displayed here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 