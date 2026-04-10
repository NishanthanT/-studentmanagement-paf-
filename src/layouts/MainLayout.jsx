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
    <div className="h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Modern SaaS Header */}
      <header className="flex-none z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-500">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-all">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight font-display">
                Smart<span className="text-blue-600 italic">Campus</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 leading-none">
                Operations Intel
              </span>
            </div>
          </div>
          
          {/* Action Hub */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-6">
              <NotificationBell />
              <button 
                onClick={toggleDarkMode}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user?.fullName || 'Operator'}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role || 'Staff'}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-950/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Viewport Content */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-[1440px] mx-auto p-6 md:p-10 relative">
          <Outlet />
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="flex-none py-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div>&copy; {new Date().getFullYear()} Campus Intel Hub</div>
          <div className="flex gap-4">
            <span className="hover:text-blue-600 cursor-pointer">Security</span>
            <span className="hover:text-blue-600 cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
