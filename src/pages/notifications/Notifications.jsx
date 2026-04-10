import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';

const StatusIcon = ({ type }) => {
    switch (type) {
        case 'BOOKING_APPROVED': return <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>;
        case 'BOOKING_REJECTED': return <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div>;
        case 'TICKET_ASSIGNED': return <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>;
        default: return <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    }
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'ALL') return true;
        if (filter === 'TICKETS') return notif.type.includes('TICKET');
        if (filter === 'BOOKINGS') return notif.type.includes('BOOKING') || notif.type.includes('RESOURCE');
        return true;
    });

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (err) {
            console.error('Action failed');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.clearAll();
            fetchNotifications();
        } catch (err) {
            console.error('Action failed');
        }
    };

    const handleActionClick = (notif) => {
        if (!notif.isRead) handleMarkAsRead(notif.id);
        
        if (notif.type.startsWith('BOOKING')) {
            navigate('/profile'); // Bookings are currently viewed in profile/my bookings logic
        } else if (notif.type.startsWith('TICKET')) {
            navigate(`/tickets/${notif.targetId}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Notifications</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">View all your recent notifications.</p>
                </div>
                <button 
                    onClick={handleMarkAllRead}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-950 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    Clear All
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 px-4">
                {[
                    { id: 'ALL', label: 'All Activity' },
                    { id: 'TICKETS', label: 'Tickets' },
                    { id: 'BOOKINGS', label: 'Bookings' }
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setFilter(item.id)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                            filter === item.id 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30 -translate-y-1' 
                            : 'bg-white/50 dark:bg-gray-800/50 text-gray-500 border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-gray-700'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-400 font-bold animate-pulse uppercase tracking-[0.2em]">Loading notifications...</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-20 text-center text-gray-400 font-bold italic">No notifications for this category.</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredNotifications.map((notif) => (
                            <div 
                                key={notif.id}
                                className={`p-6 flex items-start gap-6 transition-all hover:bg-gray-50/50 dark:hover:bg-white/5 group relative ${notif.isRead ? 'opacity-60' : ''}`}
                            >
                                {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 shadow-glow shadow-blue-500/50"></div>}
                                
                                <StatusIcon type={notif.type} />

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">{notif.type.replace(/_/g, ' ')}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-500 font-medium' : 'text-gray-900 dark:text-white font-bold'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="flex gap-4 pt-2">
                                        <button 
                                            onClick={() => handleActionClick(notif)}
                                            className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-1"
                                        >
                                            View Item <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </button>
                                        {!notif.isRead && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                                                className="text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors p-1"
                                            >
                                                Dismiss
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
