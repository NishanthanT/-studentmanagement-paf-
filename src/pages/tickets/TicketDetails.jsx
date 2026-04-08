import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
        IN_PROGRESS: "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
        RESOLVED: "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
        CLOSED: "bg-gray-100/80 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800",
        REJECTED: "bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800"
    };

    return (
        <span className={`px-5 py-2 inline-flex items-center shadow-lg text-xs font-bold tracking-widest rounded-full border transition-all ${styles[status]}`}>
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
            if (showLoader) setLoading(false);
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

    const handleDeleteClick = (commentId) => {
        setDeleteCommentId(commentId);
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditText(comment.commentText);
    };

    const handleEditComment = async (commentId) => {
        try {
            await ticketService.editComment(commentId, { commentText: editText });
            setEditingCommentId(null);
            await fetchTicket(false);
        } catch (err) {
            console.error('Failed to edit comment');
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

    const getFileName = (file, index) => {
        if (!file) return `Attachment ${index + 1}`;
        return typeof file === 'string' ? `Attachment ${index + 1}` : (file.fileName || `Attachment ${index + 1}`);
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-500 font-bold">In-depth inspection in progress...</div>;
    if (!ticket) return <div className="p-20 text-center text-rose-500 font-bold">Operational Record Not Found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Ticket Identity: #{ticket.id.toString().padStart(4, '0')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{ticket.category} — Reported on {new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Col: Core Details */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="glass-card p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-8">Detailed Inspection Log</h3>
                        
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Issue Description</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-lg italic bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                                    "{ticket.description}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocol Location</p>
                                            <p className="text-gray-900 dark:text-white font-extrabold">{ticket.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Identity</p>
                                            <p className="text-gray-900 dark:text-white font-extrabold">{ticket.preferredContact}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue Priority</p>
                                            <p className={`font-black ${ticket.priority === 'HIGH' ? 'text-rose-600' : 'text-blue-600'}`}>{ticket.priority}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resource</p>
                                            <p className="text-gray-900 dark:text-white font-extrabold">{ticket.resourceName || 'Global Area'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Gallery */}
                            {ticket.attachments && Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
                                <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Attachments</h4>
                                    <div className="flex flex-wrap gap-6">
                                        {ticket.attachments.map((file, index) => {
                                            const url = getImageUrl(file);
                                            if (!url) return null;
                                            return (
                                                <div 
                                                    key={index} 
                                                    onClick={() => setViewImage(url)}
                                                    className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-xl group cursor-pointer relative"
                                                >
                                                    <img src={url} alt={getFileName(file, index)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Resolution Notes */}
                            {ticket.resolutionNotes && (
                                <div className="pt-10 border-t border-gray-100 dark:border-gray-800 bg-emerald-50/20 dark:bg-emerald-900/10 p-8 rounded-3xl mt-10">
                                    <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-4">Fix Details</h4>
                                    <p className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{ticket.resolutionNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="glass-card p-10 space-y-10">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Comments</h3>
                        
                        <div className="space-y-8">
                            {ticket.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center font-black text-gray-500 text-sm shadow-sm ring-1 ring-white/20">
                                        {comment.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{comment.userName}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        
                                        {editingCommentId === comment.id ? (
                                            <div className="pt-2 flex flex-col gap-3">
                                                <textarea 
                                                    className="modern-input w-full h-20 text-sm"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                ></textarea>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditComment(comment.id)} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Save Changes</button>
                                                    <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:underline">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed bg-white/40 dark:bg-black/20 p-4 rounded-2xl rounded-tl-none border border-white/20">
                                                {comment.commentText}
                                            </p>
                                        )}
                                        
                                        {comment.userId === currentUser?.id && editingCommentId !== comment.id && (
                                            <div className="flex gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditing(comment)} className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600">Edit</button>
                                                <button onClick={() => handleDeleteClick(comment.id)} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddComment} className="pt-10 border-t border-gray-100 dark:border-gray-800">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-1">Add Message</label>
                            <div className="relative">
                                <textarea 
                                    className="modern-input w-full h-24 pl-4 pr-12 pt-4 resize-none"
                                    placeholder="Type your message here..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                ></textarea>
                                <button 
                                    type="submit"
                                    disabled={submittingComment}
                                    className="absolute bottom-4 right-4 z-20 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 transition-all p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Col: Assignments & Logistics */}
                <div className="space-y-8">
                    <div className="glass-card p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Assignment Details</h3>
                        
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50/50 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Assigned Technician</p>
                                {ticket.technicianName ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                            {ticket.technicianName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{ticket.technicianName}</p>
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Technician</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <p className="text-xs font-bold italic">Unassigned</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50/50 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Reported By</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-black text-sm">
                                        {ticket.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{ticket.userName}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase max-w-[150px] truncate" title={ticket.userEmail}>{ticket.userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 bg-blue-600 rounded-[2rem] text-white shadow-2xl shadow-blue-500/40 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mb-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em] mb-4">Need Help?</h4>
                        <p className="text-sm font-bold leading-relaxed mb-6">If you need urgent help, please contact support directly.</p>
                        <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-black tracking-tight" onClick={() => window.print()}>
                            Print Details
                        </Button>
                    </div>
                </div>
            </div>

            {/* Custom Modals */}
            {/* Delete Confirmation Modal */}
            {deleteCommentId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card max-w-sm w-full p-8 shadow-2xl space-y-6 transform scale-100 animate-slide-up border-rose-500/30">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-center text-gray-900 dark:text-white">Delete Comment?</h3>
                        <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium">This action cannot be undone. Are you completely sure?</p>
                        <div className="flex gap-4 pt-4">
                            <Button className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700" onClick={() => setDeleteCommentId(null)}>
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-500/20" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer Lightbox */}
            {viewImage && (
                <div 
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-fade-in cursor-pointer"
                    onClick={() => setViewImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all transform hover:scale-110 z-50"
                        onClick={() => setViewImage(null)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <img 
                        src={viewImage} 
                        alt="Enlarged view" 
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-black/50 animate-scale-up" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};

export default TicketDetails;
