import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import Button from '../../components/common/Button';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    profileImage: null
  });
  
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getCurrentProfile();
      setUser(data);
      setFormData({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        profileImage: data.profileImage || null
      });
    } catch (err) {
      showAlert('Failed to load profile data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-format phone number XXX-XXXX-XXX
    if (name === 'phoneNumber') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 3) {
        value = digits;
      } else if (digits.length <= 7) {
        value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        value = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 10)}`;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showAlert('Image must be smaller than 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result }); // Base64 encoding
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validate Phone Number
    const phoneRegex = /^\d{3}-\d{4}-\d{3}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      showAlert('Phone number must be exactly 10 digits in XXX-XXXX-XXX format.', 'error');
      return;
    }

    try {
      setSaving(true);
      await userService.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        profileImage: formData.profileImage
      });
      showAlert('Profile saved successfully.', 'success');
      await fetchProfile(); // Fresh generic reload mapping actual DB states.
      setIsEditing(false);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      profileImage: user.profileImage || null
    });
  };

  const handleDownloadQR = async () => {
    try {
      const qrData = `http://${window.location.host}/verify-id/${user?.id}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Smart-Campus-ID-${user.fullName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert('Failed to download QR Code. Try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-gray-900 dark:text-gray-100 pb-10">
      
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

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl overflow-hidden relative group transition-all">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="px-8 py-12 relative z-10 flex flex-col items-center lg:flex-row flex-wrap gap-8 justify-between">
          
          {/* Real Avatar System */}
          <div className="relative isolate group/avatar shrink-0">
            {/* Spinning Gradient Animation Ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-70 blur-[2px] animate-spin [animation-duration:4s]"></div>
            
            <div className={`w-36 h-36 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${isEditing ? 'border-dashed border-blue-400 cursor-pointer hover:scale-105 transition-transform' : 'border-white dark:border-gray-800'} overflow-hidden relative bg-white dark:bg-gray-800 z-10`}
                 onClick={() => isEditing && fileInputRef.current?.click()}
            >
              {(isEditing ? formData.profileImage : user.profileImage) ? (
                <img src={isEditing ? formData.profileImage : user.profileImage} alt="Profile Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-blue-600 dark:text-blue-400">{user.fullName.charAt(0).toUpperCase()}</span>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="text-center lg:text-left text-white mt-4 lg:mt-0 flex-1 min-w-0">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md truncate">{user.fullName}</h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center lg:items-start text-blue-100 dark:text-gray-300">
              <span className="flex items-center gap-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {user.email}</span>
              <span className="inline-flex items-center px-3 py-1 bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-full text-sm font-bold tracking-wide uppercase shadow-sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> {user.role}
              </span>
            </div>
          </div>

          {!isEditing && (
            <div className="mt-4 lg:mt-0 self-center lg:self-start flex flex-col sm:flex-row gap-3 border-2 border-white/20 dark:border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm p-1 shrink-0">
              <button 
                onClick={() => setShowQRModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                Smart ID Card
              </button>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/40 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Details Panel Wrapper */}
      <div className="relative group/panel">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-blue-500/30 rounded-[2rem] blur-xl opacity-50 group-hover/panel:opacity-80 transition duration-1000 group-hover/panel:duration-500 animate-pulse"></div>
        
        {/* Main Details Panel */}
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 dark:border-gray-700/50 p-8 pt-10 relative overflow-hidden transition-all duration-300 z-10 w-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-10 -mt-10 blur-2xl opacity-50"></div>
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
          {isEditing ? 'Edit Profile Details' : 'Profile Information'}
        </h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your name..."
                className="modern-input w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Contact No</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter contact number..."
                className="modern-input w-full"
              />
            </div>

            <div className="md:col-span-2 pt-6 flex flex-col sm:flex-row gap-4 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
              >
                {saving ? (
                  <><svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Updating...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Update Profile</>
                )}
              </button>
              <button 
                onClick={cancelEdit}
                disabled={saving}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all active:scale-95"
              >
                Cancel Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-5 rounded-2xl border border-white/60 dark:border-gray-600/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 rounded-lg shadow-inner group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Name</h4>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:translate-x-1 transition-transform drop-shadow-sm">{user.fullName}</p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-5 rounded-2xl border border-white/60 dark:border-gray-600/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100/80 dark:bg-purple-900/50 text-purple-600 rounded-lg shadow-inner group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Email</h4>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate group-hover:translate-x-1 transition-transform drop-shadow-sm" title={user.email}>{user.email}</p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-5 rounded-2xl border border-white/60 dark:border-gray-600/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-600 rounded-lg shadow-inner group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Contact No</h4>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:translate-x-1 transition-transform drop-shadow-sm">{user.phoneNumber || 'N/A'}</p>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-5 rounded-2xl border border-white/60 dark:border-gray-600/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100/80 dark:bg-orange-900/50 text-orange-600 rounded-lg shadow-inner group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Created Date</h4>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:translate-x-1 transition-transform drop-shadow-sm">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-950/80 backdrop-blur-md px-4 transition-all animate-fade-in" onClick={() => setShowQRModal(false)}>
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#0B0D17] shadow-2xl z-[160] rounded-3xl flex flex-col items-center overflow-hidden border border-gray-200 dark:border-white/10 p-8 relative animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full bg-gray-100 dark:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-1">Campus ID Badge</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center mb-8 uppercase tracking-widest leading-relaxed">Present this code to campus security for full access validation.</p>
            
            <div className="bg-white p-3 rounded-2xl shadow-inner border border-gray-100 ring-4 ring-blue-50 dark:ring-blue-900/20 mb-8">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`http://${window.location.host}/verify-id/${user.id}`)}`} 
                alt="Smart ID QR Code" 
                className="w-48 h-48 rounded-xl object-contain"
                crossOrigin="anonymous"
              />
            </div>

            <button 
              onClick={handleDownloadQR}
              className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download QR Code
            </button>
          </div>
        </div>
      )}

    </div>
    </div>
  );
};

export default Profile;
