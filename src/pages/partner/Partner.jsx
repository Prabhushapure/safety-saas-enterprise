import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Partner = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to partner login page
    navigate('/partner/login');
  }, [navigate]);

  return null;
};

export default Partner;
