import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth.service';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP verification code');
      return;
    }
    
    try {
      await authService.verifyOtp(email, otp);
      navigate('/reset-password', { state: { email, otpCode: otp } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    }
  };

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email);
      alert('A new OTP has been successfully sent to your email.');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-[#0B0D17]/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-card max-w-md w-full p-10 space-y-10 relative z-10 animate-fade-in border-white/30">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 group hover:scale-110 transition-transform duration-300">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11v5m0 0l-2-2m2 2l2-2m-2-8a9 9 0 110 18 9 9 0 010-18z"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            OTP <span className="text-blue-600 dark:text-blue-400">Verification</span>
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            We've sent a verification code to <span className="font-bold text-blue-600 dark:text-blue-400">{email}</span>.
            Please enter the verification code below to proceed.
          </p>
        </div>
        
        <form className="space-y-8" onSubmit={handleSubmit}>
          <Input
            label="Verification Code (OTP)"
            id="otp"
            type="text"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              if (error) setError(null);
            }}
            error={error}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary">
              Verify Code
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <button type="button" onClick={handleResend} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline transition-all">
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
