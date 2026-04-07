import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { adminService } from '../../services/admin.service';
import { resourceService } from '../../services/resource.service';

const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
        IN_PROGRESS: "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
        RESOLVED: "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
        CLOSED: "bg-gray-100/80 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800",
        REJECTED: "bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800"
    };

    return (
        <span className={`px-4 py-1.5 inline-flex items-center shadow-sm text-[11px] font-bold tracking-wider rounded-full border transition-all ${styles[status]}`}>
            {status}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const styles = {
        LOW: "text-blue-400 font-bold",
        MEDIUM: "text-amber-500 font-extrabold",
        HIGH: "text-rose-500 font-extrabold"
    };
    return <span className={`text-[10px] tracking-widest uppercase ${styles[priority]}`}>{priority}</span>;
};

const AdminTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        technicianId: '',
        userEmail: '',
        category: '',
        resourceId: '',
        date: ''
    });

    const [modal, setModal] = useState({ show: false, ticket: null, type: '' }); // type: 'ASSIGN' or 'STATUS'
    const [selectedTech, setSelectedTech] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketsData, techsData, resourcesData] = await Promise.all([
                ticketService.filterTickets(filters),
                adminService.getUsers('', 'TECHNICIAN', ''),
                resourceService.getAllResources()
            ]);
            setTickets(ticketsData);
            setTechnicians(techsData);
            setResources(resourcesData);
        } catch (err) {
            console.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAssign = async () => {
        if (!selectedTech) return;
        try {
            await ticketService.assignTechnician(modal.ticket.id, selectedTech);
            setModal({ show: false, ticket: null });
            fetchData();
        } catch (err) {
            console.error('Assignment failed');
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await ticketService.updateTicketStatus(modal.ticket.id, { status: selectedStatus, resolutionNotes });
            setModal({ show: false, ticket: null });
            fetchData();
        } catch (err) {
            console.error('Status update failed');
        }
    };

    const downloadPdf = async () => {
        try {
            const blobData = await adminService.exportTicketsPdf(filters);
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tickets_audit_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to export PDF');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Filter Dashboard */}
            <div className="glass-card p-8 lg:p-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 pl-4 tracking-tight uppercase">Support Tickets</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pl-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="modern-input w-full">
                            <option value="">All States</option>
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                            <option value="REJECTED">REJECTED</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Priority</label>
                        <select name="priority" value={filters.priority} onChange={handleFilterChange} className="modern-input w-full">
                            <option value="">All Priorities</option>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned Technician</label>
                        <select name="technicianId" value={filters.technicianId} onChange={handleFilterChange} className="modern-input w-full">
                            <option value="">All Technicians</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Resource</label>
                        <select name="resourceId" value={filters.resourceId} onChange={handleFilterChange} className="modern-input w-full">
                            <option value="">All Resources</option>
                            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end mt-8 pr-4">
                    <button 
                        type="button"
                        onClick={downloadPdf} 
                        className="w-full lg:w-auto px-10 py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-blue-50 text-white dark:text-gray-900 font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs"
                    >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export Tickets Report
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                        <thead className="bg-gray-50/50 dark:bg-white/5">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Issue ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Category & Priority</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Technician</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Issue Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-bold animate-pulse">Loading issues...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-bold">No issues found.</td></tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-8 py-5 font-mono text-xs font-bold text-gray-400">#{ticket.id.toString().padStart(4, '0')}</td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-gray-900 dark:text-white">{ticket.userName}</div>
                                            <div className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{ticket.userEmail}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{ticket.category}</div>
                                            <PriorityBadge priority={ticket.priority} />
                                        </td>
                                        <td className="px-8 py-5">
                                            {ticket.technicianName ? (
                                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{ticket.technicianName}</div>
                                            ) : (
                                                <button 
                                                    onClick={() => { setModal({ show: true, ticket, type: 'ASSIGN' }); setSelectedTech(''); }}
                                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 border border-amber-500/30 px-3 py-1 rounded-full bg-amber-50/50"
                                                >
                                                    Assign Technician
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-8 py-5"><StatusBadge status={ticket.status} /></td>
                                        <td className="px-8 py-5 text-right space-x-3">
                                            <button 
                                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => { setModal({ show: true, ticket, type: 'STATUS' }); setSelectedStatus(ticket.status); setResolutionNotes(ticket.resolutionNotes || ''); }}
                                                className="text-gray-400 hover:text-emerald-500 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {modal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all">
                    <div className="glass-card max-w-md w-full p-10 shadow-2xl border-white/20 relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase">
                            {modal.type === 'ASSIGN' ? 'Assign Technician' : 'Update Issue Status'}
                        </h3>
                        
                        <div className="space-y-6 mb-10">
                            {modal.type === 'ASSIGN' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Technician</label>
                                    <select 
                                        className="modern-input w-full"
                                        value={selectedTech}
                                        onChange={(e) => setSelectedTech(e.target.value)}
                                    >
                                        <option value="">Choose Technician</option>
                                        {technicians.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue Status</label>
                                        <select 
                                            className="modern-input w-full"
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                        >
                                            <option value="OPEN">OPEN</option>
                                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                                            <option value="RESOLVED">RESOLVED</option>
                                            <option value="CLOSED">CLOSED</option>
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
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <button onClick={() => setModal({ show: false, ticket: null })} className="text-xs font-bold text-gray-400 uppercase hover:text-gray-600 transition-colors">Cancel</button>
                            <button 
                                onClick={modal.type === 'ASSIGN' ? handleAssign : handleUpdateStatus}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
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

export default AdminTickets;
