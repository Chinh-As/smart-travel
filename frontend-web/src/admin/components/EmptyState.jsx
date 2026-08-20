import React from 'react';

const EmptyState = ({ icon = 'inbox', message = 'Chưa có dữ liệu', subMessage }) => {
  return (
    <div className="admin-empty-state">
      <span className="material-symbols-outlined admin-empty-icon">{icon}</span>
      <p>{message}</p>
      {subMessage && <p className="admin-empty-submessage">{subMessage}</p>}
    </div>
  );
};

export default EmptyState;
