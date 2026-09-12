import { UserSession, FinancialRecord, SystemAuditLog } from '../types';

export const USERS_STORAGE_KEY = 'zhmd_db_users';
export const FINANCE_STORAGE_KEY = 'zhmd_db_finance';
export const LOGS_STORAGE_KEY = 'zhmd_db_logs';

export const DEFAULT_USERS: UserSession[] = [
  {
    userId: 'ZHMD-883921',
    phone: '+1 2025550198',
    countryCode: '+1',
    email: 'admin.manager@zhmd.org',
    balance: 1250.0,
    todayEarnings: 45.0,
    completedTasks: 18,
    vipLevel: 'VIP 5',
    inviteCode: 'ADMIN888',
    loginTime: '2026-09-11 16:30:12',
    registeredAt: '2026-09-01 09:12:00',
    status: 'active',
    isAdmin: true,
  },
  {
    userId: 'ZHMD-492817',
    phone: '+86 13800138000',
    countryCode: '+86',
    email: 'reviewer.wang@gmail.com',
    balance: 38.5,
    todayEarnings: 5.7,
    completedTasks: 4,
    vipLevel: 'VIP 2',
    inviteCode: 'ZHMD7721',
    loginTime: '2026-09-11 17:15:20',
    registeredAt: '2026-09-08 14:22:15',
    status: 'active',
  },
  {
    userId: 'ZHMD-715302',
    phone: '+44 7911123456',
    countryCode: '+44',
    email: 'alex.critic@gmail.com',
    balance: 0.0,
    todayEarnings: 0.0,
    completedTasks: 0,
    vipLevel: 'VIP 1',
    inviteCode: 'ZHMD3389',
    loginTime: '2026-09-11 18:02:44',
    registeredAt: '2026-09-11 18:00:10',
    status: 'active',
  },
  {
    userId: 'ZHMD-604819',
    phone: '+852 91234567',
    countryCode: '+852',
    email: 'moviebuff.hk@gmail.com',
    balance: 168.0,
    todayEarnings: 22.0,
    completedTasks: 12,
    vipLevel: 'VIP 3',
    inviteCode: 'ZHMD5590',
    loginTime: '2026-09-11 12:40:11',
    registeredAt: '2026-09-05 11:30:00',
    status: 'active',
  },
  {
    userId: 'ZHMD-192843',
    phone: '+65 81234567',
    countryCode: '+65',
    email: 'suspicious.bot@mail.com',
    balance: 0.0,
    todayEarnings: 0.0,
    completedTasks: 0,
    vipLevel: 'VIP 1',
    inviteCode: 'ZHMD1002',
    loginTime: '2026-09-10 22:10:05',
    registeredAt: '2026-09-10 22:05:00',
    status: 'frozen',
  }
];

export const DEFAULT_FINANCE: FinancialRecord[] = [
  {
    id: 'TXN-90182',
    userId: 'ZHMD-492817',
    userPhone: '+86 13800138000',
    type: 'commission',
    amount: 4.0,
    status: 'completed',
    timestamp: '2026-09-11 17:35:10',
    description: '电影《盗梦空间》专业评测佣金',
  },
  {
    id: 'TXN-90181',
    userId: 'ZHMD-604819',
    userPhone: '+852 91234567',
    type: 'withdraw',
    amount: 50.0,
    status: 'completed',
    timestamp: '2026-09-11 15:20:41',
    description: '提现至 USDT-TRC20 钱包',
  },
  {
    id: 'TXN-90180',
    userId: 'ZHMD-604819',
    userPhone: '+852 91234567',
    type: 'commission',
    amount: 22.0,
    status: 'completed',
    timestamp: '2026-09-11 14:10:00',
    description: '电影《泰坦尼克号》终极评审佣金',
  },
  {
    id: 'TXN-90179',
    userId: 'ZHMD-492817',
    userPhone: '+86 13800138000',
    type: 'deposit',
    amount: 100.0,
    status: 'completed',
    timestamp: '2026-09-11 10:15:33',
    description: '在线会员等级质押充值',
  },
  {
    id: 'TXN-90178',
    userId: 'ZHMD-715302',
    userPhone: '+44 7911123456',
    type: 'withdraw',
    amount: 20.0,
    status: 'pending',
    timestamp: '2026-09-11 18:22:05',
    description: '新用户首提申请审核中',
  }
];

export const DEFAULT_LOGS: SystemAuditLog[] = [
  {
    id: 'LOG-3091',
    adminName: 'SuperAdmin',
    action: 'SYSTEM_BACKUP',
    target: 'Database Schema v2.4',
    timestamp: '2026-09-11 18:30:00',
    ip: '192.168.1.101',
  },
  {
    id: 'LOG-3090',
    adminName: 'AutoAudit',
    action: 'FREEZE_USER',
    target: 'ZHMD-192843 (风险IP拦截)',
    timestamp: '2026-09-10 22:15:20',
    ip: '10.0.4.12',
  },
  {
    id: 'LOG-3089',
    adminName: 'SuperAdmin',
    action: 'TASK_REWARD_SCALE',
    target: '更新电影任务佣金递增配置 ($0.5~$22.0)',
    timestamp: '2026-09-10 18:10:00',
    ip: '192.168.1.101',
  }
];

// Helper functions for persistent mock database
export function getDbUsers(): UserSession[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback
  }
  return DEFAULT_USERS;
}

export function saveDbUsers(users: UserSession[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // fallback
  }
}

export function getDbFinance(): FinancialRecord[] {
  try {
    const data = localStorage.getItem(FINANCE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback
  }
  return DEFAULT_FINANCE;
}

export function saveDbFinance(records: FinancialRecord[]) {
  try {
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // fallback
  }
}

export function getDbLogs(): SystemAuditLog[] {
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback
  }
  return DEFAULT_LOGS;
}

export function saveDbLogs(logs: SystemAuditLog[]) {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // fallback
  }
}
