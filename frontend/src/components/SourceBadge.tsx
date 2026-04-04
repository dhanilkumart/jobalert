import React from 'react';

interface SourceBadgeProps {
  source: 'linkedin' | 'naukri' | 'shine' | 'indeed';
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const colors = {
    linkedin: '#0077b5',
    naukri: '#ff4b2b',
    shine: '#00c3ff',
    indeed: '#2164f3',
  };

  return (
    <span 
      className="source-badge"
      style={{ 
        backgroundColor: colors[source] + '22',
        color: colors[source],
        border: `1px solid ${colors[source]}44`
      }}
    >
      {source.charAt(0).toUpperCase() + source.slice(1)}
    </span>
  );
};

export default SourceBadge;
