import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth.service';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    
    try {
      await authService.forgotPassword(email);
      navigate('/otp-verification', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email and try again.');
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
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Reset <span className="text-blue-600 dark:text-blue-400">Password</span>
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Enter your registered email address to receive a verification code for password reset.
          </p>
        </div>
        
        <form className="space-y-8" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="e.g., yourname@campus.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            error={error}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary">
              Send Reset Code
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <Link to="/login" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline transition-all">
              Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
