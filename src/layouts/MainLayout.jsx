import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/layout/NotificationBell';

const MainLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
      return isDark;
    }
    return false;
  });

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col relative overflow-hidden">
      {/* Global Background Animated Orbs for ALL Pages */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow -z-10" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none animate-spin-slow -z-10"></div>

      {/* Professional Gradient Header */}
      <header className="flex-none z-50 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 border-b border-indigo-400/30 shadow-lg transition-all duration-500">
        {/* Subtle Brand Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center relative z-10">
          
          {/* Logo & Professional Typography */}
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300 ring-1 ring-white/20">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[1.35rem] font-extrabold tracking-tight text-white leading-tight" style={{ fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif' }}>
                Smart Campus
              </h1>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-200 leading-none opacity-90">
                Operations Hub
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <NotificationBell />
            <div className="h-6 w-px bg-white/20"></div>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 text-white transition-all focus:outline-none ring-1 ring-white/20 shadow-sm"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                // Sun Icon for Dark Mode
                <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.415l-.708-.707a1 1 0 010-1.415zM15 10a1 1 0 110 2h-1a1 1 0 110-2h1zm-4.22 4.22a1 1 0 010 1.415l-.707.708a1 1 0 01-1.415-1.414l.707-.708a1 1 0 011.415 0zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.707a1 1 0 011.414-1.415l.708.707a1 1 0 010 1.415zM4 10a1 1 0 110-2H3a1 1 0 110 2h1zm4.22-4.22a1 1 0 010-1.415l.707-.708a1 1 0 011.415 1.414l-.707.708a1 1 0 01-1.415 0zM10 6a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>
              ) : (
                // Moon Icon for Light Mode
                <svg className="w-4 h-4 text-blue-100" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
            
            <div className="h-6 w-px bg-white/20"></div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end text-white">
                  <span className="text-sm font-bold leading-none">{user?.fullName || 'System User'}</span>
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1.5">{user?.role || 'Guest'}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="group relative px-4 py-2 bg-white/10 hover:bg-red-500 transition-colors duration-300 rounded-lg flex items-center gap-2 overflow-hidden shadow-sm hover:shadow-md border border-white/20"
              >
                <span className="text-sm font-semibold text-white">Logout</span>
                <svg className="w-3.5 h-3.5 text-white/70 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Border Animation Box */}
      <main className="flex-1 overflow-y-auto w-full relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="absolute inset-x-4 inset-y-8 sm:inset-x-6 lg:inset-x-8 lg:inset-y-8 border-2 border-transparent bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-[32px] pointer-events-none -z-10 bg-[length:200%_200%] animate-bgTransfer"></div>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
