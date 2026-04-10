import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticket.service';

const Dashboard = () => {
  const { user } = useAuth();
  const [techStats, setTechStats] = useState(null);
  const [showTechStats, setShowTechStats] = useState(false);

  useEffect(() => {
    if (user?.role === 'TECHNICIAN') {
      ticketService.getTechnicianStats()
        .then(data => setTechStats(data))
        .catch(err => console.error("Error fetching stats:", err));
    }
  }, [user]);

  let modules = [
    { name: 'Users', role: ['ADMIN'], path: user?.role === 'ADMIN' ? '/admin/users' : '/profile', active: 'Manage Users' },
    { name: 'Resources', role: ['ADMIN', 'USER'], path: user?.role === 'ADMIN' ? '/admin/resources' : '/resources', active: 'Manage Resources' },
    { name: 'Bookings', role: ['ADMIN', 'USER'], path: user?.role === 'ADMIN' ? '/admin/bookings' : '/bookings/my', active: 'Manage Bookings' },
    { name: 'Tickets', role: ['ADMIN', 'USER', 'TECHNICIAN'], path: user?.role === 'ADMIN' ? '/admin/tickets' : user?.role === 'TECHNICIAN' ? '/technician/tickets' : '/tickets/my', active: 'Manage Tickets' },
    { name: 'Ticket Analysis', role: ['TECHNICIAN'], path: '#', active: 'View Stats', onClick: () => setShowTechStats(!showTechStats) },
    { name: 'My Profile', role: ['ADMIN', 'USER', 'TECHNICIAN'], path: '/profile', active: 'Your Details' }
  ].filter(m => m.role.includes(user?.role));

  if (user?.role === 'ADMIN') {
    modules.unshift({ name: 'Analytics', path: '/admin/dashboard', active: 'Overview' });
    modules.push({ name: 'System Logs', path: '/admin/logs', active: 'View Logs' });
  }

  return (
    <div className="space-y-10 animate-fade-in text-gray-900 dark:text-gray-100 pb-10 relative">
      {/* Page Ambient Background Orbs */}
      <div className="absolute top-10 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none -z-10"></div>
      <div className="absolute top-[40%] right-0 w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-glow [animation-delay:4s] pointer-events-none -z-10"></div>

      {/* Overview Card */}
      <div className="glass-card p-8 relative overflow-hidden group">
        {/* Animated Background Blots */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-400/5 rounded-full -mr-32 -mt-32 blur-[100px] animate-pulse-glow pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full -ml-24 -mb-24 blur-[80px] animate-pulse-glow [animation-delay:2s] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Dashboard Overview</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                Welcome back, <span className="font-bold text-blue-600 dark:text-blue-400">{user?.fullName || 'User'}</span>!
                {user?.role === 'ADMIN'
                   ? ' Manage resources, track users, and handle tickets with ease.'
                   : user?.role === 'TECHNICIAN'
                     ? ' Manage and resolve campus maintenance tickets efficiently.'
                     : ' Book campus resources and manage your maintenance tickets.'}
              </p>
            </div>
            {user?.role === 'TECHNICIAN' && (
              <button
                onClick={() => setShowTechStats(!showTechStats)}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-sm flex items-center gap-2 ${showTechStats
                    ? 'bg-blue-600 text-white shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v10" /></svg>
                {showTechStats ? 'Hide Analysis' : 'Show Analysis'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Technician Stats Section */}
      {user?.role === 'TECHNICIAN' && techStats && showTechStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
          <div className="glass-card p-6 border-l-4 border-amber-500 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Pending Tickets</p>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white">{techStats.pendingCount}</h4>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 border-l-4 border-blue-500 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">In Progress</p>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white">{techStats.inProgressCount}</h4>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 border-l-4 border-emerald-500 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Completed</p>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white">{techStats.completedCount}</h4>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 border-l-4 border-indigo-500 shadow-sm transition-all hover:shadow-md bg-indigo-50/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Total Assigned</p>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white">{techStats.totalAssigned}</h4>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {modules.map((module, index) => {
          const content = (
            <>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-500/50">
                {module.name === 'Users' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                {module.name === 'Resources' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 002 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                {module.name === 'Bookings' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                {module.name === 'Maintenance' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" /></svg>}
                {module.name === 'Tickets' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" /></svg>}
                {module.name === 'Ticket Analysis' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v10" /></svg>}
                {module.name === 'Notifications' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                {module.name === 'System Logs' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                {module.name === 'My Profile' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                {module.name === 'Analytics' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v10" /></svg>}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors z-10 mb-2">{module.name}</h3>
              <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all z-10 border ${module.active === 'Manage Users' || module.active === 'Your Details' || module.active === 'View Stats'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                }`}>
                {module.active}
              </span>
            </>
          );

          if (module.onClick) {
            return (
              <button
                key={index}
                onClick={module.onClick}
                className="glass-card interactive-box p-7 flex flex-col items-center justify-center text-center group relative overflow-hidden glow-on-hover h-full min-h-[180px] w-full"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={index}
              to={module.path}
              className="glass-card interactive-box p-7 flex flex-col items-center justify-center text-center group relative overflow-hidden glow-on-hover h-full min-h-[180px]"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

