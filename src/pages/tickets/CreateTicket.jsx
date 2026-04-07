import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { resourceService } from '../../services/resource.service';
import Button from '../../components/common/Button';

const CreateTicket = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        resourceId: '',
        location: '',
        category: '',
        description: '',
        priority: 'MEDIUM',
        preferredContact: ''
    });
    const [attachments, setAttachments] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await resourceService.getAllResources();
                setResources(data);
            } catch (err) {
                console.error('Failed to fetch resources');
            }
        };
        fetchResources();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + attachments.length > 3) {
            showAlert('Maximum 3 attachments allowed', 'error');
            return;
        }

        const newAttachments = [...attachments, ...files];
        setAttachments(newAttachments);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeAttachment = (index) => {
        const newAttachments = attachments.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setAttachments(newAttachments);
        setPreviews(newPreviews);
    };

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('ticket', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
            attachments.forEach(file => data.append('attachments', file));

            await ticketService.createTicket(data);
            showAlert('Ticket created successfully! Redirecting...', 'success');
            setTimeout(() => navigate('/tickets/my'), 2000);
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to create ticket', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Alert */}
            <div className={`transition-all duration-300 ${alert.show ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${alert.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                    {alert.message}
                </div>
            </div>

            <div className="glass-card p-8 lg:p-12 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 group-hover:bg-blue-500 transition-colors"></div>
                
                <div className="mb-10 pl-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Report an Issue</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Please provide details to help our technicians resolve the issue.</p>
                </div>

                <form onSubmit={handleSubmit} className="pl-4 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Resource (Optional)</label>
                            <select 
                                name="resourceId"
                                value={formData.resourceId}
                                onChange={handleInputChange}
                                className="modern-input w-full"
                            >
                                <option value="">Select Resource</option>
                                {resources.map(res => (
                                    <option key={res.id} value={res.id}>{res.name} ({res.type})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-rose-500">Location *</label>
                            <input 
                                required
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g. Block A, Room 302"
                                className="modern-input w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-rose-500">Category *</label>
                            <select 
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="modern-input w-full"
                            >
                                <option value="">Select Category</option>
                                <option value="ELECTRICAL">Electrical</option>
                                <option value="PLUMBING">Plumbing</option>
                                <option value="NETWORK">Network / Wi-Fi</option>
                                <option value="FURNITURE">Furniture</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-rose-500">Issue Priority *</label>
                            <select 
                                required
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="modern-input w-full"
                            >
                                <option value="LOW">Low - General maintenance</option>
                                <option value="MEDIUM">Medium - Normal operation affected</option>
                                <option value="HIGH">High - Urgent resolution needed</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-rose-500">Issue Description *</label>
                        <textarea 
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Please describe the issue in detail..."
                            className="modern-input w-full h-40 resize-none"
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-rose-500">Contact Method *</label>
                        <input 
                            required
                            name="preferredContact"
                            value={formData.preferredContact}
                            onChange={handleInputChange}
                            placeholder="Email, Phone, or Teams Handle"
                            className="modern-input w-full"
                        />
                    </div>

                    {/* Attachments Section */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Attachments (Max 3 Images)</label>
                        <div className="flex flex-wrap gap-4">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden group shadow-md border-2 border-white dark:border-gray-700">
                                    <img src={preview} alt="Attachment" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            {attachments.length < 3 && (
                                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group">
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 mt-1">Upload</span>
                                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-10 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button 
                            type="submit"
                            disabled={loading}
                            className="px-12 py-3.5 shadow-xl shadow-blue-600/20"
                        >
                            {loading ? 'Submitting...' : 'Submit Form'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
