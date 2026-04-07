import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resource.service';

const RESOURCE_TYPES = {
    'CLASSROOM': 'CLASSROOM',
    'LAB': 'LABORATORY',
    'EQUIPMENT': 'EQUIPMENT',
    'SEMINAR_HALL': 'SEMINAR HALL'
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

const AdminResource = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE'
    });
    const [editId, setEditId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources();
            setResources(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await resourceService.updateResource(editId, { ...formData, capacity: Number(formData.capacity) });
            } else {
                await resourceService.createResource({ ...formData, capacity: Number(formData.capacity) });
            }
            setFormData({ name: '', type: '', capacity: '', location: '', availabilityWindow: '', status: 'ACTIVE' });
            setEditId(null);
            setError(null);
            fetchResources();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save resource');
        }
    };

    const handleEdit = (res) => {
        setFormData({
            name: res.name, type: res.type, capacity: res.capacity, 
            location: res.location, availabilityWindow: res.availabilityWindow, status: res.status
        });
        setEditId(res.id);
        window.scrollTo(0, 0); // Scroll up to the form effortlessly
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await resourceService.deleteResource(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
            fetchResources();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete resource');
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 tracking-tight">Resource Operations <span className="text-blue-600 dark:text-blue-400">Center</span></h1>
            
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl relative mb-8 font-bold text-sm flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {error}
            </div>}

            <div className="glass-card p-8 mb-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 group-hover:bg-blue-500 transition-colors"></div>
                <h2 className="text-xl font-extrabold mb-8 flex items-center text-gray-900 dark:text-white tracking-tight ml-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    {editId ? 'Modify Resource' : 'Add New Resource'}
                </h2>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-2">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Resource Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="modern-input w-full" placeholder="e.g. Auditorium Alpha" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Resource Type</label>
                        <select name="type" required value={formData.type} onChange={handleInputChange} className="modern-input w-full cursor-pointer appearance-none pr-10">
                            <option value="">Select Resource Type</option>
                            {Object.entries(RESOURCE_TYPES).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
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
                        <input type="text" name="availabilityWindow" placeholder="e.g. 08:00 - 18:00" required value={formData.availabilityWindow} onChange={handleInputChange} className="modern-input w-full" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Resource Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="modern-input w-full cursor-pointer appearance-none">
                            <option value="ACTIVE">OPERATIONAL</option>
                            <option value="OUT_OF_SERVICE">DECOMMISSIONED</option>
                        </select>
                    </div>
                    <div className="lg:col-span-3 flex justify-end gap-5 mt-6 pt-8 border-t border-gray-100 dark:border-white/5">
                        {editId && <button type="button" onClick={() => {setEditId(null); setFormData({name:'', type:'', capacity:'', location:'', availabilityWindow:'', status:'ACTIVE'}); setError(null);}} className="px-8 py-3.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">Cancel Configuration</button>}
                        <button type="submit" className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                            {editId ? 'Save Changes' : 'Add Resource'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Resource Name</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Resource Type</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Location</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Maximum Capacity</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Resource Status</th>
                            <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {loading && <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing cluster metrics...</td></tr>}
                        {!loading && resources.map(res => (
                            <tr key={res.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-all group">
                                <td className="px-8 py-6 whitespace-nowrap font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{res.name}</td>
                                <td className="px-8 py-6 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{RESOURCE_TYPES[res.type] || res.type}</td>
                                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">{res.location}</td>
                                <td className="px-8 py-6 whitespace-nowrap text-sm font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 text-center rounded-lg">{res.capacity}</td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all ${res.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 shadow-sm shadow-emerald-500/10' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800 shadow-sm shadow-rose-500/10'}`}>
                                        {res.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(res)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-extrabold mr-6 transition-all transform hover:scale-110 active:scale-95 inline-block">Edit</button>
                                    <button onClick={() => handleDelete(res.id)} className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold transition-all transform hover:scale-110 active:scale-95 inline-block">Remove</button>
                                </td>
                            </tr>
                        ))}
                        {resources.length === 0 && !loading && (
                            <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-medium italic">Zero active items mapped across grid.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ActionModal 
                isOpen={deleteModal.isOpen}
                title="Remove Resource"
                message="Are you sure you want to permanently remove this resource? This action cannot be undone."
                confirmText="Remove"
                isDanger={true}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default AdminResource;
