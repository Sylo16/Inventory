import React from 'react';

interface Props {
  rows?: number;
}

const SkeletonLoader: React.FC<Props> = ({ rows = 3 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="animate-pulse p-3 rounded-lg bg-gray-50 border-l-4 border-gray-200">
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
