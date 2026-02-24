import React from 'react';

interface StatusTagProps {
  isOnline: boolean;
}

const StatusTag: React.FC<StatusTagProps> = ({ isOnline }) => {
  const baseStyle: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    color: '#fff',
    textTransform: 'uppercase',
  };

  const onlineStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: '#28a745', // Verde
  };

  const offlineStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: '#dc3545', // Vermelho
  };

  return (
    <span style={isOnline ? onlineStyle : offlineStyle}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
};

export default StatusTag;
