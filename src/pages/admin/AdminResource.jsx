import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resource.service';
import { useToast } from '../../context/ToastContext';

const TABS = {
    REGISTRY: 'REGISTRY',
    ENTRY: 'ENTRY',
    CATEGORIES: 'CATEGORIES'
};

const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hours12 = h % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
};

const formatWindow = (date, start, end) => {
    if (!date || !start || !end) return '';
    return `${date} | ${formatTime(start)} - ${formatTime(end)}`;
};

const parseTime12to24 = (time12) => {
    if (!time12) return '08:00';
    const [time, ampm] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes}`;
};

const DateTimeRangePickerModal = ({ isOpen, onClose, onSet, initialValue }) => {
    const [date, setDate] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && initialValue) {
            try {
                const parts = initialValue.split(' | ');
                if (parts.length === 2) {
                    setDate(parts[0]);
                    const times = parts[1].split(' - ');
                    if (times.length === 2) {
                        setStart(parseTime12to24(times[0]));
                        setEnd(parseTime12to24(times[1]));
                    }
                }
            } catch (err) {
                console.error("Failed to parse initial time value:", err);
                setDate(new Date().toISOString().split('T')[0]);
                setStart('08:00');
                setEnd('17:00');
            }
        } else if (isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
            setStart('08:00');
            setEnd('17:00');
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!date || !start || !end) {
            setError('Please fill in all fields.');
            return;
        }
        if (start >= end) {
            setError('End time must be after start time.');
            return;
        }
        setError('');
        onSet(formatWindow(date, start, end));
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
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Select Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="modern-input w-full" />
                    </div>

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

const EditResourceModal = ({ isOpen, onClose, formData, handleInputChange, handleSubmit, loading, onOpenPicker, resourceTypes }) => {
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
                        <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="modern-input w-full" placeholder="e.g. Block B Level 2" />
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
    const [typeForm, setTypeForm] = useState({ name: '', description: '' });
    const [editTypeData, setEditTypeData] = useState(null);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    const [editId, setEditId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: 'resource' });
    const [timePicker, setTimePicker] = useState({ isOpen: false, targetType: null });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [resourceData, typeData] = await Promise.all([
                resourceService.getAllResources(),
                resourceService.getAllResourceTypes()
            ]);
            setResources(resourceData);
            setResourceTypes(typeData);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to synchronize with server');
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async () => {
        try {
            const data = await resourceService.getAllResources();
            setResources(data);
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
            await resourceService.createResource({ ...formData, capacity: Number(formData.capacity) });
            setFormData({ name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE' });
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
            await resourceService.createResourceType(typeForm);
            setTypeForm({ name: '', description: '' });
            showToast('New resource category added successfully.', 'success');
            fetchResourceTypes();
        } catch (err) {
            showToast('Failed to create category', 'error');
        }
    };

    const handleTypeUpdate = async (e) => {
        e.preventDefault();
        try {
            await resourceService.updateResourceType(editTypeData.id, editTypeData);
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
                await resourceService.updateResource(editId, { ...editFormData, capacity: Number(editFormData.capacity) });
            }
            setEditFormData({ name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE' });
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
            location: res.location, availabilityWindow: res.availabilityWindow, status: res.status
        });
        setEditId(res.id);
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Resource Operations <span className="text-blue-600 dark:text-blue-400">Center</span></h1>

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
                            <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                                <thead className="bg-gray-50/50 dark:bg-white/5">
                                    <tr>
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
                                                <button onClick={() => handleEdit(res)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-extrabold mr-6 transition-all transform hover:scale-110 active:scale-95 inline-block">Edit</button>
                                                <button onClick={() => handleDelete(res.id)} className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold transition-all transform hover:scale-110 active:scale-95 inline-block">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {resources.length === 0 && (
                                        <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-medium italic">Asset registry is currently empty.</td></tr>
                                    )}
                                </tbody>
                            </table>
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
                                    <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="modern-input w-full" placeholder="e.g. Block B Level 2" />
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
                                    <div className="md:col-span-2 flex justify-end">
                                        <button type="submit" className="px-12 py-4 bg-gray-900 dark:bg-blue-600 hover:scale-105 text-white text-sm font-extrabold rounded-2xl shadow-xl active:scale-95 transition-all">
                                            Add Category
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="glass-card overflow-hidden max-w-5xl">
                                <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                                    <thead className="bg-gray-50/50 dark:bg-white/5">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Category Label</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Description</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {resourceTypes.map(type => (
                                            <tr key={type.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-all group">
                                                <td className="px-8 py-6 whitespace-nowrap font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{type.name}</td>
                                                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium italic">{type.description || 'No description assigned'}</td>
                                                <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                                                    <button onClick={() => { setEditTypeData(type); setIsTypeModalOpen(true); }} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-extrabold mr-6 transition-all transform hover:scale-110 active:scale-95 inline-block">Edit</button>
                                                    <button onClick={() => handleTypeDelete(type.id)} className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold transition-all transform hover:scale-110 active:scale-95 inline-block">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {resourceTypes.length === 0 && (
                                            <tr><td colSpan="3" className="px-8 py-16 text-center text-gray-400 font-medium italic">No custom categories mapped yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
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

            <EditResourceModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditId(null); }}
                formData={editFormData}
                handleInputChange={handleEditInputChange}
                handleSubmit={handleUpdate}
                loading={false}
                resourceTypes={resourceTypes}
                onOpenPicker={(type) => setTimePicker({ isOpen: true, targetType: type })}
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
                onSet={(formattedValue) => {
                    if (timePicker.targetType === 'add') {
                        setFormData(prev => ({ ...prev, availabilityWindow: formattedValue }));
                    } else {
                        setEditFormData(prev => ({ ...prev, availabilityWindow: formattedValue }));
                    }
                }}
                initialValue={timePicker.targetType === 'add' ? formData.availabilityWindow : editFormData.availabilityWindow}
            />
        </div>
    );
};

export default AdminResource;
