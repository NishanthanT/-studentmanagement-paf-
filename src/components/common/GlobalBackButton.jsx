import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GlobalBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the back button on auth pages where it might interrupt the flow
  const hiddenPaths = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/otp-verification', 
    '/reset-password',
    '/' // Dashboard home
  ];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-24 left-8 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-300"
      aria-label="Go Back"
      title="Go Back"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
};

export default GlobalBackButton;
