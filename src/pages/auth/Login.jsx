import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error on change
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const response = await authService.login(formData.email, formData.password);
      const userPayload = {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
        status: response.status
      };
      login(response.token, userPayload);
      navigate('/');
    } catch (err) {
      setErrors({ apiError: err.response?.data?.message || 'Invalid email or password' });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // The credential is the encoded JWT token directly from Google (ID Token)
      const response = await authService.googleLogin(credentialResponse.credential);
      const userPayload = {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
        status: response.status
      };
      login(response.token, userPayload);
      navigate('/');
    } catch (err) {
      setErrors({ apiError: err.response?.data?.message || 'Google Login failed on our server' });
    }
  };

  const handleGoogleError = () => {
    setErrors({ apiError: 'Google API specifically rejected the popup flow' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-[#0B0D17]/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-card max-w-md w-full p-10 space-y-10 relative z-10 animate-fade-in border-white/30">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 group hover:scale-110 transition-transform duration-300">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign in to <span className="text-blue-600 dark:text-blue-400">Campus Hub</span>
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
            New here?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        
        {errors.apiError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 animate-shake">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {errors.apiError}
          </div>
        )}
        
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="e.g., admin@campus.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest cursor-pointer">
                Remember me
              </label>
            </div>

            <Link to="/forgot-password" title="Forgot Password?" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline transition-all">
              Forgot your password?
            </Link>
          </div>

          <div>
            <Button type="submit" variant="primary">
              Sign In
            </Button>
          </div>
        </form>

        <div className="space-y-6 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="px-4 bg-[#F9FAFB] dark:bg-[#0B0D17] text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center transform hover:scale-105 transition-transform">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
