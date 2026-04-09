import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resource.service';
import { bookingService } from '../../services/booking.service';

const BookingModal = ({ isOpen, resource, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await bookingService.createBooking({
                resourceId: resource.id,
                ...formData,
                expectedAttendees: Number(formData.expectedAttendees)
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in">
            <div className="glass-card max-w-lg w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Book {resource.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Request a reservation for this resource.</p>
                
                {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-lg text-xs font-bold mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</label>
                            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="modern-input w-full text-sm" min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expected Attendees</label>
                            <input type="number" required value={formData.expectedAttendees} onChange={(e) => setFormData({...formData, expectedAttendees: e.target.value})} className="modern-input w-full text-sm" placeholder="e.g. 30" min="1" max={resource.capacity} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                            <input type="time" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value + ':00'})} className="modern-input w-full text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">End Time</label>
                            <input type="time" required value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value + ':00'})} className="modern-input w-full text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Purpose</label>
                        <textarea required value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="modern-input w-full text-sm min-h-[80px]" placeholder="Explain why you need this resource..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                            {loading ? 'Processing...' : 'Request Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ResourceList = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources(search, typeFilter);
            setResources(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    const handleBookingSuccess = () => {
        setSelectedResource(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
            
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 tracking-tight">Campus <span className="text-blue-600 dark:text-blue-400">Resources</span></h1>
            
            {showSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl mb-8 animate-fade-in flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <p className="font-bold">Booking request sent! You can track its status in 'My Bookings'.</p>
                </div>
            )}

            <div className="glass-card p-6 mb-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 group-hover:bg-blue-500 transition-colors"></div>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 relative z-10 ml-2">
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="Search resources by name..." 
                            className="modern-input w-full pl-12"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="md:w-64 relative">
                        <select 
                            className="modern-input w-full cursor-pointer appearance-none pr-10"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Categories ▾</option>
                            <option value="CLASSROOM">CLASSROOM</option>
                            <option value="LAB">LABORATORY</option>
                            <option value="EQUIPMENT">EQUIPMENT</option>
                            <option value="SEMINAR_HALL">SEMINAR HALL</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4.5h18m-18 5h18m-18 5h18m-18 5h18" /></svg>
                        Filter
                    </button>
                </form>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl relative mb-8 font-bold text-sm flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {error}
            </div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Resources...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {resources.map((res) => (
                        <div key={res.id} className="glass-card interactive-box p-8 group overflow-hidden glow-on-hover flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <span className={`px-4 py-1.5 text-[10px] rounded-full font-extrabold tracking-widest uppercase border ${res.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'}`}>
                                    {res.status}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">{res.name}</h3>
                            
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10" /></svg>
                                    <span>Type: {res.type}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    <span>Capacity: {res.capacity} people</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>{res.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-400 dark:text-gray-500 italic">
                                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>Available Time: {res.availabilityWindow}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedResource(res)}
                                disabled={res.status !== 'ACTIVE'}
                                className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm ${res.status === 'ACTIVE' ? 'bg-gray-50 hover:bg-blue-600 dark:bg-white/5 dark:hover:bg-blue-600 text-gray-700 hover:text-white dark:text-gray-200 border border-gray-100 dark:border-white/5 group-hover:shadow-blue-500/30' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'}`}
                            >
                                {res.status === 'ACTIVE' ? 'Book Resource' : 'Unavailable'}
                            </button>
                        </div>
                    ))}
                    {resources.length === 0 && !loading && (
                        <div className="col-span-full glass-card p-20 text-center flex flex-col items-center gap-4">
                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">No resources found.</span>
                        </div>
                    )}
                </div>
            )}

            <BookingModal 
                isOpen={!!selectedResource} 
                resource={selectedResource} 
                onClose={() => setSelectedResource(null)}
                onSuccess={handleBookingSuccess}
            />
        </div>
    );
};

export default ResourceList;
