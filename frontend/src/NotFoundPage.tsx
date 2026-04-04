import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-white">404</h1>
          <p className="text-2xl text-slate-300">Page Not Found</p>
        </div>
        
        <p className="text-slate-400 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
