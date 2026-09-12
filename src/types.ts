export interface RegisterFormData {
  email: string;
  countryCode: string;
  phone: string;
  captchaCode: string;
  password: string;
  confirmPassword: string;
  invitationCode: string;
}

export interface LoginFormData {
  countryCode: string;
  mobileNumber: string;
  password: string;
}

export interface FormErrors {
  email?: string;
  phone?: string;
  captchaCode?: string;
  password?: string;
  confirmPassword?: string;
  invitationCode?: string;
  mobileNumber?: string;
  general?: string;
}

export interface UserSession {
  userId: string;
  phone: string;
  countryCode: string;
  email?: string;
  balance: number;
  todayEarnings: number;
  completedTasks: number;
  vipLevel: string;
  inviteCode: string;
  loginTime: string;
  registeredAt?: string;
  status?: 'active' | 'frozen' | 'pending';
  isAdmin?: boolean;
}

export interface MovieItem {
  id: string;
  title: string;
  titleZh: string;
  poster: string;
  imdbRating: number;
  year: number;
  genres: string[];
  reward: number;
  status: 'available' | 'completed';
  userRating?: number;
  userComment?: string;
}

export interface FinancialRecord {
  id: string;
  userId: string;
  userPhone: string;
  type: 'deposit' | 'withdraw' | 'commission' | 'bonus' | 'admin_adjustment';
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  timestamp: string;
  description: string;
}

export interface SystemAuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}
