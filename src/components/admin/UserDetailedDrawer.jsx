import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';

const UserDetailedDrawer = ({ isOpen, onClose, userId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails();
    } else {
      setDetails(null);
      setActiveTab('timeline');
    }
  }, [isOpen, userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserDetails(userId);
      setDetails(data);
    } catch (err) {
      console.error("Failed to load user details", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 sm:px-6 transition-all animate-fade-in"
        onClick={onClose}
      >
        
        {/* Modal Panel (stops propagation to prevent closing when clicking inside) */}
        <div 
          className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0B0D17] shadow-2xl z-[160] rounded-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-white/10 animate-fade-in relative"
          onClick={(e) => e.stopPropagation()}
        >
        
        {/* Header & Loading */}
        <div className="p-6 sm:p-8 shrink-0 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-[#111424] dark:to-[#0B0D17] border-b border-gray-100 dark:border-white/5">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          {loading ? (
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-white/10"></div>
              <div className="space-y-3 flex-1">
                <div className="h-6 w-1/2 bg-gray-200 dark:bg-white/10 rounded"></div>
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-white/10 rounded"></div>
              </div>
            </div>
          ) : details && details.profile ? (
            <div className="flex items-start space-x-5">
              <div className="flex-shrink-0 h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-500/30 border border-blue-400/50">
                {details.profile.profileImage ? (
                  <img src={details.profile.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  details.profile.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate tracking-tight">{details.profile.fullName}</h2>
                <div className="flex flex-col gap-1 mt-1.5">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        {details.profile.email}
                    </p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        {details.profile.phoneNumber || 'Not provided'}
                    </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">{details.profile.role}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${details.profile.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>{details.profile.status}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111424]">
            {[
                { id: 'timeline', label: 'Timeline' },
                { id: 'tickets', label: 'Tickets' },
                { id: 'bookings', label: 'Bookings' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0B0D17]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/5'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 content-scrollbar">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>)}
            </div>
          ) : details && (
            <div className="animate-fade-in">
                
              {/* TIMELINE TAB */}
              {activeTab === 'timeline' && (
                <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                  {details.activityLogs?.length > 0 ? details.activityLogs.map((log) => (
                    <div key={log.id} className="relative flex items-start justify-between group">
                      <div className="absolute left-[-4px] md:left-1/2 md:-ml-[5px] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#0B0D17] group-hover:scale-125 transition-transform duration-300"></div>
                      </div>
                      <div className="w-full pl-8 md:pl-0 md:w-[45%] md:odd:pr-8 md:even:pl-8 md:odd:text-right md:even:ml-auto">
                        <div className="glass-card p-4 hover:shadow-md transition-shadow group-hover:border-blue-500/30">
                          <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">{new Date(log.timestamp).toLocaleString()}</span>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{log.action}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{log.details}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-sm font-medium text-gray-500">No recent activity found.</div>
                  )}
                </div>
              )}

              {/* TICKETS TAB */}
              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  {details.recentTickets?.length > 0 ? details.recentTickets.map(ticket => (
                    <div key={ticket.id} className="glass-card p-5 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider">#{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{ticket.status}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{ticket.category}</h4>
                      <p className="text-xs text-red-500 font-bold mt-2">Priority: {ticket.priority}</p>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-sm font-medium text-gray-500 bg-gray-50 dark:bg-white/5 rounded-2xl">No support tickets generated by this user.</div>
                  )}
                </div>
              )}

              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {details.recentBookings?.length > 0 ? details.recentBookings.map(booking => (
                    <div key={booking.id} className="glass-card p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow flex justify-between items-center">
                        <div className="overflow-hidden pr-4 text-left">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{booking.resourceName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{booking.date} • {booking.startTime} - {booking.endTime}</p>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full whitespace-nowrap">{booking.status}</span>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-sm font-medium text-gray-500 bg-gray-50 dark:bg-white/5 rounded-2xl">No resource bookings recorded for this user.</div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailedDrawer;
