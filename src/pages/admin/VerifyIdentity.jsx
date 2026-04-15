import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';

const VerifyIdentity = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUserDetails(userId);
        setDetails(data.profile);
      } catch (err) {
        setError('Verification Failed: User Identity Not Found.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] w-full max-w-md mx-auto space-y-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-transparent border-b-cyan-400 rounded-full animate-spin absolute inset-0 style={{ animationDirection: 'reverse', animationDuration: '1s' }}"></div>
        </div>
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] animate-pulse text-sm">Authenticating Secure ID...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#0B0D17] border-2 border-red-500/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-zoom-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">Invalid ID Badge</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">This QR Code is invalid, expired, or the user has been completely expunged from the system registry.</p>
            <button onClick={() => navigate('/admin/dashboard')} className="w-full py-4 text-xs font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-black rounded-xl shadow-lg transition-all active:scale-95">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const isBlocked = details.status === 'BLOCKED';

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 w-full">
      <div className={`w-full max-w-md bg-white dark:bg-[#0B0D17] rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up border-4 ${isBlocked ? 'border-red-500 shadow-red-500/20' : 'border-emerald-500 shadow-emerald-500/20'} relative`}>
        
        {/* Status Header Ribbon */}
        <div className={`px-6 py-4 flex items-center justify-center gap-2 ${isBlocked ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
            {isBlocked ? (
                <><svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg><span className="text-lg font-black uppercase tracking-[0.2em] shadow-black">Access Denied</span></>
            ) : (
                <><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-lg font-black uppercase tracking-[0.2em]">Verified Secure</span></>
            )}
        </div>

        <div className="p-8 flex flex-col items-center text-center relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
            
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 bg-gray-100 flex items-center justify-center mb-5 z-10 shadow-xl ${isBlocked ? 'border-red-200' : 'border-emerald-200'}`}>
                {details.profileImage ? (
                    <img src={details.profileImage} alt={details.fullName} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl font-black text-gray-400">{details.fullName.charAt(0)}</span>
                )}
            </div>

            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{details.fullName}</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">{details.role}</p>

            <div className="w-full space-y-4 mb-8 text-left bg-gray-50/50 dark:bg-white/5 p-5 rounded-2xl">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Identifier</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{details.email}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Contact</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{details.phoneNumber || 'Not Provided'}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] tracking-widest font-black uppercase ${isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {details.status}
                    </span>
                </div>
            </div>

            <button onClick={() => navigate('/admin/dashboard')} className="w-full py-4 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl transition-all">Close Verification</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;
