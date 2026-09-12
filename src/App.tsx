import { useState, useEffect, useRef } from 'react';
import { SignupForm } from './components/SignupForm';
import { SigninForm } from './components/SigninForm';
import { Footer } from './components/Footer';
import { SuccessDialog } from './components/SuccessDialog';
import { Dashboard } from './components/Dashboard';
import { ZhmdLogo } from './components/ZhmdLogo';
import { UserSession } from './types';
import { getDbUsers, saveDbUsers } from './data/database';

const SESSION_STORAGE_KEY = 'zhmd_user_session';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [viewMode, setViewMode] = useState<'signup' | 'signin'>('signup');
  const [pendingUser, setPendingUser] = useState<UserSession | null>(null);
  const pendingUserRef = useRef<UserSession | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: 'NOTICE',
    message: 'Your account Registration Success',
  });

  // Load existing session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.phone) {
          // Ensure initial balance is 0$ if it was previous default 50
          if (parsed.balance === 50.0) {
            parsed.balance = 0.0;
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
          }
          setCurrentUser(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSignupSuccess = (sessionData: {
    phone: string;
    countryCode: string;
    email: string;
    invitationCode?: string;
  }) => {
    const newUser: UserSession = {
      userId: `ZHMD-${Math.floor(100000 + Math.random() * 900000)}`,
      phone: sessionData.phone,
      countryCode: sessionData.countryCode,
      email: sessionData.email,
      balance: 0.0, // Initial balance 0$
      todayEarnings: 0.0,
      completedTasks: 0,
      vipLevel: 'VIP 1',
      inviteCode: sessionData.invitationCode || `ZHMD${Math.floor(1000 + Math.random() * 9000)}`,
      loginTime: new Date().toISOString(),
    };

    setPendingUser(newUser);
    pendingUserRef.current = newUser;
    setDialogState({
      isOpen: true,
      title: 'NOTICE',
      message: 'Your account Registration Success',
    });
  };

  const handleSigninSuccess = (sessionData: { phone: string; countryCode: string }) => {
    const existingUser: UserSession = {
      userId: `ZHMD-${Math.floor(100000 + Math.random() * 900000)}`,
      phone: sessionData.phone,
      countryCode: sessionData.countryCode,
      email: `${sessionData.phone.replace(/[^0-9]/g, '').slice(-8)}@gmail.com`,
      balance: 0.0, // Initial balance 0$
      todayEarnings: 0.0,
      completedTasks: 0,
      vipLevel: 'VIP 1',
      inviteCode: `ZHMD${Math.floor(1000 + Math.random() * 9000)}`,
      loginTime: new Date().toISOString(),
    };

    setPendingUser(existingUser);
    pendingUserRef.current = existingUser;
    setDialogState({
      isOpen: true,
      title: 'NOTICE',
      message: 'Login Success! Welcome to ZHMD.',
    });
  };

  const closeDialogAndEnter = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    const target = pendingUserRef.current || pendingUser;
    if (target) {
      setCurrentUser(target);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(target));
        // Also ensure user exists in the admin database
        const dbUsers = getDbUsers();
        if (!dbUsers.some((u) => u.phone === target.phone)) {
          saveDbUsers([target, ...dbUsers]);
        }
      } catch {
        // storage ignored
      }
      setPendingUser(null);
      pendingUserRef.current = null;
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // storage ignored
    }
    setCurrentUser(null);
    setViewMode('signin');
  };

  const handleUpdateUser = (updater: (prev: UserSession) => UserSession) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = updater(prev);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        // Sync update to the DB users table
        const dbUsers = getDbUsers();
        const nextDb = dbUsers.map((u) => (u.phone === updated.phone ? { ...u, ...updated } : u));
        saveDbUsers(nextDb);
      } catch {
        // storage ignored
      }
      return updated;
    });
  };

  // If user is logged in, show the full-featured Member Portal / Dashboard
  if (currentUser) {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  // Otherwise show Login / Signup Portal
  return (
    <div className="Loginpwdbox min-h-screen bg-white flex flex-col justify-between" id="appMainBox">
      {/* Main Centered Form Container */}
      <div className="Loginpwdmain flex-1 flex flex-col items-center justify-center">
        {/* ZHMD Logo */}
        <div className="w-full flex justify-center mb-1 mt-1">
          <ZhmdLogo />
        </div>

        {/* Card Box */}
        <div className="box2 w-full" id="formCardBox">
          <h3
            style={{
              marginBottom: '8px',
              fontWeight: 500,
              textAlign: 'left',
              fontSize: '28px',
              fontFamily: 'sans-serif',
              lineHeight: '36px',
            }}
            id="formHeaderTitle"
          >
            {viewMode === 'signup' ? 'Create account' : 'Sign in'}
          </h3>

          {viewMode === 'signup' ? (
            <SignupForm
              onSuccess={handleSignupSuccess}
              onSwitchToLogin={() => setViewMode('signin')}
            />
          ) : (
            <SigninForm
              onSuccess={handleSigninSuccess}
              onSwitchToSignup={() => setViewMode('signup')}
            />
          )}
        </div>
      </div>

      {/* Global Black IMDb Footer */}
      <Footer />

      {/* Success Dialog Modal */}
      <SuccessDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        onClose={closeDialogAndEnter}
      />
    </div>
  );
}
