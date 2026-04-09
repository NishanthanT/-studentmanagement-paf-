import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketService } from '../../services/ticket.service';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { SkeletonCard, SkeletonRow, SkeletonChart } from '../../components/common/SkeletonLoaders';

const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        RESOLVED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        CLOSED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        REJECTED: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };
    return (
        <span className={`pro-badge ${styles[status]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-slow" />
            {status.replace('_', ' ')}
        </span>
    );
};

const PriorityIndicator = ({ priority }) => {
    const colors = {
        LOW: "bg-blue-500",
        MEDIUM: "bg-amber-500",
        HIGH: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
    };
    return (
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{priority}</span>
        </div>
    );
};

const KPICard = ({ title, value, icon, gradient, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="glass-panel-heavy p-8 rounded-[2rem] flex items-center gap-6 group overflow-hidden relative cursor-default"
    >
        <div className="noise-overlay"></div>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:scale-150 group-hover:opacity-10 transition-all duration-1000`}></div>
        <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-black/5 relative z-10"
        >
            {icon}
        </motion.div>
        <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h4>
        </div>
    </motion.div>
);

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
            // Add a small artificial delay for smoother skeleton transition
            setTimeout(() => setLoading(false), 800);
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

    const stats = {
        total: tickets.length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        critical: tickets.filter(t => t.priority === 'HIGH').length
    };

    const chartData = [
        { name: 'Low', count: tickets.filter(t => t.priority === 'LOW').length, color: '#3b82f6' },
        { name: 'Medium', count: tickets.filter(t => t.priority === 'MEDIUM').length, color: '#f59e0b' },
        { name: 'High', count: tickets.filter(t => t.priority === 'HIGH').length, color: '#f43f5e' }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 max-w-[1440px] mx-auto pb-20 px-4"
        >
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pt-10">
                <motion.div variants={rowVariants} className="space-y-3">
                    <div className="flex items-center gap-3">
                        <motion.span 
                            initial={{ width: 0 }}
                            animate={{ width: 40 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="h-[2px] bg-blue-600 rounded-full"
                        ></motion.span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Operational Intelligence</span>
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-widest uppercase font-display leading-tight">Command Center</h2>
                    <p className="text-slate-500 font-medium text-lg tracking-tight">Real-time oversight of assigned incident resolution pipelines.</p>
                </motion.div>
                <motion.div variants={rowVariants}>
                    <button 
                      onClick={fetchTickets}
                      className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl shadow-black/5 flex items-center gap-3 group active:scale-95"
                    >
                      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync Intelligence
                    </button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Analytics */}
                <motion.div variants={rowVariants} className="lg:col-span-1 glass-panel-heavy p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden">
                    <div className="noise-overlay"></div>
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Priority Distribution</h4>
                        {loading ? (
                            <SkeletonChart />
                        ) : (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} 
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 800}}
                                            cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* KPI Suite */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <div className="p-8 bg-slate-900 rounded-[2rem] flex items-center justify-center">
                                <span className="animate-pulse text-slate-500 font-black text-[10px] uppercase tracking-widest">Compiling Analytics...</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <KPICard 
                                title="Incident Workload" 
                                value={stats.total} 
                                gradient="from-blue-600 to-indigo-600"
                                index={1}
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                            />
                            <KPICard 
                                title="Critical Escalations" 
                                value={stats.critical} 
                                gradient="from-rose-600 to-pink-600"
                                index={2}
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                            />
                            <KPICard 
                                title="Active Cycles" 
                                value={stats.inProgress} 
                                gradient="from-amber-600 to-orange-600"
                                index={3}
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-center relative overflow-hidden group cursor-default"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 opacity-20 blur-3xl rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700"></div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Operational Status</h5>
                                <p className="text-xl font-bold tracking-tight mb-2">Systems Nominal</p>
                                <p className="text-sm font-medium text-slate-400">Next intelligence sync at {new Date(Date.now() + 15 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>

            {/* Operational Table */}
            <motion.div variants={rowVariants} className="glass-panel-heavy rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-2xl relative">
                <div className="noise-overlay"></div>
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-500/[0.03] border-b border-slate-200/50 dark:border-white/5 text-center">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 font-display">Ident</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-display">Stakeholder</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-display">Context & Resource</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-display">Telemetry</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right font-display">Commit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            <AnimatePresence mode='wait'>
                                {loading ? (
                                    [...Array(5)].map((_, i) => <SkeletonRow key={`skeleton-${i}`} />)
                                ) : tickets.length === 0 ? (
                                    <motion.tr 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan="5" className="px-10 py-48 text-center text-slate-300 dark:text-slate-600 font-extrabold tracking-widest uppercase italic">Operational Void: No active tasks.</td>
                                    </motion.tr>
                                ) : (
                                    tickets.map((ticket, index) => (
                                        <motion.tr 
                                            key={ticket.id} 
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-blue-500/[0.04] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        >
                                            <td className="px-10 py-8 text-center" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                                                <span className="text-[11px] font-black font-mono text-slate-400 dark:text-slate-700 group-hover:text-blue-600 transition-colors">
                                                    #{ticket.id.toString().padStart(4, '0')}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-sm font-black border border-slate-200 dark:border-white/10 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:rotate-[360deg] transition-all duration-500 uppercase">
                                                        {ticket.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{ticket.userName}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            Direct Communication Channel
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                                                <div className="text-[14px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">{ticket.category}</div>
                                                <div className="text-[9px] font-black text-blue-600 bg-blue-600/5 px-3 py-1 rounded-md inline-block uppercase tracking-widest border border-blue-600/10">{ticket.resourceName || 'Global Grid'}</div>
                                            </td>
                                            <td className="px-10 py-8" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                                                <div className="space-y-4">
                                                    <PriorityIndicator priority={ticket.priority} />
                                                    <StatusBadge status={ticket.status} />
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                        className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-400 flex items-center justify-center shadow-lg shadow-black/5"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => { setModal({ show: true, ticket }); setSelectedStatus(ticket.status); setResolutionNotes(ticket.resolutionNotes || ''); }}
                                                        className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Resolution Modal */}
            <AnimatePresence>
                {modal.show && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md px-6 shadow-2xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="glass-panel-heavy max-w-xl w-full p-12 rounded-[3.5rem] border-white/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 opacity-5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                            
                            <div className="text-center mb-12">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase font-display leading-tight">Resolution Commit</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Operational Unit ID #{modal.ticket.id.toString().padStart(4, '0')}</p>
                            </div>
                            
                            <div className="space-y-10 mb-14">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lifecycle Lifecycle Status</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((stat) => (
                                            <motion.button
                                                key={stat}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedStatus(stat)}
                                                className={`py-4 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                                                    selectedStatus === stat 
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/40' 
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-500/30'
                                                }`}
                                            >
                                                {stat.replace('_', ' ')}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technical Implementation Notes</label>
                                    <textarea 
                                        className="modern-input w-full h-48 resize-none text-[15px] font-bold p-6 leading-relaxed"
                                        placeholder="Enter the technical resolution steps for audit purposes..."
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <motion.button 
                                    whileHover={{ x: -2 }}
                                    onClick={() => setModal({ show: false, ticket: null })} 
                                    className="flex-1 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors bg-slate-100 dark:bg-white/5 rounded-2xl"
                                >
                                    Abort Update
                                </motion.button>
                                <motion.button 
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUpdateStatus}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-[11px] font-black shadow-2xl shadow-blue-500/30 transition-all uppercase tracking-[0.2em]"
                                >
                                    Commit to Pipeline
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AssignedTickets;
