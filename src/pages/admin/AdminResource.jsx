import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resource.service';
import { adminBookingService } from '../../services/booking.service';
import { useToast } from '../../context/ToastContext';
import AnalyticsReport from '../../components/AnalyticsReport';
import { generateBookingReportPDF } from '../../utils/pdfGenerator';

const TABS = {
    REGISTRY: 'REGISTRY',
    ENTRY: 'ENTRY',
    CATEGORIES: 'CATEGORIES'
};

function formatTime(time24) {
    if (!time24) return '';
    try {
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hours12 = h % 12 || 12;
        return `${hours12}:${minutes} ${ampm}`;
    } catch (e) { return time24; }
}

function parseTime12to24(time12) {
    if (!time12) return '08:00';
    try {
        const [time, ampm] = time12.trim().split(' ');
        let [hours, minutes] = time.split(':');
        let h = parseInt(hours);
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${minutes}`;
    } catch (e) { return '08:00'; }
}

function formatWindow(startDate, endDate, start, end) {
    const timePart = `${formatTime(start)} - ${formatTime(end)}`;
    if (!startDate || !endDate) return `Every Day | ${timePart}`;
    return `${startDate} to ${endDate} | ${timePart}`;
}

const DateTimeRangePickerModal = ({ isOpen, onClose, onSet, initialValue }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isEveryDay, setIsEveryDay] = useState(true);
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && initialValue) {
            try {
                const parts = initialValue.split(' | ');
                if (parts.length === 2) {
                    const datePart = parts[0].trim();
                    const timePart = parts[1].trim();

                    if (datePart === 'Every Day') {
                        setIsEveryDay(true);
                        setStartDate('');
                        setEndDate('');
                    } else {
                        setIsEveryDay(false);
                        // Robust splitting for both " to " and " - " just in case
                        const dates = datePart.includes(' to ')
                            ? datePart.split(' to ')
                            : datePart.split(' - ');

                        if (dates.length === 2) {
                            setStartDate(dates[0].trim());
                            setEndDate(dates[1].trim());
                        }
                    }

                    const times = timePart.split(' - ');
                    if (times.length === 2) {
                        setStart(parseTime12to24(times[0]));
                        setEnd(parseTime12to24(times[1]));
                    }
                }
            } catch (err) {
                console.error("Failed to parse initial time value:", err);
                setIsEveryDay(true);
                setStartDate('');
                setEndDate('');
                setStart('08:00');
                setEnd('17:00');
            }
        } else if (isOpen) {
            setIsEveryDay(true);
            setStartDate('');
            setEndDate('');
            setStart('08:00');
            setEnd('17:00');
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!start || !end) {
            setError('Please fill in times.');
            return;
        }
        if (start >= end) {
            setError('End time must be after start time.');
            return;
        }

        if (!isEveryDay) {
            if (!startDate || !endDate) {
                setError('Please select both start and end dates.');
                return;
            }
            const today = new Date().toISOString().split('T')[0];
            if (startDate < today) {
                setError('Start date cannot be in the past.');
                return;
            }
            if (endDate < startDate) {
                setError('End date cannot be before start date.');
                return;
            }
        }

        setError('');
        const sDate = isEveryDay ? null : startDate;
        const eDate = isEveryDay ? null : endDate;
        onSet(formatWindow(sDate, eDate, start, end), sDate, eDate);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in">
            <div className="glass-card max-w-lg w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        Set Availability Window
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.0" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                        <div>
                            <p className="text-sm font-extrabold text-blue-900 dark:text-blue-100 uppercase tracking-tight">Availability Mode</p>
                            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Choose between daily or restricted range</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsEveryDay(!isEveryDay)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${isEveryDay ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <span className={`${isEveryDay ? 'translate-x-8' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`} />
                        </button>
                    </div>

                    {isEveryDay ? (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">Status: Available Every Day</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Start Date</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="modern-input w-full" min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">End Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="modern-input w-full" min={startDate || new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Start Time</label>
                            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="modern-input w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">End Time</label>
                            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="modern-input w-full" />
                        </div>
                    </div>

                    {error && <p className="text-xs font-bold text-rose-500 animate-shake">{error}</p>}

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
                        <button onClick={handleSave} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Confirm Time</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isDanger }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in">
            <div className="glass-card max-w-md w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isDanger ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AlertModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in">
            <div className="glass-card max-w-sm w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-500"></div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Attention Required</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium">{message}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditResourceModal = ({ isOpen, onClose, formData, handleInputChange, handleSubmit, loading, onOpenPicker, resourceTypes, handleImageChange, imagePreview, onSetValidationAlert }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in">
            <div className="glass-card max-w-4xl w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        Modify Resource Configuration
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Resource Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="modern-input w-full" placeholder="e.g. Auditorium Alpha" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Resource Type</label>
                        <select name="type" required value={formData.type} onChange={handleInputChange} className="modern-input w-full cursor-pointer appearance-none pr-10">
                            <option value="">Select Resource Type</option>
                            {resourceTypes.map(type => (
                                <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Maximum Capacity</label>
                        <input type="number" name="capacity" min="1" required value={formData.capacity} onChange={handleInputChange} className="modern-input w-full" placeholder="e.g. 120" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Location</label>
                        <select name="location" required value={formData.location} onChange={handleInputChange} onFocus={() => { if (!formData.type) { onSetValidationAlert('First select asset category!'); } }} className="modern-input w-full cursor-pointer appearance-none pr-10">
                            <option value="">Select Location</option>
                            {formData.type && resourceTypes.find(t => t.name === formData.type)?.locations?.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Available Time</label>
                        <button
                            type="button"
                            onClick={() => onOpenPicker('edit')}
                            className="modern-input w-full text-left flex items-center justify-between group"
                        >
                            <span className={formData.availabilityWindow ? 'text-gray-900 dark:text-white' : 'text-gray-400 italic'}>
                                {formData.availabilityWindow || 'Click to set availability window'}
                            </span>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Resource Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="modern-input w-full cursor-pointer appearance-none">
                            <option value="ACTIVE">OPERATIONAL</option>
                            <option value="OUT_OF_SERVICE">DECOMMISSIONED</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Update Photo</label>
                        <div className="flex items-center gap-6 p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors group">
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-inner flex-shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block w-full">
                                    <span className="sr-only">Choose image</span>
                                    <input type="file" onChange={(e) => handleImageChange(e, 'edit')} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer" />
                                </label>
                                <p className="mt-2 text-[10px] text-gray-400 font-medium italic">Supports JPG, PNG or WEBP. Max 5MB recommended.</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-5 mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                        <button type="button" onClick={onClose} className="px-8 py-3 dark:border-white/5.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2">
                            {loading && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            Update Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminResource = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [resources, setResources] = useState([]);
    const [resourceTypes, setResourceTypes] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(TABS.REGISTRY);
    const [error, setError] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE'
    });
    const [editFormData, setEditFormData] = useState({
        name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE'
    });

    // Type Manager States
    const [typeForm, setTypeForm] = useState({ name: '', description: '', locations: [''] });
    const [editTypeData, setEditTypeData] = useState(null);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    // Alerts
    const [validationAlert, setValidationAlert] = useState(null);

    const [editId, setEditId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: 'resource' });
    const [timePicker, setTimePicker] = useState({ isOpen: false, targetType: null });

    // Image states
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editSelectedImage, setEditSelectedImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);

    // PDF Generation
    const [reportData, setReportData] = useState(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const IMAGE_BASE_URL = 'http://localhost:8080/';

    const handleImageChange = (e, target = 'add') => {
        const file = e.target.files[0];
        if (file) {
            if (target === 'add') {
                setSelectedImage(file);
                setImagePreview(URL.createObjectURL(file));
            } else {
                setEditSelectedImage(file);
                setEditImagePreview(URL.createObjectURL(file));
            }
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleExportPDF = async () => {
        try {
            setIsGeneratingPdf(true);
            const data = await adminBookingService.getAllBookings();
            const bookings = data.data || data;
            setReportData(bookings);
        } catch (err) {
            showToast("Failed to fetch booking data for PDF", "error");
            setIsGeneratingPdf(false);
        }
    };

    useEffect(() => {
        if (reportData && isGeneratingPdf) {
            setTimeout(async () => {
                try {
                    await generateBookingReportPDF('analytics-report-container', reportData, resources);
                    showToast("PDF Analytics Report downloaded successfully!", "success");
                } catch (err) {
                    showToast("Error generating PDF", "error");
                } finally {
                    setReportData(null);
                    setIsGeneratingPdf(false);
                }
            }, 800);
        }
    }, [reportData, isGeneratingPdf, resources, showToast]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [resourceData, typeData, bookingRes] = await Promise.all([
                resourceService.getAllResources(),
                resourceService.getAllResourceTypes(),
                adminBookingService.getAllBookings().catch(() => ({ data: [] }))
            ]);
            setResources(resourceData);
            setResourceTypes(typeData);
            setAllBookings(bookingRes.data || bookingRes || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to synchronize with server');
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async () => {
        try {
            const [data, bookingRes] = await Promise.all([
                resourceService.getAllResources(),
                adminBookingService.getAllBookings().catch(() => ({ data: [] }))
            ]);
            setResources(data);
            setAllBookings(bookingRes.data || bookingRes || []);
        } catch (err) {
            setError('Failed to refresh registry');
        }
    };

    const fetchResourceTypes = async () => {
        try {
            const data = await resourceService.getAllResourceTypes();
            setResourceTypes(data);
        } catch (err) {
            setError('Failed to refresh categories');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await resourceService.createResource({
                ...formData,
                capacity: Number(formData.capacity)
            }, selectedImage);
            setFormData({
                name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE',
                startDate: null, endDate: null
            });
            setSelectedImage(null);
            setImagePreview(null);
            showToast('Resource has been successfully added to the system.', 'success');
            setError(null);
            fetchResources();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to save resource';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        }
    };

    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...typeForm,
                locations: typeForm.locations.map(l => l.trim()).filter(Boolean)
            };
            await resourceService.createResourceType(payload);
            setTypeForm({ name: '', description: '', locations: [''] });
            showToast('New resource category added successfully.', 'success');
            fetchResourceTypes();
        } catch (err) {
            showToast('Failed to create category', 'error');
        }
    };

    const handleTypeUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...editTypeData,
                locations: editTypeData.locations.map(l => l.trim()).filter(Boolean)
            };
            await resourceService.updateResourceType(editTypeData.id, payload);
            setIsTypeModalOpen(false);
            showToast('Category updated successfully.', 'success');
            fetchResourceTypes();
        } catch (err) {
            showToast('Failed to update category', 'error');
        }
    };

    const handleTypeDelete = (id) => {
        setDeleteModal({ isOpen: true, id, type: 'category' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await resourceService.updateResource(editId, {
                    ...editFormData,
                    capacity: Number(editFormData.capacity)
                }, editSelectedImage);
            }
            setEditFormData({
                name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE',
                startDate: null, endDate: null
            });
            setEditSelectedImage(null);
            setEditImagePreview(null);
            setEditId(null);
            setIsEditModalOpen(false);
            showToast('Resource configuration updated successfully.', 'success');
            setError(null);
            fetchResources();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to update resource';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        }
    };

    const handleEdit = (res) => {
        setEditFormData({
            name: res.name, type: res.type, capacity: res.capacity,
            location: res.location, availabilityWindow: res.availabilityWindow, status: res.status,
            startDate: res.startDate, endDate: res.endDate
        });
        setEditId(res.id);
        setEditSelectedImage(null);
        setEditImagePreview(res.imageUrl ? `${IMAGE_BASE_URL}${res.imageUrl}` : null);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id, type: 'resource' });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            if (deleteModal.type === 'resource') {
                await resourceService.deleteResource(deleteModal.id);
                showToast('Resource has been permanently removed.', 'success');
                fetchResources();
            } else {
                await resourceService.deleteResourceType(deleteModal.id);
                showToast('Category has been removed.', 'success');
                fetchResourceTypes();
            }
            setDeleteModal({ isOpen: false, id: null, type: 'resource' });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Operation failed';
            showToast(errorMsg, 'error');
            setDeleteModal({ isOpen: false, id: null, type: 'resource' });
        }
    };

    const isResourceCurrentlyBooked = (resourceId) => {
        if (!allBookings || allBookings.length === 0) return false;
        const now = new Date();
        return allBookings.some(b => {
            if (b.resourceId !== resourceId) return false;
            // Ignore if cancelled or rejected
            if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;

            // Check if booking end time hasn't passed
            try {
                // date format: YYYY-MM-DD, endTime format: HH:mm:ss
                let endStr = b.endTime;
                if (endStr && endStr.length === 5) { endStr += ':00'; } // Ensure seconds exist
                const endDateTime = new Date(`${b.date}T${endStr}`);
                return endDateTime > now;
            } catch (e) {
                return false;
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {reportData && <AnalyticsReport bookings={reportData} resources={resources} />}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Resource Operations <span className="text-blue-600 dark:text-blue-400">Center</span></h1>

                <button
                    onClick={handleExportPDF}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-80"
                >
                    {isGeneratingPdf ? (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    )}
                    {isGeneratingPdf ? 'Generating PDF...' : 'Export Analytics PDF'}
                </button>
            </div>

            {/* Premium Tab Navigation */}
            <div className="flex gap-4 mb-10 bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-2xl w-fit backdrop-blur-sm border border-gray-200/50 dark:border-white/5">
                {[
                    { id: TABS.REGISTRY, label: 'View Resource', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> },
                    { id: TABS.ENTRY, label: 'Add Resource', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> },
                    { id: TABS.CATEGORIES, label: 'Add Resource Type', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01"></path></svg> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 border border-blue-500/20' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl relative mb-8 font-bold text-sm flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
            </div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Grid Metrics...</p>
                </div>
            ) : (
                <>
                    {/* ASSET REGISTRY TAB */}
                    {activeTab === TABS.REGISTRY && (
                        <div className="glass-card overflow-hidden animate-fade-in">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                                    <thead className="bg-gray-50/50 dark:bg-white/5">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Photo</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Resource</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Location</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Capacity</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {resources.map(res => (
                                            <tr key={res.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-all group">
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm">
                                                        {res.imageUrl ? (
                                                            <img src={`${IMAGE_BASE_URL}${res.imageUrl}`} alt={res.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{res.name}</td>
                                                <td className="px-8 py-6 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{res.type}</td>
                                                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">{res.location}</td>
                                                <td className="px-8 py-6 whitespace-nowrap"><span className="px-3 py-1 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg">{res.capacity}</span></td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all ${res.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'}`}>
                                                        {res.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                                    {isResourceCurrentlyBooked(res.id) ? (
                                                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-gray-200 dark:border-gray-700 cursor-not-allowed">Booked</span>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEdit(res)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-extrabold mr-6 transition-all transform hover:scale-110 active:scale-95 inline-block scale-110">Edit</button>
                                                            <button onClick={() => handleDelete(res.id)} className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold transition-all transform hover:scale-110 active:scale-95 inline-block scale-110">Remove</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {resources.length === 0 && (
                                            <tr><td colSpan="7" className="px-8 py-16 text-center text-gray-400 font-medium italic">Asset registry is currently empty.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ASSET ENTRY TAB */}
                    {activeTab === TABS.ENTRY && (
                        <div className="glass-card p-10 animate-fade-in relative overflow-hidden max-w-5xl">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                            <h2 className="text-2xl font-extrabold mb-10 flex items-center text-gray-900 dark:text-white tracking-tight">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-5 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                </div>
                                Deploy New Resource Asset
                            </h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Asset Name</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="modern-input w-full" placeholder="e.g. Auditorium Alpha" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Asset Category</label>
                                    <select name="type" required value={formData.type} onChange={handleInputChange} className="modern-input w-full cursor-pointer appearance-none pr-10">
                                        <option value="">Select Resource Type</option>
                                        {resourceTypes.map(type => (
                                            <option key={type.id} value={type.name}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Maximum Capacity</label>
                                    <input type="number" name="capacity" min="1" required value={formData.capacity} onChange={handleInputChange} className="modern-input w-full" placeholder="e.g. 120" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Deployment Location</label>
                                    <select name="location" required value={formData.location} onChange={handleInputChange} onFocus={() => { if (!formData.type) { setValidationAlert('First select asset category!'); } }} className="modern-input w-full cursor-pointer appearance-none pr-10">
                                        <option value="">Select Location</option>
                                        {formData.type && resourceTypes.find(t => t.name === formData.type)?.locations?.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Operating Window</label>
                                    <button type="button" onClick={() => setTimePicker({ isOpen: true, targetType: 'add' })} className="modern-input w-full text-left flex items-center justify-between group">
                                        <span className={formData.availabilityWindow ? 'text-gray-900 dark:text-white' : 'text-gray-400 italic'}>{formData.availabilityWindow || 'Define operational hours'}</span>
                                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Current Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="modern-input w-full cursor-pointer appearance-none">
                                        <option value="ACTIVE">OPERATIONAL</option>
                                        <option value="OUT_OF_SERVICE">DECOMMISSIONED</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Asset Photo</label>
                                    <div className="flex items-center gap-6 p-6 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors group">
                                        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-inner flex-shrink-0">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Add a visual representation</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">This photo will be visible to all students during booking.</p>
                                            <label className="block w-full">
                                                <input type="file" onChange={(e) => handleImageChange(e, 'add')} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer shadow-lg shadow-blue-500/20 transition-all" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-5 mt-6 pt-10 border-t border-gray-100 dark:border-white/5">
                                    <button type="submit" className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                                        Initialize Deployment
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* CATEGORY MANAGER TAB */}
                    {activeTab === TABS.CATEGORIES && (
                        <div className="animate-fade-in space-y-8">
                            <div className="glass-card p-10 relative overflow-hidden max-w-5xl">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                <h2 className="text-2xl font-extrabold mb-10 flex items-center text-gray-900 dark:text-white tracking-tight">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-5 shadow-sm">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                    </div>
                                    Register New Category Type
                                </h2>
                                <form onSubmit={handleTypeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Type Label</label>
                                        <input type="text" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required className="modern-input w-full" placeholder="e.g. MULTIMEDIA STUDIO" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Brief Description</label>
                                        <input type="text" value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} className="modern-input w-full" placeholder="Optional identifier" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Deployment Locations</label>
                                        <div className="space-y-3">
                                            {typeForm.locations.map((loc, idx) => (
                                                <div key={idx} className="flex gap-3 animate-fade-in">
                                                    <input type="text" value={loc} onChange={(e) => {
                                                        const newLocs = [...typeForm.locations];
                                                        newLocs[idx] = e.target.value;
                                                        setTypeForm({ ...typeForm, locations: newLocs });
                                                    }} className="modern-input flex-1" placeholder={`Location ${idx + 1} (e.g. Block A)`} />
                                                    {typeForm.locations.length > 1 && (
                                                        <button type="button" onClick={() => {
                                                            const newLocs = typeForm.locations.filter((_, i) => i !== idx);
                                                            setTypeForm({ ...typeForm, locations: newLocs });
                                                        }} className="px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-100 dark:border-red-900/30 font-bold active:scale-95">
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setTypeForm({ ...typeForm, locations: [...typeForm.locations, ''] })} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                                Add Another Location
                                            </button>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                        <button type="submit" className="px-12 py-4 bg-gray-900 dark:bg-blue-600 hover:scale-105 text-white text-sm font-extrabold rounded-2xl shadow-xl active:scale-95 transition-all">
                                            Add Category
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="glass-card overflow-hidden max-w-5xl">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                                        <thead className="bg-gray-50/50 dark:bg-white/5">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Category Label</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Description</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Locations</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {resourceTypes.map(type => (
                                                <tr key={type.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-all group">
                                                    <td className="px-8 py-6 whitespace-nowrap font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{type.name}</td>
                                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium italic">{type.description || 'No description assigned'}</td>
                                                    <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {type.locations?.length > 0 ? type.locations.map(loc => (
                                                                <span key={loc} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-md shadow-sm border border-blue-100 dark:border-blue-800">{loc}</span>
                                                            )) : <span className="italic">None</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                                                        <button onClick={() => { setEditTypeData({ ...type, locations: type.locations?.length > 0 ? type.locations : [''] }); setIsTypeModalOpen(true); }} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-extrabold mr-6 transition-all transform hover:scale-110 active:scale-95 inline-block scale-110">Edit</button>
                                                        <button onClick={() => handleTypeDelete(type.id)} className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold transition-all transform hover:scale-110 active:scale-95 inline-block scale-110">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {resourceTypes.length === 0 && (
                                                <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-medium italic">No custom categories mapped yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* MODALS SECTION */}
            <ActionModal
                isOpen={deleteModal.isOpen}
                title={deleteModal.type === 'resource' ? "Wipe Asset Data" : "Revoke Type Registration"}
                message={deleteModal.type === 'resource' ? "Are you certain you wish to permanently de-provision this asset? This action is irreversible." : "Deleting this category may affect resources assigned to it. Proceed with revocation?"}
                confirmText="Proceed"
                isDanger={true}
                onCancel={() => setDeleteModal({ isOpen: false, id: null, type: 'resource' })}
                onConfirm={confirmDelete}
            />

            <AlertModal
                isOpen={!!validationAlert}
                message={validationAlert}
                onClose={() => setValidationAlert(null)}
            />

            <EditResourceModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditId(null); }}
                formData={editFormData}
                handleInputChange={handleEditInputChange}
                handleSubmit={handleUpdate}
                loading={false}
                resourceTypes={resourceTypes}
                handleImageChange={handleImageChange}
                imagePreview={editImagePreview}
                onOpenPicker={(type) => setTimePicker({ isOpen: true, targetType: type })}
                onSetValidationAlert={setValidationAlert}
            />

            {/* Edit Type Modal */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 animate-fade-in">
                    <div className="glass-card max-w-lg w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">Edit Resource Category Type</h3>
                        <form onSubmit={handleTypeUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Type Label</label>
                                <input type="text" value={editTypeData.name} onChange={(e) => setEditTypeData({ ...editTypeData, name: e.target.value })} required className="modern-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Brief Description</label>
                                <input type="text" value={editTypeData.description || ''} onChange={(e) => setEditTypeData({ ...editTypeData, description: e.target.value })} className="modern-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Deployment Locations</label>
                                <div className="space-y-3">
                                    {(editTypeData.locations || ['']).map((loc, idx) => (
                                        <div key={idx} className="flex gap-3 animate-fade-in">
                                            <input type="text" value={loc} onChange={(e) => {
                                                const newLocs = [...(editTypeData.locations || [''])];
                                                newLocs[idx] = e.target.value;
                                                setEditTypeData({ ...editTypeData, locations: newLocs });
                                            }} className="modern-input flex-1" placeholder={`Location ${idx + 1}`} />
                                            {(editTypeData.locations || ['']).length > 1 && (
                                                <button type="button" onClick={() => {
                                                    const newLocs = editTypeData.locations.filter((_, i) => i !== idx);
                                                    setEditTypeData({ ...editTypeData, locations: newLocs });
                                                }} className="px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-100 dark:border-red-900/30 font-bold active:scale-95">
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setEditTypeData({ ...editTypeData, locations: [...(editTypeData.locations || ['']), ''] })} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Add Another Location
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setIsTypeModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Apply Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DateTimeRangePickerModal
                isOpen={timePicker.isOpen}
                onClose={() => setTimePicker({ isOpen: false, targetType: null })}
                onSet={(formattedValue, sDate, eDate) => {
                    if (timePicker.targetType === 'add') {
                        setFormData(prev => ({
                            ...prev,
                            availabilityWindow: formattedValue,
                            startDate: sDate ? sDate + 'T00:00:00' : null,
                            endDate: eDate ? eDate + 'T23:59:59' : null
                        }));
                    } else {
                        setEditFormData(prev => ({
                            ...prev,
                            availabilityWindow: formattedValue,
                            startDate: sDate ? sDate + 'T00:00:00' : null,
                            endDate: eDate ? eDate + 'T23:59:59' : null
                        }));
                    }
                }}
                initialValue={timePicker.targetType === 'add' ? formData.availabilityWindow : editFormData.availabilityWindow}
            />
        </div>
    );
};

export default AdminResource;