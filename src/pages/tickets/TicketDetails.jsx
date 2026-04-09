import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketService } from '../../services/ticket.service';
import { useAuth } from '../../context/AuthContext';

const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        RESOLVED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        CLOSED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        REJECTED: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };

    return (
        <span className={`pro-badge ${styles[status]} px-4 py-1.5`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse-slow" />
            {status}
        </span>
    );
};

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    const [viewImage, setViewImage] = useState(null);

    const fetchTicket = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const data = await ticketService.getTicketById(id);
            setTicket(data);
        } catch (err) {
            console.error('Failed to fetch ticket details');
        } finally {
            if (showLoader) setTimeout(() => setLoading(false), 600);
            else setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket(true);
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || submittingComment) return;

        try {
            setSubmittingComment(true);
            await ticketService.addComment(id, { commentText });
            setCommentText('');
            await fetchTicket(false);
        } catch (err) {
            console.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteCommentId) return;
        try {
            await ticketService.deleteComment(deleteCommentId);
            setDeleteCommentId(null);
            await fetchTicket(false);
        } catch (err) {
            console.error('Failed to delete comment');
        }
    };

    const getImageUrl = (file) => {
        if (!file) return '';
        const path = typeof file === 'string' ? file : (file.filePath || file.url || file.imageUrl || '');
        if (!path) return '';
        const normalizedPath = path.replace(/\\/g, '/');
        if (normalizedPath.startsWith('http')) return normalizedPath;
        return `http://localhost:8080/${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
    };

    if (loading) return (
        <div className="p-20 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="animate-pulse-slow text-slate-500 font-bold uppercase tracking-[0.2em] font-display">Synchronizing Instance Data...</p>
        </div>
    );
    
    if (!ticket) return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 text-center text-rose-500 font-bold uppercase tracking-[0.2em] font-display"
        >
            Deployment Error: Resource ID Unavailable.
        </motion.div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[1440px] mx-auto space-y-12 pb-20 px-4"
        >
            {/* Strategic Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 pt-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <motion.span whileHover={{ x: -2, color: "#2563eb" }} className="cursor-pointer" onClick={() => navigate('/technician/assigned')}>Assigned Matrix</motion.span>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-900 dark:text-white">Ticket Intelligence</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 40 }}
                            className="bg-blue-600 w-1.5 rounded-full"
                        ></motion.div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-widest uppercase font-display leading-tight">CASE-{ticket.id.toString().padStart(4, '0')}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <StatusBadge status={ticket.status} />
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)} 
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl shadow-black/5 text-slate-400"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Main Intel Stream */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 space-y-10"
                >
                    {/* Primary Report Data */}
                    <div className="glass-panel-heavy p-10 rounded-[2.5rem] relative overflow-hidden">
                        <div className="noise-overlay"></div>
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                        
                        <div className="relative space-y-10">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-blue-600"></span>
                                    Operational Description
                                </h4>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-slate-500/[0.03] dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-100 dark:border-white/5"
                                >
                                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-bold text-2xl tracking-tight leading-snug">
                                        "{ticket.description}"
                                    </p>
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                {[
                                    { label: 'Deployment Location', value: ticket.location, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                                    { label: 'Priority Matrix', value: ticket.priority, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: ticket.priority === 'HIGH' ? 'text-rose-600 font-display' : 'text-blue-600' },
                                    { label: 'Stakeholder Channel', value: ticket.preferredContact, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                                    { label: 'Asset Reference', value: ticket.resourceName || 'Global Grid Infrastructure', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
                                ].map((item, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        whileHover={{ x: 4 }}
                                        className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-500/5 transition-all group/item cursor-default"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover/item:border-blue-600 group-hover/item:text-blue-600 transition-all shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                            <p className={`text-[15px] font-black tracking-tight uppercase ${item.color || 'text-slate-900 dark:text-white'}`}>{item.value}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Attachments */}
                            <AnimatePresence>
                                {ticket.attachments && ticket.attachments.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="pt-10 border-t border-slate-100 dark:border-white/5"
                                    >
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Verification Artifacts</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {ticket.attachments.map((file, index) => {
                                                const url = getImageUrl(file);
                                                return url ? (
                                                    <motion.div 
                                                        key={index} 
                                                        whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 2 : -2 }}
                                                        onClick={() => setViewImage(url)}
                                                        className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 group cursor-pointer relative shadow-sm transition-all duration-300"
                                                    >
                                                        <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </div>
                                                    </motion.div>
                                                ) : null;
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Operational Thread */}
                    <div className="glass-panel-heavy p-10 rounded-[2.5rem] space-y-10 relative">
                        <div className="noise-overlay"></div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
                            <span className="w-8 h-[2px] bg-slate-300 dark:bg-slate-700"></span>
                            Incident Timeline & Communication
                        </h3>
                        
                        <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 modern-scrollbar relative z-10">
                            <AnimatePresence mode="popLayout">
                                {ticket.comments.map((comment, index) => (
                                    <motion.div 
                                        key={comment.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex gap-6 group"
                                    >
                                        <div className="shrink-0">
                                            <motion.div 
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-slate-400 dark:text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all text-sm border border-slate-200/50 uppercase shadow-sm"
                                            >
                                                {comment.userName.charAt(0)}
                                            </motion.div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{comment.userName}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            
                                            <div className="bg-slate-50 dark:bg-white/2 p-5 rounded-2xl rounded-tl-none border border-slate-100 dark:border-white/5 shadow-sm group-hover:border-blue-600/20 transition-all">
                                                <p className="text-slate-700 dark:text-slate-300 text-[15px] font-medium leading-relaxed">
                                                    {comment.commentText}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <form onSubmit={handleAddComment} className="pt-10 border-t border-slate-100 dark:border-white/5 relative z-10">
                            <div className="relative group/input">
                                <textarea 
                                    className="modern-input w-full h-32 pl-6 pr-20 pt-6 resize-none text-[15px] font-bold placeholder:font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:h-40 transition-all duration-300"
                                    placeholder="Enter case update or intelligence brief..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                ></textarea>
                                <motion.button 
                                    whileHover={{ scale: 1.1, x: 2 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="submit"
                                    disabled={submittingComment}
                                    className="absolute bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-xl disabled:opacity-50 transition-all flex items-center justify-center shadow-xl shadow-blue-500/30 active:scale-95"
                                >
                                    {submittingComment ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Sidebar Logistics */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 space-y-10 lg:sticky lg:top-10"
                >
                    <div className="glass-panel-heavy p-8 rounded-[2.5rem] space-y-10 relative">
                        <div className="noise-overlay"></div>
                        {/* Assignment Status */}
                        <section className="space-y-6 relative z-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-slate-300 dark:bg-slate-700"></span>
                                Assignment Detail
                            </h3>
                            {ticket.technicianName ? (
                                <motion.div 
                                    whileHover={{ y: -2 }}
                                    className="p-4 bg-slate-900 rounded-3xl border border-slate-800 flex items-center gap-4 group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/30 group-hover:rotate-12 transition-transform">
                                        {ticket.technicianName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-white tracking-tighter truncate">{ticket.technicianName}</p>
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Lifecycle Custodian</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3 grayscale opacity-50">
                                    <svg className="w-10 h-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment Pending</p>
                                </div>
                            )}
                        </section>

                        {/* Stakeholder Insight */}
                        <section className="space-y-6 relative z-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-slate-300 dark:bg-slate-700"></span>
                                Stakeholder Data
                            </h3>
                            <motion.div 
                                whileHover={{ x: 2 }}
                                className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 text-sm">
                                        {ticket.userName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{ticket.userName}</p>
                                        <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">{ticket.userEmail}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4 relative z-10">
                             <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.print()} 
                                className="w-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-800"
                             >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Generate Intel Report
                            </motion.button>
                            {ticket.resolutionNotes && (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-6 bg-emerald-600 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 group cursor-default"
                                >
                                    <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-100 mb-3 opacity-80">Resolution Status</h5>
                                    <p className="text-lg font-black tracking-tight leading-snug">Incident Successfully Mitigated</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Media Zoom Overlay */}
            <AnimatePresence>
                {viewImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-slate-950/98 backdrop-blur-3xl cursor-zoom-out"
                        onClick={() => setViewImage(null)}
                    >
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 30 }}
                            src={viewImage} 
                            alt="High Res Telemetry" 
                            className="max-w-full max-h-full object-contain rounded-[3rem] shadow-3xl border border-white/5" 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TicketDetails;
