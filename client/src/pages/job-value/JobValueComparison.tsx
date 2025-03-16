import React from 'react';
import JobMarketComparison from '../../components/JobMarketComparison';

const JobValueComparison = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Job Value Comparison</h1>
        <p className="mt-1 text-sm text-gray-500">
          Compare job offers to make the best decision for your career
        </p>
      </div>
      
      <JobMarketComparison />
    </div>
  );
};

export default JobValueComparison; 