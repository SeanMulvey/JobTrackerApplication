import React from 'react';

interface TestProps {
  message: string;
}

const TestComponent: React.FC<TestProps> = ({ message }) => {
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default TestComponent; 