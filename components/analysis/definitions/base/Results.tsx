import React from 'react';

interface BaseResultsProps {
  data?: any;
  loading?: boolean;
}

export const BaseResults: React.FC<BaseResultsProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="base-results loading">Loading results...</div>;
  }
  
  if (!data) {
    return <div className="base-results empty">No results available</div>;
  }
  
  return (
    <div className="base-results">
      <h3>Analysis Results</h3>
      <p>This is the base results component. Override this for specific analysis types.</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};