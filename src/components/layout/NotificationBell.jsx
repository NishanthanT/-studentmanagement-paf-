import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const lastUnreadCount = useRef(0);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();

    const getDynamicColor = (msg) => {
        const message = msg.toLowerCase();
        if (message.includes('rejected')) return 'border-rose-500/50 bg-rose-50/20';
        if (message.includes('approved') || message.includes('resolved')) return 'border-emerald-500/50 bg-emerald-50/20';
        return 'border-blue-500/50 bg-blue-50/20';
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            
            // If new notification detected, trigger toast
            if (count > lastUnreadCount.current) {
                const latestData = await notificationService.getNotifications();
                if (latestData.length > 0) {
                    const latest = latestData[0];
                    const type = getNotifType(latest.message);
                    const link = getNotifLink(latest.message);
                    showToast(latest.message, type, link);
                }
            }
            
            setUnreadCount(count);
            lastUnreadCount.current = count;
        } catch (err) {
            console.error('Failed to fetch unread count');
        }
    };

    const getNotifType = (msg) => {
        const message = msg.toLowerCase();
        if (message.includes('rejected') || message.includes('failed') || message.includes('urgent')) return 'error';
        if (message.includes('approved') || message.includes('success') || message.includes('resolved')) return 'success';
        return 'info';
    };

    const getNotifLink = (msg) => {
        const message = msg.toLowerCase();
        if (message.includes('ticket')) {
            return user?.role === 'ADMIN' ? '/admin/tickets' : '/tickets/my';
        }
        if (message.includes('booking') || message.includes('resource')) {
            return user?.role === 'ADMIN' ? '/admin/bookings' : '/bookings/my';
        }
        return '/notifications';
    };

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.slice(0, 5)); // Only show last 5 in dropdown
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // 30 sec poll
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            fetchUnreadCount();
            fetchNotifications();
        } catch (err) {
            console.error('Mark as read failed');
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-card shadow-2xl border-white/20 z-50 overflow-hidden animate-fade-in origin-top-right">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Notifications</span>
                        {unreadCount > 0 && (
                            <button 
                                onClick={async () => { await notificationService.clearAll(); fetchUnreadCount(); fetchNotifications(); }}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-sm font-medium">
                                No new notifications.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id}
                                    onClick={() => {
                                        if (!notif.isRead) handleMarkAsRead(notif.id, { stopPropagation: () => {} });
                                        navigate(getNotifLink(notif.message));
                                        setIsOpen(false);
                                    }}
                                    className={`p-4 border-b border-gray-50 dark:border-white/5 last:border-0 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-white/5 ${notif.isRead ? 'opacity-60' : `border-l-4 ${getDynamicColor(notif.message)}`}`}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-1">
                                            <p className={`text-xs ${notif.isRead ? 'font-medium text-gray-500' : 'font-bold text-gray-900 dark:text-white'}`}>
                                                {notif.message}
                                            </p>
                                            <span className="text-[10px] text-gray-400 font-bold block">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shadow-glow shadow-blue-500/50 animate-pulse"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button 
                        onClick={handleViewAll}
                        className="w-full p-3 text-center text-[10px] font-black text-gray-500 hover:text-blue-500 uppercase tracking-widest bg-gray-50/50 dark:bg-white/5 hover:bg-white transition-all border-t border-gray-100 dark:border-white/5"
                    >
                        View All
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
