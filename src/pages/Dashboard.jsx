import React from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

function Dashboard() {
  const navigate = useNavigate();

  // For now, Dashboard just wraps Home component
  // In the future, this could be enhanced with additional dashboard features
  
  return (
    <div>
      <Home />
    </div>
  );
}

export default Dashboard;