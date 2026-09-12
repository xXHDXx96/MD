import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { CountrySelector } from './CountrySelector';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { CountryItem } from '../data/countries';
import { LoginFormData } from '../types';

interface SigninFormProps {
  onSuccess: (sessionData: { phone: string; countryCode: string }) => void;
  onSwitchToSignup: () => void;
}

export function SigninForm({ onSuccess, onSwitchToSignup }: SigninFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    countryCode: '+1',
    mobileNumber: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorPhone, setErrorPhone] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetNotification, setResetNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErr = false;

    const cleanMobile = formData.mobileNumber.trim().replace(/[\s\-()+]/g, '');
    if (!cleanMobile) {
      setErrorPhone('Please enter your mobile phone number');
      hasErr = true;
    } else if (!/^\d{4,15}$/.test(cleanMobile)) {
      setErrorPhone('Please enter a valid phone number');
      hasErr = true;
    } else {
      setErrorPhone(null);
    }

    if (!formData.password) {
      setErrorPassword('Please enter your password');
      hasErr = true;
    } else {
      setErrorPassword(null);
    }

    if (hasErr) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({
        phone: `${formData.countryCode} ${formData.mobileNumber.trim()}`,
        countryCode: formData.countryCode,
      });
    }, 1000);
  };

  const handlePasswordResetSuccess = (phone: string, newPass: string) => {
    setFormData((prev) => ({
      ...prev,
      mobileNumber: phone,
      password: newPass,
    }));
    setResetNotification('Password updated successfully! You can now log in.');
    setTimeout(() => setResetNotification(null), 4000);
  };

  return (
    <>
      <form className="van-form w-full" id="loginForm" onSubmit={handleSubmit} noValidate>
        {resetNotification && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-lg mb-3 text-center">
            {resetNotification}
          </div>
        )}

        {/* 1. Global Country code + Mobile Number */}
        <div className="van-cell van-field van-hairline--bottom country relative">
          <CountrySelector
            selectedCode={formData.countryCode}
            onSelect={(country: CountryItem) => {
              setFormData((prev) => ({ ...prev, countryCode: country.code }));
            }}
            idPrefix="signin"
          />

          <div className="van-cell__value van-cell__value--alone van-field__value flex-1 pl-1">
            <div className="van-field__body flex items-center">
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, mobileNumber: e.target.value }));
                  if (errorPhone) setErrorPhone(null);
                }}
                placeholder="Please Enter Mobile Phone Number"
                className="van-field__control text-[16px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
                autoComplete="tel"
              />
              {formData.mobileNumber && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mobileNumber: '' }))}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        {errorPhone && (
          <div className="error-message text-red-500 text-xs text-left mb-2.5 -mt-1 pl-1" id="error-mobileNumber">
            {errorPhone}
          </div>
        )}

        {/* 2. Password */}
        <div className="van-cell van-field van-hairline--bottom">
          <div className="van-cell__value van-cell__value--alone van-field__value w-full">
            <div className="van-field__body flex items-center justify-between">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="signinPassword"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (errorPassword) setErrorPassword(null);
                }}
                placeholder="Please Enter Password"
                className="van-field__control text-[16px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="van-field__right-icon ml-2 text-gray-500 hover:text-black cursor-pointer flex items-center"
                id="toggleSigninPasswordBtn"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>
        {errorPassword && (
          <div className="error-message text-red-500 text-xs text-left mb-2.5 -mt-1 pl-1" id="error-signinPassword">
            {errorPassword}
          </div>
        )}

        {/* Forgot Password Link */}
        <div className="flex justify-end mt-1.5 mb-1">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-xs text-[#2162a1] hover:underline cursor-pointer bg-transparent border-none p-0 inline-block font-normal"
            id="forgotPasswordLinkBtn"
          >
            Forgot password?
          </button>
        </div>

        {/* 3. Log In button */}
        <button
          id="btnLogin"
          type="submit"
          disabled={isSubmitting}
          className="buts van-button van-button--default van-button--normal transition-all"
          style={{
            width: '100%',
            border: 'none',
            color: '#fff',
            fontSize: '19px',
            backgroundColor: isSubmitting ? '#9498e969' : '#2a58b6',
            borderRadius: '5px',
            height: '50px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 500,
            marginTop: '16px',
          }}
        >
          <div className="van-button__content flex items-center justify-center">
            {isSubmitting ? (
              <div className="loading" id="signinLoadingSpinner"></div>
            ) : (
              <span className="van-button__text">Log In</span>
            )}
          </div>
        </button>

        {/* 4. Switch back to signup */}
        <p className="mt-4 text-[14px] text-center text-gray-700">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[#2162a1] hover:underline font-normal cursor-pointer bg-transparent border-none p-0 inline"
            id="signupLinkBtn"
          >
            Create account
          </button>
        </p>
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultPhone={formData.mobileNumber}
        defaultCountryCode={formData.countryCode}
        onPasswordResetSuccess={handlePasswordResetSuccess}
      />
    </>
  );
}
