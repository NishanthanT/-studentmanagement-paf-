import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth.service';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [validationModal, setValidationModal] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    const phoneRegex = /^\d{3}-\d{4}-\d{3}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits in XXX-XXXX-XXX format';
    }
    
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-])[A-Za-z\d@$!%*?&#_\-]{8,}$/;
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!strongPasswordRegex.test(formData.password)) {
      newErrors.password = 'Password must be 8+ chars and contain uppercase, lowercase, number, & special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setValidationModal(Object.values(validationErrors)[0]);
      return;
    }
    
    try {
      await authService.signup({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });
      navigate('/login');
    } catch (err) {
      const backendMessage = err.response?.data?.message || '';
      if (backendMessage.toLowerCase().includes('email is already registered') || backendMessage.toLowerCase().includes('already exists')) {
        setErrors({ apiError: 'Email already exists. Please use another email to sign up.' });
      } else {
        setErrors({ apiError: backendMessage || 'Failed to sign up. Ensure backend is running and email is unique.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-[#0B0D17]/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-card max-w-lg w-full p-10 space-y-10 relative z-10 animate-fade-in border-white/30">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 group hover:scale-110 transition-transform duration-300">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create <span className="text-blue-600 dark:text-blue-400">Account</span>
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Already registered?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Return to login
            </Link>
          </p>
        </div>
        
        {errors.apiError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 animate-shake">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {errors.apiError}
          </div>
        )}
        
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <Input
              label="Full Name"
              id="fullName"
              placeholder="e.g., Johnathan Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />
          </div>
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="john@campus.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Phone Number"
            id="phoneNumber"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Min 8 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <div className="md:col-span-2 pt-6">
            <Button type="submit" variant="primary">
              Sign Up
            </Button>
          </div>
        </form>
      </div>

      {/* Validation Modal Popup */}
      {validationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card max-w-sm w-full p-8 shadow-2xl space-y-6 transform scale-100 animate-slide-up border-rose-500/30">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-black text-center text-gray-900 dark:text-white">Validation Error</h3>
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed">{validationModal}</p>
                <div className="pt-4">
                    <Button className="w-full bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-500/20" onClick={() => setValidationModal(null)}>
                        Okay
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
