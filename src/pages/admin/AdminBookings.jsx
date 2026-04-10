import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminBookingService } from '../../services/booking.service';
import { adminService } from '../../services/admin.service';
import { resourceService } from '../../services/resource.service';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    APPROVED: "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    REJECTED: "bg-rose-100/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    CANCELLED: "bg-gray-100/80 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
  };

  const dots = {
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-500",
    REJECTED: "bg-rose-500",
    CANCELLED: "bg-gray-500"
  };

  return (
    <span className={`px-4 py-1.5 inline-flex items-center shadow-sm text-[11px] font-bold tracking-wider rounded-full border transition-all ${styles[status] || styles.PENDING}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${dots[status] || dots.PENDING}`}></div>
      {status}
    </span>
  );
};

const ActionModal = ({ isOpen, title, children, onConfirm, onCancel, confirmText, isDanger, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in">
      <div className="glass-card max-w-md w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isDanger ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
        <div className="mb-8">{children}</div>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
            Cancel
          </button>
          <button 
            disabled={isLoading}
            onClick={onConfirm} 
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
          >
            {isLoading ? 'Processing...' : confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const [modalType, setModalType] = useState(null); // 'APPROVE' or 'REJECT'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources');
    }
  };

  const fetchBookings = async (customFilters = null) => {
    try {
      setLoading(true);
      let response;
      if (customFilters) {
        response = await adminBookingService.filterBookings(customFilters);
      } else if (searchTerm) {
        response = await adminBookingService.searchBookings(searchTerm);
      } else {
        const activeFilters = {};
        if (statusFilter) activeFilters.status = statusFilter;
        if (resourceFilter) activeFilters.resourceId = resourceFilter;
        if (dateFilter) activeFilters.date = dateFilter;
        
        response = Object.keys(activeFilters).length > 0 
          ? await adminBookingService.filterBookings(activeFilters)
          : await adminBookingService.getAllBookings();
      }
      setBookings(response.data);
    } catch (err) {
      showAlert('Failed to fetch booking records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchBookings();
  }, [statusFilter, resourceFilter, dateFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setResourceFilter('');
    setDateFilter('');
    fetchBookings({});
  };

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      await adminBookingService.approveBooking(selectedBooking.id);
      showAlert('Booking approved successfully');
      setModalType(null);
      fetchBookings();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
        showAlert('Please provide a rejection reason', 'error');
        return;
    }
    try {
      setActionLoading(true);
      await adminBookingService.rejectBooking(selectedBooking.id, rejectionReason);
      showAlert('Booking rejected successfully');
      setModalType(null);
      setRejectionReason('');
      fetchBookings();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      showAlert('Generating PDF... Please wait.', 'success');
      const activeFilters = {};
      if (statusFilter) activeFilters.status = statusFilter;
      if (resourceFilter) activeFilters.resourceId = resourceFilter;
      if (dateFilter) activeFilters.date = dateFilter;
      if (searchTerm) activeFilters.userName = searchTerm;

      const blobData = await adminService.exportBookingsPdf(activeFilters);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings_audit_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showAlert('Failed to export PDF format.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto text-gray-900 dark:text-gray-100 pb-20">
      
      {/* Alert Ribbon */}
      <div className={`transition-all duration-300 ease-in-out ${alertInfo.show ? 'opacity-100 max-h-20 mb-6' : 'opacity-0 max-h-0 overflow-hidden m-0'}`}>
        <div className={`p-4 rounded-xl shadow-sm font-medium text-sm border flex items-center gap-3 ${
          alertInfo.type === 'error' ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800'
        }`}>
          {alertInfo.type === 'error' ? (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {alertInfo.message}
        </div>
      </div>

      {/* Filter Dashboard */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 rounded-l-2xl group-hover:bg-blue-500 transition-colors"></div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 pl-4 tracking-tight">Booking Requests</h2>
        
        <div className="pl-4 space-y-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Search Requests</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search requests..." 
                  className="modern-input w-full pl-10 pr-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Filter by Status</label>
              <select 
                className="modern-input w-full cursor-pointer appearance-none pr-10"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All States ▾</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Resource</label>
              <select 
                className="modern-input w-full cursor-pointer appearance-none pr-10"
                value={resourceFilter} 
                onChange={(e) => setResourceFilter(e.target.value)}
              >
                <option value="">All Resources ▾</option>
                {resources.map(res => (
                  <option key={res.id} value={res.id}>{res.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Date</label>
              <input 
                type="date"
                className="modern-input w-full cursor-pointer"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-1 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
              >
                Search
              </button>
              <button 
                type="button"
                onClick={resetFilters}
                className="px-4 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl active:scale-95 transition-all text-xs"
              >
                Reset
              </button>
            </div>
            
            <div className="flex items-end">
              <button 
                type="button"
                onClick={downloadPdf} 
                className="w-full px-8 py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-blue-50 text-white dark:text-gray-900 font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs"
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export Audit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
            <thead className="bg-gray-50/50 dark:bg-white/5">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Booking ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">User</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Resource</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Date & Time</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Request Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-500 font-medium"><div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading requests...
                </div></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-500 font-medium">No requests found.</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono font-bold text-gray-400">#{booking.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                          {booking.userName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{booking.userName}</div>
                          <div className="text-xs text-gray-400 font-medium">{booking.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{booking.resourceName}</div>
                      <div className="text-xs text-blue-500 font-semibold">{booking.resourceType}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs text-gray-400 font-medium">{booking.startTime.substring(0,5)} - {booking.endTime.substring(0,5)}</div>
                      <div className="text-[10px] mt-1 text-gray-400 italic">Booking Purpose: {booking.purpose}</div>
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={booking.status} />
                      {booking.rejectionReason && (
                        <div className="text-[10px] mt-1.5 text-red-400 max-w-[150px] truncate" title={booking.rejectionReason}>
                          Reason: {booking.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => { setSelectedBooking(booking); setModalType('APPROVE'); }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                          >
                            Approve Request
                          </button>
                          <button 
                            onClick={() => { setSelectedBooking(booking); setModalType('REJECT'); }}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-500/20 active:scale-95"
                          >
                            Reject Request
                          </button>
                        </>
                      )}
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="View Detailed Logistics">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Confirmation */}
      <ActionModal
        isOpen={modalType === 'APPROVE'}
        title="Approve Request"
        confirmText="Approve Request"
        isLoading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setModalType(null)}
      >
        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          Are you sure you want to approve this booking for <span className="text-blue-600 font-bold">{selectedBooking?.resourceName}</span>?
        </p>
      </ActionModal>

      {/* Rejection with Reason */}
      <ActionModal
        isOpen={modalType === 'REJECT'}
        title="Reject Request"
        confirmText="Reject Request"
        isDanger={true}
        isLoading={actionLoading}
        onConfirm={handleReject}
        onCancel={() => setModalType(null)}
      >
        <div className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Please document the specific reason for rejecting the booking request for {selectedBooking?.userName}. This will be communicated to the user.
          </p>
          <textarea
            className="modern-input w-full h-32 resize-none"
            placeholder="e.g., Resource under maintenance, Time slot conflict, etc."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          ></textarea>
        </div>
      </ActionModal>

    </div>
  );
};

export default AdminBookings;
