import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound, Lock, Smartphone, RefreshCw } from 'lucide-react';
import { CountrySelector } from './CountrySelector';
import { CountryItem } from '../data/countries';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
  defaultCountryCode?: string;
  onPasswordResetSuccess?: (phone: string, newPass: string) => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultPhone = '',
  defaultCountryCode = '+1',
  onPasswordResetSuccess,
}: ForgotPasswordModalProps) {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phone, setPhone] = useState(defaultPhone);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [infoToast, setInfoToast] = useState<string | null>(null);

  // Sync defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhone(defaultPhone);
      setCountryCode(defaultCountryCode);
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setIsSuccess(false);
      setCountdown(0);
    }
  }, [isOpen, defaultPhone, defaultCountryCode]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const showCodeNotification = (code: string) => {
    setInfoToast(`Simulated SMS code: ${code}`);
    setTimeout(() => {
      setInfoToast(null);
    }, 4000);
  };

  const handleSendCode = () => {
    const cleanPhone = phone.trim().replace(/[\s\-()+]/g, '');
    if (!cleanPhone || !/^\d{4,15}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid mobile number first');
      return;
    }
    setErrorMessage(null);

    // Generate random 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setCountdown(60);
    showCodeNotification(code);
  };

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-gray-200', width: 'w-0' };
    if (pass.length < 6) return { label: 'Too short', color: 'bg-red-500', width: 'w-1/4' };
    if (pass.length < 8 || !/\d/.test(pass)) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/4' };
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass) && /\d/.test(pass))
      return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
  };

  const strength = calculatePasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.trim().replace(/[\s\-()+]/g, '');
    if (!cleanPhone || !/^\d{4,15}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid mobile phone number');
      return;
    }

    if (!verificationCode.trim()) {
      setErrorMessage('Please enter the 4-digit verification code');
      return;
    }

    if (generatedCode && verificationCode.trim() !== generatedCode) {
      setErrorMessage('Verification code is incorrect');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    setIsSubmitting(true);

    // Simulate secure backend verification and password hashing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onPasswordResetSuccess) {
        onPasswordResetSuccess(phone.trim(), newPassword);
      }
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      id="forgotPasswordModalBackdrop"
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-gray-200 relative overflow-hidden"
        id="forgotPasswordModalContent"
      >
        {/* Toast simulated SMS */}
        {infoToast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-neutral-900 text-yellow-300 text-xs px-3 py-1.5 rounded-full shadow-lg border border-yellow-400/50 flex items-center space-x-1 z-50 whitespace-nowrap animate-bounce">
            <Smartphone size={14} className="text-yellow-400 shrink-0" />
            <span>{infoToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-200">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Password Recovery</h3>
              <p className="text-[11px] text-gray-500">Secure ZHMD Account Assistance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            id="closeForgotPasswordBtn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-bold text-gray-900 text-base">Password Reset Successfully!</h4>
            <p className="text-xs text-gray-600 px-2 leading-relaxed">
              Your ZHMD account password has been updated securely. You can now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#2a58b6] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors active:scale-98 shadow cursor-pointer"
                id="backToSignInBtn"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {errorMessage && (
              <div
                className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg"
                id="forgotPasswordError"
              >
                {errorMessage}
              </div>
            )}

            {/* Phone with Country Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Registered Mobile Number</label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#2a58b6] focus-within:ring-1 focus-within:ring-[#2a58b6] bg-white">
                <CountrySelector
                  selectedCode={countryCode}
                  onSelect={(country: CountryItem) => setCountryCode(country.code)}
                  idPrefix="forgotPass"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 text-xs px-2 py-2 text-gray-900 focus:outline-none bg-transparent"
                  id="forgotPassPhoneInput"
                />
              </div>
            </div>

            {/* Verification Code + Send Button */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="4-digit code"
                  className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2a58b6]"
                  id="forgotPassCodeInput"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="bg-neutral-800 hover:bg-black text-white text-xs font-medium px-3 py-2 rounded-lg shrink-0 disabled:opacity-50 active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
                  id="sendVerificationCodeBtn"
                >
                  {countdown > 0 ? (
                    <span>{countdown}s</span>
                  ) : (
                    <>
                      <RefreshCw size={12} className="text-yellow-400" />
                      <span>Send Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs px-3 py-2 pr-9 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2a58b6]"
                  id="forgotNewPasswordInput"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                >
                  {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="mt-1.5">
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 inline-block">
                    Strength: <span className="font-semibold text-gray-700">{strength.label}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full text-xs px-3 py-2 pr-9 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2a58b6]"
                  id="forgotConfirmPasswordInput"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#f5c518] hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-1.5 active:scale-98 shadow transition-all disabled:opacity-50 cursor-pointer"
                id="submitResetPasswordBtn"
              >
                {isSubmitting ? (
                  <span>Securing & Updating...</span>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-1">
              <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-400">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>256-bit encrypted secure password reset</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
