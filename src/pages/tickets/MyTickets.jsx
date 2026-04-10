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

    const dots = {
        OPEN: "bg-amber-500",
        IN_PROGRESS: "bg-blue-500",
        RESOLVED: "bg-emerald-500",
        CLOSED: "bg-gray-500",
        REJECTED: "bg-rose-500"
    };

    return (
        <span className={`px-4 py-1.5 inline-flex items-center shadow-sm text-[11px] font-bold tracking-wider rounded-full border transition-all ${styles[status]}`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${dots[status]}`}></div>
            {status}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const styles = {
        LOW: "text-blue-400 font-bold",
        MEDIUM: "text-amber-500 font-extrabold",
        HIGH: "text-rose-500 font-extrabold underline decoration-2 underline-offset-4"
    };

    return (
        <span className={`text-[10px] tracking-widest uppercase ${styles[priority] || 'text-gray-400'}`}>
            {priority}
        </span>
    );
};

const MyTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getMyTickets();
            setTickets(data);
        } catch (err) {
            console.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Reported Issues</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">You have {tickets.length} reported issues.</p>
                </div>
                <button 
                    onClick={() => navigate('/tickets/create')}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Report an Issue
                </button>
            </div>

            {/* Data Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                        <thead className="bg-gray-50/50 dark:bg-white/5">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Issue ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Issue Priority</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Issue Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-500 font-medium"><div className="animate-pulse">Loading issues...</div></td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-500 font-medium">No issues found.</td></tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{ticket.id.toString().padStart(4, '0')}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{ticket.category}</div>
                                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={ticket.description}>{ticket.description}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <PriorityBadge priority={ticket.priority} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <StatusBadge status={ticket.status} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Reported</div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                className="px-6 py-2 border border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm hover:shadow-blue-500/20"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyTickets;
