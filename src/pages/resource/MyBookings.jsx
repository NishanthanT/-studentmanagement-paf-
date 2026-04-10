import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 animate-fade-in">
            <div className="glass-card max-w-sm w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-5 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-all">No, Keep it</button>
                    <button onClick={onConfirm} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all">Yes, Cancel</button>
                </div>
            </div>
        </div>
    );
};

const EditModal = ({ isOpen, booking, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (booking) {
            setFormData({
                date: booking.date,
                startTime: booking.startTime.substring(0, 5),
                endTime: booking.endTime.substring(0, 5),
                purpose: booking.purpose,
                expectedAttendees: booking.expectedAttendees
            });
        }
    }, [booking]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const dataToSubmit = {
                ...formData,
                resourceId: booking.resourceId,
                startTime: formData.startTime.length === 5 ? formData.startTime + ':00' : formData.startTime,
                endTime: formData.endTime.length === 5 ? formData.endTime + ':00' : formData.endTime,
                expectedAttendees: Number(formData.expectedAttendees)
            };
            await bookingService.updateBooking(booking.id, dataToSubmit);
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 animate-fade-in">
            <div className="glass-card max-w-lg w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Edit Booking</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Update your reservation for {booking?.resourceName}.</p>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</label>
                            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="modern-input w-full text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attendees</label>
                            <input type="number" required value={formData.expectedAttendees} onChange={(e) => setFormData({...formData, expectedAttendees: e.target.value})} className="modern-input w-full text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                            <input type="time" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="modern-input w-full text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">End Time</label>
                            <input type="time" required value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="modern-input w-full text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Purpose</label>
                        <textarea required value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="modern-input w-full text-sm min-h-[80px]" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all">
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, bookingId: null });
    const [editModal, setEditModal] = useState({ isOpen: false, booking: null });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getMyBookings();
            setBookings(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch your bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (id) => {
        setConfirmModal({ isOpen: true, bookingId: id });
    };

    const confirmCancellation = async () => {
        try {
            await bookingService.cancelBooking(confirmModal.bookingId);
            setConfirmModal({ isOpen: false, bookingId: null });
            fetchBookings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel booking');
            setConfirmModal({ isOpen: false, bookingId: null });
        }
    };

    const handleEditClick = (booking) => {
        setEditModal({ isOpen: true, booking });
    };

    const handleUpdateSuccess = () => {
        setEditModal({ isOpen: false, booking: null });
        fetchBookings();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'CANCELLED': return 'bg-gray-50 text-gray-700 border-gray-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 tracking-tight">My <span className="text-blue-600 dark:text-blue-400">Bookings</span></h1>

            {error && <div className="bg-red-50 text-red-600 p-4 font-bold border border-red-100 rounded-xl mb-6 text-sm">{error}</div>}

            <div className="glass-card overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resource</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date & Time</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reason / Purpose</th>
                            <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {loading && (
                            <tr><td colSpan="5" className="px-8 py-16 text-center text-gray-500">Loading your history...</td></tr>
                        )}
                        {!loading && bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{booking.resourceName}</div>
                                    <div className="text-[10px] uppercase text-gray-400 font-bold tracking-tighter">{booking.resourceType}</div>
                                </td>
                                <td className="px-8 py-6 text-sm font-medium">
                                    <div className="text-gray-900 dark:text-white">{booking.date}</div>
                                    <div className="text-gray-500">{booking.startTime.substring(0,5)} - {booking.endTime.substring(0,5)}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getStatusStyle(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-sm">
                                    <div className="text-gray-600 dark:text-gray-300 italic">"{booking.purpose}"</div>
                                    {booking.rejectionReason && (
                                        <div className="text-rose-500 text-xs mt-1 font-bold">Reject Note: {booking.rejectionReason}</div>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-4">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => handleEditClick(booking)}
                                                    className="text-blue-600 hover:text-blue-700 font-extrabold text-[10px] tracking-widest uppercase transition-all"
                                                >
                                                    EDIT
                                                </button>
                                                <button 
                                                    onClick={() => handleCancelClick(booking.id)}
                                                    className="text-rose-500 hover:text-rose-700 font-extrabold text-[10px] tracking-widest uppercase transition-all"
                                                >
                                                    CANCEL
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'APPROVED' && (
                                            <span className="text-gray-300 dark:text-gray-600 font-bold text-[10px] uppercase tracking-widest">Locked</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && bookings.length === 0 && (
                            <tr><td colSpan="5" className="px-8 py-16 text-center text-gray-400 italic">No bookings found. Try reserving a classroom!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen} 
                title="Cancel Booking?" 
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                onConfirm={confirmCancellation}
                onCancel={() => setConfirmModal({ isOpen: false, bookingId: null })}
            />

            <EditModal 
                isOpen={editModal.isOpen}
                booking={editModal.booking}
                onClose={() => setEditModal({ isOpen: false, booking: null })}
                onUpdate={handleUpdateSuccess}
            />
        </div>
    );
};


export default MyBookings;
