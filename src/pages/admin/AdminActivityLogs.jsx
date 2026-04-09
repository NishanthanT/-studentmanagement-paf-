import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ActionBadge = ({ action }) => {
    const styles = {
        LOGIN: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
        SIGNUP: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
        RESOURCE_CREATED: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
        BOOKING_APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
        BOOKING_REJECTED: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
        TICKET_CREATED: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    };

    return (
        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border shadow-sm tracking-tight ${styles[action] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}>
            {action.replace('_', ' ')}
        </span>
    );
};

const AdminActivityLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await adminService.getActivityLogs();
            setLogs(data);
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadPDF = () => {
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Blue-600
        doc.text("SMART CAMPUS OPERATIONS HUB", 14, 22);
        
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text("System Activity Report", 14, 30);
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
        doc.text(`Total Records: ${filteredLogs.length}`, 14, 44);

        // Define table data
        const tableColumn = ["Date & Time", "User", "Activity", "Details"];
        const tableRows = filteredLogs.map(log => [
            `${new Date(log.timestamp).toLocaleDateString()} ${new Date(log.timestamp).toLocaleTimeString()}`,
            `${log.userName} (${log.userEmail})`,
            log.action.replace('_', ' '),
            log.details
        ]);

        // Generate table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { top: 50 },
            didDrawPage: (data) => {
                // Footer
                const str = `Page ${doc.internal.getNumberOfPages()}`;
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`system_logs_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">System Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">View all system and user activity.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search activity logs..." 
                            className="modern-input pl-10 pr-4 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button onClick={fetchLogs} className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:text-blue-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button onClick={downloadPDF} className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl shadow-sm border border-red-100 dark:border-red-800 hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
                        <thead className="bg-gray-50/50 dark:bg-white/5">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Date & Time</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Activity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest">Loading activity logs...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-bold">No activity logs found.</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] font-mono text-blue-500 font-bold">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-black text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                    {log.userName.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{log.userName}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 lowercase">{log.userEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <ActionBadge action={log.action} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 italic group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                {log.details}
                                            </div>
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

export default AdminActivityLogs;
