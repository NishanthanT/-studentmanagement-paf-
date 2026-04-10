import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import UserDetailedDrawer from '../../components/admin/UserDetailedDrawer';

const ActionModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isDanger, reason, setReason, showReasonField }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in">
      <div className="glass-card max-w-md w-full p-8 shadow-2xl border-white/20 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isDanger ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
        <p className={`text-gray-500 dark:text-gray-400 ${showReasonField ? 'mb-4' : 'mb-8'} leading-relaxed font-medium`}>{message}</p>
        
        {showReasonField && (
           <div className="mb-8">
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Reason for Deletion</label>
             <textarea 
               className="modern-input w-full min-h-[80px] p-3 text-sm resize-none" 
               placeholder="Please enter the reason (sent to user via email)..."
               value={reason}
               onChange={(e) => setReason(e.target.value)}
             ></textarea>
           </div>
        )}
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

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, targetUser: null, targetValue: null });
  const [deleteReason, setDeleteReason] = useState('');
  const [drawerConfig, setDrawerConfig] = useState({ isOpen: false, userId: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(searchTerm, roleFilter, statusFilter);
      setUsers(data);
    } catch (err) {
      showAlert('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'success' }), 4000);
  };

  const openModal = (type, targetUser, targetValue = null) => {
    if (type === 'DELETE' && targetUser.email === currentUser?.email) {
      showAlert("You cannot delete your own active Admin account.", "error");
      return;
    }
    setModalConfig({ isOpen: true, type, targetUser, targetValue });
  };

  const closeModal = () => {
     setModalConfig({ isOpen: false, type: null, targetUser: null, targetValue: null });
     setDeleteReason('');
  };

  const executeAction = async () => {
    const { type, targetUser, targetValue } = modalConfig;
    if (!targetUser) return;
    
    closeModal();
    try {
      if (type === 'ROLE') {
        const res = await adminService.updateRole(targetUser.id, targetValue);
        showAlert(res.message);
      } else if (type === 'STATUS') {
        const res = await adminService.updateStatus(targetUser.id, targetValue);
        showAlert(res.message);
      } else if (type === 'DELETE') {
        const res = await adminService.deleteUser(targetUser.id, deleteReason);
        showAlert(res.message);
      }
      fetchUsers();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const downloadPdf = async () => {
    try {
      showAlert('Generating PDF... Please wait.', 'success');
      const blobData = await adminService.exportUsersPdf(searchTerm, roleFilter, statusFilter);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a'); // fixed from 'href'
      link.href = url;
      link.setAttribute('download', 'users_audit_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showAlert('Failed to export PDF format. Ensure filters match database payloads.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
      
      {/* Dynamic Ribbon */}
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

      {/* Modern Filter Dashboard Ribbon */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 rounded-l-2xl group-hover:bg-blue-500 transition-colors"></div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 pl-4 tracking-tight">Manage Users</h2>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pl-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row flex-1 w-full gap-6 items-end">
            <div className="flex-1 w-full relative">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Search Users</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  className="modern-input w-full pl-12 pr-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            
            <div className="w-full sm:w-56 relative">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Filter by Role</label>
              <select 
                className="modern-input w-full cursor-pointer appearance-none pr-10"
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles ▾</option>
                <option value="USER">USER</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            
            <div className="w-full sm:w-56 relative">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Filter by Status</label>
              <select 
                className="modern-input w-full cursor-pointer appearance-none pr-10"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses ▾</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              Search
            </button>
          </form>

          <button 
            type="button"
            onClick={downloadPdf} 
            className="w-full lg:w-auto px-10 py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-blue-50 text-white dark:text-gray-900 font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Users Report
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/40 dark:divide-white/5">
            <thead className="bg-gray-50/50 dark:bg-white/5">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">User</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Contact Info</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-16 text-center text-gray-500 font-medium"><div className="animate-pulse">Loading Users...</div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-16 text-center text-gray-500 font-medium">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div 
                        className="flex items-center cursor-pointer group"
                        onClick={() => setDrawerConfig({ isOpen: true, userId: user.id })}
                      >
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-100 font-bold shadow-inner border border-blue-50 dark:border-blue-700 text-lg group-hover:scale-105 transition-transform">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-5">
                          <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{user.fullName}</div>
                          <div className="text-xs text-blue-500 dark:text-blue-400 font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">View Details</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.email}</div>
                      <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">{user.phoneNumber || 'Internal Contact Pending'}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <select 
                        value={user.role} 
                        onChange={(e) => openModal('ROLE', user, e.target.value)}
                        className={`text-xs rounded-full px-4 py-1.5 font-bold border-none cursor-pointer focus:ring-2 shadow-sm appearance-none pr-8 relative transition-shadow ${
                          user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 hover:shadow-md' :
                          user.role === 'TECHNICIAN' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 hover:shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:shadow-md'
                        }`}
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                      >
                        <option value="USER">USER</option>
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <button 
                        onClick={() => openModal('STATUS', user, user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
                        className={`px-4 py-1.5 inline-flex shadow-sm text-xs font-bold tracking-wide rounded-full transition-all active:scale-95 border ${
                          user.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-800/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 my-auto ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        {user.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                      </button>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openModal('DELETE', user)}
                        className="text-red-500 dark:text-red-400 hover:text-white border border-red-500 dark:border-red-400 hover:bg-red-500 dark:hover:bg-red-600 px-4 py-1.5 rounded-lg font-bold transition-colors shadow-sm"
                      >
                        Remove User
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ActionModal 
        isOpen={modalConfig.isOpen}
        title={
          modalConfig.type === 'DELETE' ? 'Remove User' :
          modalConfig.type === 'STATUS' ? 'Update User Status' : 'Update User Role'
        }
        message={
          modalConfig.type === 'DELETE' 
            ? `Are you sure you want to remove ${modalConfig.targetUser?.fullName}? This action cannot be undone.`
            : `Are you sure you want to update ${modalConfig.targetUser?.fullName}'s ${modalConfig.type ? modalConfig.type.toLowerCase() : ''} to ${modalConfig.targetValue}?`
        }
        confirmText={modalConfig.type === 'DELETE' ? 'Remove' : 'Save Changes'}
        isDanger={modalConfig.type === 'DELETE'}
        showReasonField={modalConfig.type === 'DELETE'}
        reason={deleteReason}
        setReason={setDeleteReason}
        onCancel={closeModal}
        onConfirm={executeAction}
      />

      <UserDetailedDrawer 
        isOpen={drawerConfig.isOpen}
        userId={drawerConfig.userId}
        onClose={() => setDrawerConfig({ isOpen: false, userId: null })}
      />
    </div>
  );
};

export default AdminUsers;
