import React from 'react';

interface EmptyStateIllustrationProps {
  message?: string;
}

const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({ message }) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">{message || 'No drafts found.'}</p>
    </div>
  );
};

export default EmptyStateIllustration; 