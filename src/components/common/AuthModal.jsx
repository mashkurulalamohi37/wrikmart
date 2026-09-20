import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Eye,
  EyeOff,
  ShoppingBag,
  Globe2,
  KeyRound
} from 'lucide-react';
import { CountryFlag } from './CountryFlag';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode = 'login', 
    setAuthModalMode,
    login,
    registerUser,
    changeUserPassword,
    currentUser,
    showToast
  } = useApp();

  const [mode, setMode] = useState(authModalMode); // 'login' | 'register' | 'forgot' | 'changePassword'
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Sync mode with props when modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
    }
  }, [authModalMode, isAuthModalOpen]);

  // Login form
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: '',
    rememberMe: true
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: 'Dhaka',
    dateOfBirth: '',
    password: ''
  });

  // Password Reset / Change Form
  const [pwdForm, setPwdForm] = useState({
    identifier: currentUser?.email || currentUser?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Keep pwdForm identifier synced with currentUser if logged in
  useEffect(() => {
    if (currentUser) {
      setPwdForm(prev => ({
        ...prev,
        identifier: currentUser.email || currentUser.phone || prev.identifier
      }));
    }
  }, [currentUser]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.identifier.trim()) {
      showToast('Please enter your email or phone number', 'warning');
      return;
    }
    login({
      email: loginForm.identifier,
      password: loginForm.password
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerForm.name.trim() || !registerForm.phone.trim()) {
      showToast('Name and mobile phone are required', 'warning');
      return;
    }
    registerUser(registerForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const targetId = pwdForm.identifier.trim() || currentUser?.email || currentUser?.phone;
    if (!targetId) {
      showToast('Please enter your registered email or phone number', 'warning');
      return;
    }
    if (!pwdForm.newPassword || pwdForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    const res = changeUserPassword({
      identifier: targetId,
      currentPassword: pwdForm.currentPassword,
      newPassword: pwdForm.newPassword,
      confirmPassword: pwdForm.confirmPassword
    });

    if (res?.success) {
      setPwdForm({
        identifier: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      if (!currentUser) {
        setLoginForm(prev => ({ ...prev, identifier: targetId, password: pwdForm.newPassword }));
        setMode('login');
      } else {
        setIsAuthModalOpen(false);
      }
    }
  };

  if (!isAuthModalOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAuthModalOpen(false);
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 text-white mx-auto flex items-center justify-center shadow-teal-glow">
            {mode === 'changePassword' || mode === 'forgot' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <ShoppingBag className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-black text-xl text-navy-900">
            {mode === 'login' 
              ? 'Sign In to WrikMart' 
              : mode === 'register' 
                ? 'Create Customer Account' 
                : mode === 'changePassword'
                  ? 'Change Account Password'
                  : 'Reset & Set New Password'}
          </h3>
          <p className="text-xs text-slate-500">
            {mode === 'login' 
              ? 'Access Admin Dashboard, Agent Workstation, or Customer Hub' 
              : mode === 'register' 
                ? 'Join Bangladesh’s trusted authentic cross-border platform'
                : mode === 'changePassword'
                  ? 'Update your secret password for enhanced account security'
                  : 'Enter your registered identity and choose a new password'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'changePassword' && mode !== 'forgot' ? (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'register' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              New Registration
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Password Security Center</span>
            </span>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs text-brand-600 hover:underline font-bold"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* 1. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email or Mobile Number *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                  placeholder="name@example.com or 017xxxxxxxx"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password *</label>
                <button 
                  type="button"
                  onClick={() => {
                    setPwdForm(prev => ({ ...prev, identifier: loginForm.identifier }));
                    setMode('forgot');
                  }}
                  className="text-[10px] text-brand-600 hover:underline cursor-pointer font-bold"
                >
                  Forgot or Change password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
              <input
                type="tel"
                required
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                placeholder="+880 1712-345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="tanvir@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District *</label>
                <select
                  value={registerForm.district}
                  onChange={(e) => setRegisterForm({ ...registerForm, district: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                placeholder="House, Road, Area, Thana"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. Password Reset / Change Form */}
        {(mode === 'forgot' || mode === 'changePassword') && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="bg-brand-50 p-3 rounded-2xl border border-brand-200 text-brand-900 text-[11px] leading-relaxed">
              <strong>Password Manager:</strong> Enter your account email or phone number and set your new password below.
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Email or Mobile Number *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={pwdForm.identifier}
                  onChange={(e) => setPwdForm({ ...pwdForm, identifier: e.target.value })}
                  placeholder="e.g. admin@wrikmart.com or 017xxxxxxxx"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            {mode === 'changePassword' && currentUser && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password (Optional)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password (Min. 6 chars) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  placeholder="Enter new strong password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Save & Update Password</span>
            </button>
          </form>
        )}

      </div>
    </div>,
    document.body
  );
};
