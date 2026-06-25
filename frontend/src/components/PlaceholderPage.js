import React from 'react';

const placeholderComponent = (name) => {
  const Component = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{name}</h1>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-blue-700">This feature is currently being developed. Check back soon!</p>
      </div>
    </div>
  );
  return Component;
};

export default placeholderComponent;
