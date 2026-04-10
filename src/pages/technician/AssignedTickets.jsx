import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';

const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
        IN_PROGRESS: "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
        RESOLVED: "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
        CLOSED: "bg-gray-100/80 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800",
        REJECTED: "bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800"
    };
    return <span className={`px-4 py-1.5 inline-flex items-center shadow-sm text-[11px] font-bold tracking-wider rounded-full border transition-all ${styles[status]}`}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
    const styles = {
        LOW: "text-blue-400 font-bold",
        MEDIUM: "text-amber-500 font-extrabold",
        HIGH: "text-rose-500 font-extrabold"
    };
    return <span className={`text-[10px] tracking-widest uppercase ${styles[priority]}`}>{priority}</span>;
};

const AssignedTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, ticket: null });
    const [selectedStatus, setSelectedStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getAssignedTickets();
            setTickets(data);
        } catch (err) {
            console.error('Failed to fetch assigned tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleUpdateStatus = async () => {
        try {
            await ticketService.updateTechnicianStatus(modal.ticket.id, { status: selectedStatus, resolutionNotes });
            setModal({ show: false, ticket: null });
            fetchTickets();
        } catch (err) {
            console.error('Status update failed');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Assigned Tasks</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">You have {tickets.length} assigned tasks.</p>
                </div>
            </div>

            {/* Main Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                        <thead className="bg-gray-50/50 dark:bg-white/5">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Task ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Reported By</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Category & Resource</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Priority</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-bold animate-pulse">Loading assigned tasks...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-bold italic">No tasks assigned to you.</td></tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-8 py-5 font-mono text-xs font-bold text-gray-400">#{ticket.id.toString().padStart(4, '0')}</td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-gray-900 dark:text-white">{ticket.userName}</div>
                                            <div className="text-[10px] font-bold text-gray-400 tracking-wider">Contact: {ticket.preferredContact}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{ticket.category}</div>
                                            <div className="text-[10px] font-bold text-blue-500 uppercase mt-1">{ticket.resourceName || 'Global Area'}</div>
                                        </td>
                                        <td className="px-8 py-5"><PriorityBadge priority={ticket.priority} /></td>
                                        <td className="px-8 py-5"><StatusBadge status={ticket.status} /></td>
                                        <td className="px-8 py-5 text-right space-x-3">
                                            <button 
                                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                View Details
                                            </button>
                                            <button 
                                                onClick={() => { setModal({ show: true, ticket }); setSelectedStatus(ticket.status); setResolutionNotes(ticket.resolutionNotes || ''); }}
                                                className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                            >
                                                Update Status
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Modal */}
            {modal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all">
                    <div className="glass-card max-w-md w-full p-10 shadow-2xl border-white/20 relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600"></div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase">Update Task Status</h3>
                        
                        <div className="space-y-6 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Task Status</label>
                                <select 
                                    className="modern-input w-full"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="RESOLVED">RESOLVED</option>
                                    <option value="REJECTED">REJECTED</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fix Details</label>
                                <textarea 
                                    className="modern-input w-full h-24"
                                    placeholder="Enter fix details..."
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button onClick={() => setModal({ show: false, ticket: null })} className="text-xs font-bold text-gray-400 uppercase hover:text-gray-600 transition-colors">Cancel</button>
                            <button 
                                onClick={handleUpdateStatus}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedTickets;
