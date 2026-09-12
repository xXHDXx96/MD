import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { CaptchaBox } from './CaptchaBox';
import { CountrySelector } from './CountrySelector';
import { CountryItem } from '../data/countries';
import { RegisterFormData, FormErrors } from '../types';

interface SignupFormProps {
  onSuccess: (sessionData: { phone: string; countryCode: string; email: string; invitationCode?: string }) => void;
  onSwitchToLogin: () => void;
}

function generateCaptcha(length = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    countryCode: '+1',
    phone: '',
    captchaCode: '',
    password: '',
    confirmPassword: '',
    invitationCode: '',
  });

  const [currentCaptcha, setCurrentCaptcha] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = () => {
    setCurrentCaptcha(generateCaptcha(4));
    setErrors((prev) => ({ ...prev, captchaCode: undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error on type
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === 'password' || name === 'confirmPassword') {
      setErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Email validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your Gmail address';
    } else if (!gmailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid Gmail address (@gmail.com)';
    }

    // 2. Phone validation
    const cleanPhone = formData.phone.trim().replace(/[\s\-()+]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Please enter your mobile phone number';
    } else if (!/^\d{4,15}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // 3. Captcha validation (case-insensitive)
    if (!formData.captchaCode.trim()) {
      newErrors.captchaCode = 'Please enter the verification code';
    } else if (formData.captchaCode.trim().toUpperCase() !== currentCaptcha.toUpperCase()) {
      newErrors.captchaCode = 'Your captcha does not match!';
    }

    // 4. Password validation
    if (!formData.password) {
      newErrors.password = 'Please enter a password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // 5. Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.password = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.password = 'Passwords do not match!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate backend submission identical to original
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({
        phone: `${formData.countryCode} ${formData.phone.trim()}`,
        countryCode: formData.countryCode,
        email: formData.email.trim(),
        invitationCode: formData.invitationCode || 'ZHMD' + Math.floor(1000 + Math.random() * 9000),
      });
    }, 1200);
  };

  return (
    <form className="van-form w-full" id="registerForm" onSubmit={handleSubmit} noValidate>
      {/* 1. Gmail Input */}
      <div className="van-cell van-field van-hairline--bottom">
        <div className="van-cell__value van-cell__value--alone van-field__value w-full">
          <div className="van-field__body flex items-center justify-between">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Please Enter Gmail Address"
              className="van-field__control text-[16px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
              title="Please enter a valid Gmail address"
              autoComplete="email"
            />
            {formData.email && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, email: '' }))}
                className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {errors.email && (
        <div className="error-message text-red-500 text-xs text-left mb-2.5 -mt-1 pl-1" id="error-email">
          {errors.email}
        </div>
      )}

      {/* 2. Global Country code + Phone Input */}
      <div className="van-cell van-field van-hairline--bottom country relative">
        <CountrySelector
          selectedCode={formData.countryCode}
          onSelect={(country: CountryItem) => {
            setFormData((prev) => ({ ...prev, countryCode: country.code }));
          }}
          idPrefix="signup"
        />

        <div className="van-cell__value van-cell__value--alone van-field__value flex-1 pl-1">
          <div className="van-field__body flex items-center">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Mobile phone number"
              className="van-field__control text-[16px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
              autoComplete="tel"
            />
            {formData.phone && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, phone: '' }))}
                className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {errors.phone && (
        <div className="error-message text-red-500 text-xs text-left mb-2.5 -mt-1 pl-1" id="error-phone">
          {errors.phone}
        </div>
      )}

      {/* 3. Captcha Input + Interactive Graphic Code */}
      <div className="van-cell van-field van-hairline--bottom">
        <div className="van-cell__value van-cell__value--alone van-field__value w-full">
          <div className="van-field__body flex items-center justify-between">
            <input
              type="text"
              placeholder="Please Enter the graphic verification code"
              name="captchaCode"
              id="captchaCode"
              value={formData.captchaCode}
              onChange={handleInputChange}
              className="van-field__control text-[15px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
              maxLength={4}
              autoComplete="off"
            />
            <div className="van-field__right-icon ml-2 flex-shrink-0">
              <CaptchaBox captchaText={currentCaptcha} onRefresh={refreshCaptcha} />
            </div>
          </div>
        </div>
      </div>
      {errors.captchaCode && (
        <div className="error-message text-red-500 text-xs text-left mb-2.5 -mt-1 pl-1" id="error-captchCode">
          {errors.captchaCode}
        </div>
      )}

      {/* 4. Password Input */}
      <div className="van-cell van-field van-hairline--bottom">
        <div className="van-cell__value van-cell__value--alone van-field__value w-full">
          <div className="van-field__body flex items-center justify-between">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Please Enter Password"
              className="van-field__control text-[16px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="van-field__right-icon ml-2 text-gray-500 hover:text-black cursor-pointer flex items-center"
              id="togglePasswordBtn"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Confirm Password Input */}
      <div className="van-cell van-field van-hairline--bottom">
        <div className="van-cell__value van-cell__value--alone van-field__value w-full">
          <div className="van-field__body flex items-center justify-between">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Please Confirm Your Password"
              className="van-field__control text-[16px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="van-field__right-icon ml-2 text-gray-500 hover:text-black cursor-pointer flex items-center"
              id="toggleConfirmPasswordBtn"
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Password mismatch / general error */}
      {errors.password && (
        <div className="text-red-500 text-xs text-left mb-2.5 -mt-1 pl-1" id="error-password">
          {errors.password}
        </div>
      )}

      {/* 6. Invitation Code Input */}
      <div className="van-cell van-field van-hairline--bottom">
        <div className="van-cell__value van-cell__value--alone van-field__value w-full">
          <div className="van-field__body">
            <input
              type="text"
              name="invitationCode"
              id="invitationCode"
              value={formData.invitationCode}
              onChange={handleInputChange}
              placeholder="Invitation Code"
              className="van-field__control text-[16px] w-full text-black placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
      {errors.invitationCode && (
        <div className="error-message text-red-500 text-xs text-left mb-2.5 -mt-1 pl-1" id="error-invitationCode">
          {errors.invitationCode}
        </div>
      )}

      {/* 7. Submit Button with exact loading state */}
      <button
        id="btnRegister"
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
          marginTop: '20px',
        }}
      >
        <div className="van-button__content flex items-center justify-center">
          {isSubmitting ? (
            <div className="loading" id="submitLoadingSpinner"></div>
          ) : (
            <span className="van-button__text">Create your ZHMD account</span>
          )}
        </div>
      </button>

      {/* 8. Already have an account link */}
      <p className="mt-4 text-[14px] text-center text-gray-700">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#2162a1] hover:underline font-normal cursor-pointer bg-transparent border-none p-0 inline"
          id="loginLinkBtn"
        >
          Login
        </button>
      </p>
    </form>
  );
}
