import React, { useState, useEffect } from 'react';
import {
  Database,
  Users,
  Film,
  DollarSign,
  Search,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CheckCircle,
  FileText,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import { UserSession, MovieItem, FinancialRecord, SystemAuditLog } from '../types';
import {
  getDbUsers,
  saveDbUsers,
  getDbFinance,
  saveDbFinance,
  getDbLogs,
  saveDbLogs,
  DEFAULT_USERS,
  DEFAULT_FINANCE
} from '../data/database';

interface AdminDatabaseTabProps {
  currentUser: UserSession;
  movies: MovieItem[];
  onUpdateMovies: React.Dispatch<React.SetStateAction<MovieItem[]>>;
  onUpdateCurrentUser: (updater: (prev: UserSession) => UserSession) => void;
  showToast: (msg: string) => void;
}

export function AdminDatabaseTab({
  currentUser,
  movies,
  onUpdateMovies,
  onUpdateCurrentUser,
  showToast,
}: AdminDatabaseTabProps) {
  const [subTab, setSubTab] = useState<'overview' | 'users' | 'movies' | 'finance' | 'sql'>('overview');
  const [users, setUsers] = useState<UserSession[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [financeFilter, setFinanceFilter] = useState<string>('all');

  // Edit user balance modal
  const [editingUser, setEditingUser] = useState<UserSession | null>(null);
  const [newBalance, setNewBalance] = useState<string>('');
  const [newVip, setNewVip] = useState<string>('');

  // Add/Edit movie modal
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [movieForm, setMovieForm] = useState<Partial<MovieItem>>({
    title: '',
    titleZh: '',
    reward: 1.0,
    imdbRating: 8.0,
    year: 2024,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80',
    genres: ['Drama'],
  });

  // SQL Terminal state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM users ORDER BY balance DESC LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<string | null>(null);
  const [sqlStatus, setSqlStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadDatabase();
  }, []);

  const loadDatabase = () => {
    let dbUsers = getDbUsers();
    // Ensure current logged-in user exists in db
    const exists = dbUsers.some((u) => u.phone === currentUser.phone);
    if (!exists) {
      dbUsers = [currentUser, ...dbUsers];
      saveDbUsers(dbUsers);
    }
    setUsers(dbUsers);
    setFinances(getDbFinance());
    setLogs(getDbLogs());
  };

  const handleToggleFreezeUser = (targetUserId: string) => {
    const updated = users.map((u) => {
      if (u.userId === targetUserId) {
        const nextStatus: 'active' | 'frozen' = u.status === 'frozen' ? 'active' : 'frozen';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    saveDbUsers(updated);

    const logEntry: SystemAuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      adminName: 'Admin',
      action: 'UPDATE_USER_STATUS',
      target: `User ${targetUserId}`,
      timestamp: new Date().toLocaleString(),
      ip: '127.0.0.1',
    };
    const newLogs = [logEntry, ...logs];
    setLogs(newLogs);
    saveDbLogs(newLogs);
    showToast('User security status updated!');
  };

  const handleOpenEditUser = (u: UserSession) => {
    setEditingUser(u);
    setNewBalance(u.balance.toString());
    setNewVip(u.vipLevel);
  };

  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    const balanceNum = parseFloat(newBalance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      showToast('Please enter a valid balance amount');
      return;
    }

    const updated = users.map((u) => {
      if (u.userId === editingUser.userId) {
        return { ...u, balance: balanceNum, vipLevel: newVip };
      }
      return u;
    });

    setUsers(updated);
    saveDbUsers(updated);

    // If editing currently active user session
    if (editingUser.phone === currentUser.phone) {
      onUpdateCurrentUser((prev) => ({
        ...prev,
        balance: balanceNum,
        vipLevel: newVip,
      }));
    }

    // Add audit log
    const logEntry: SystemAuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      adminName: 'Admin',
      action: 'BALANCE_ADJUSTMENT',
      target: `${editingUser.phone} -> $${balanceNum} (${newVip})`,
      timestamp: new Date().toLocaleString(),
      ip: '127.0.0.1',
    };
    const newLogs = [logEntry, ...logs];
    setLogs(newLogs);
    saveDbLogs(newLogs);

    setEditingUser(null);
    showToast(`User ${editingUser.userId} updated successfully!`);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm && !window.confirm('Are you sure you want to delete this user from database?')) {
      return;
    }
    const filtered = users.filter((u) => u.userId !== userId);
    setUsers(filtered);
    saveDbUsers(filtered);
    showToast(`User ${userId} deleted from database`);
  };

  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieForm.title || !movieForm.reward) {
      showToast('Please fill in title and reward');
      return;
    }

    const newMovie: MovieItem = {
      id: `m_${Date.now()}`,
      title: movieForm.title || 'Untitled Film',
      titleZh: movieForm.titleZh || movieForm.title || '自定义任务',
      poster: movieForm.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80',
      imdbRating: Number(movieForm.imdbRating) || 8.5,
      year: Number(movieForm.year) || 2024,
      genres: movieForm.genres || ['Film'],
      reward: Number(movieForm.reward) || 1.0,
      status: 'available',
    };

    onUpdateMovies((prev) => [newMovie, ...prev]);
    setIsMovieModalOpen(false);
    setMovieForm({
      title: '',
      titleZh: '',
      reward: 1.0,
      imdbRating: 8.0,
      year: 2024,
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80',
      genres: ['Action', 'Drama'],
    });
    showToast('New Movie Task added to database successfully!');
  };

  const handleDeleteMovie = (id: string) => {
    onUpdateMovies((prev) => prev.filter((m) => m.id !== id));
    showToast('Task removed from task center');
  };

  const handleResetDb = () => {
    saveDbUsers(DEFAULT_USERS);
    saveDbFinance(DEFAULT_FINANCE);
    setUsers(DEFAULT_USERS);
    setFinances(DEFAULT_FINANCE);
    showToast('Database reset to factory demonstration state!');
  };

  const handleExportJson = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      app: 'ZHMD Database Admin v2.5',
      users,
      tasks: movies,
      finances,
      logs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZHMD_Database_Dump_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Database export downloaded as JSON!');
  };

  const handleRunSql = () => {
    setSqlStatus('running');
    setTimeout(() => {
      const trimmed = sqlQuery.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') && trimmed.includes('USERS')) {
        setSqlResult(JSON.stringify(users.map(u => ({ id: u.userId, phone: u.phone, balance: `$${u.balance}`, vip: u.vipLevel, tasks: u.completedTasks, status: u.status })), null, 2));
        setSqlStatus('success');
      } else if (trimmed.startsWith('SELECT') && (trimmed.includes('MOVIES') || trimmed.includes('TASKS'))) {
        setSqlResult(JSON.stringify(movies.map(m => ({ id: m.id, title: m.title, reward: `$${m.reward}`, rating: m.imdbRating, status: m.status })), null, 2));
        setSqlStatus('success');
      } else if (trimmed.startsWith('SELECT') && trimmed.includes('FINANCE')) {
        setSqlResult(JSON.stringify(finances, null, 2));
        setSqlStatus('success');
      } else {
        setSqlResult(JSON.stringify({ message: "Query executed successfully.", affectedRows: 1, timestamp: new Date().toISOString() }, null, 2));
        setSqlStatus('success');
      }
    }, 400);
  };

  // Stats
  const totalBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);
  const totalCompleted = users.reduce((acc, u) => acc + (u.completedTasks || 0), 0);
  const activeCount = users.filter((u) => u.status !== 'frozen').length;

  return (
    <div className="p-3 space-y-3 pb-24 text-gray-800" id="adminDatabaseTab">
      {/* Top Admin Header Bar */}
      <div className="bg-[#1e1e1e] text-white rounded-xl p-3.5 shadow-md border border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-[#f5c518] text-black p-1.5 rounded-lg font-black flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base tracking-tight text-white">ZHMD Database Console</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                ZHMD 后台管理系统与数据持久中心 · Local DB Engine v2.5
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleExportJson}
              title="Export DB to JSON"
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-lg text-xs flex items-center space-x-1 transition-colors cursor-pointer border border-neutral-700"
            >
              <Download size={13} />
              <span className="text-[11px] hidden sm:inline">Export</span>
            </button>
            <button
              onClick={loadDatabase}
              title="Refresh Data"
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-lg text-xs flex items-center space-x-1 transition-colors cursor-pointer border border-neutral-700"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex items-center space-x-1.5 mt-3 pt-3 border-t border-neutral-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard', icon: ShieldCheck },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'movies', label: `Task Center (${movies.length})`, icon: Film },
            { id: 'finance', label: `Ledger (${finances.length})`, icon: DollarSign },
            { id: 'sql', label: 'SQL Terminal', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f5c518] text-black font-bold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 1. OVERVIEW TAB ================= */}
      {subTab === 'overview' && (
        <div className="space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-200">
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Total Pool Balance</span>
                <DollarSign size={13} className="text-emerald-500" />
              </div>
              <div className="text-xl font-black text-gray-900 mt-1">
                ${totalBalance.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Across {users.length} registered accounts</div>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-200">
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Active Reviews</span>
                <CheckCircle size={13} className="text-blue-500" />
              </div>
              <div className="text-xl font-black text-gray-900 mt-1">
                {totalCompleted}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">{movies.length} available film tasks</div>
            </div>
          </div>

          {/* Quick System Actions Card */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-gray-200 space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>Database Operations</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Storage: LocalStorage Engine
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setSubTab('users')}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-800">
                  <Users size={14} className="text-blue-600" />
                  <span>Manage Users</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Adjust balance, VIP rank & status</div>
              </button>

              <button
                onClick={() => setSubTab('movies')}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-800">
                  <Film size={14} className="text-yellow-600" />
                  <span>Task Rewards</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Scale rewards ($0.5 ~ $22.0)</div>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <button
                onClick={handleResetDb}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 cursor-pointer"
              >
                <AlertCircle size={12} />
                <span>Reset to Demonstration DB</span>
              </button>
              <button
                onClick={handleExportJson}
                className="text-[11px] text-gray-600 hover:text-black font-medium flex items-center space-x-1 cursor-pointer"
              >
                <Download size={12} />
                <span>Download Full SQL/JSON Dump</span>
              </button>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-gray-200 space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              System Audit Logs
            </h3>
            <div className="space-y-1.5">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-[11px] bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center justify-between font-mono">
                  <div className="truncate mr-2">
                    <span className="font-bold text-gray-800">[{log.action}]</span>{' '}
                    <span className="text-gray-600">{log.target}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. USERS MANAGEMENT TAB ================= */}
      {subTab === 'users' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-2.5 shadow-xs border border-gray-200 flex items-center space-x-2">
            <Search size={16} className="text-gray-400 ml-1" />
            <input
              type="text"
              placeholder="Search user ID, phone, or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-gray-800"
            />
          </div>

          <div className="space-y-2">
            {users
              .filter(
                (u) =>
                  u.phone.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.userId.toLowerCase().includes(userSearch.toLowerCase()) ||
                  (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
              )
              .map((u) => (
                <div key={u.userId} className="bg-white rounded-xl p-3 shadow-xs border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs font-bold text-gray-900">{u.userId}</span>
                      {u.isAdmin && (
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                          ADMIN
                        </span>
                      )}
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        u.status === 'frozen'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.status === 'frozen' ? 'FROZEN' : 'ACTIVE'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleFreezeUser(u.userId)}
                        title={u.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                        className="p-1.5 text-gray-500 hover:text-black bg-gray-100 rounded-lg cursor-pointer"
                      >
                        {u.status === 'frozen' ? <Unlock size={13} /> : <Lock size={13} />}
                      </button>
                      <button
                        onClick={() => handleOpenEditUser(u)}
                        title="Edit User"
                        className="p-1.5 text-gray-500 hover:text-black bg-gray-100 rounded-lg cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.userId)}
                        title="Delete User"
                        className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2 rounded-lg border border-gray-100 font-mono">
                    <div>
                      <span className="text-gray-400">Phone:</span>{' '}
                      <span className="text-gray-800 font-bold">{u.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Level:</span>{' '}
                      <span className="text-yellow-600 font-bold">{u.vipLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Balance:</span>{' '}
                      <span className="text-emerald-600 font-bold">${(u.balance || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Reviews:</span>{' '}
                      <span className="text-gray-800 font-bold">{u.completedTasks || 0} done</span>
                    </div>
                  </div>

                  {u.email && (
                    <div className="text-[10px] text-gray-400 truncate">
                      Email: {u.email} · Registered: {u.registeredAt || 'Recently'}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= 3. TASK REWARD CENTER TAB ================= */}
      {subTab === 'movies' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white rounded-xl p-2.5 shadow-xs border border-gray-200">
            <div className="flex items-center space-x-2 flex-1 mr-2">
              <Search size={16} className="text-gray-400 ml-1" />
              <input
                type="text"
                placeholder="Search film tasks..."
                value={movieSearch}
                onChange={(e) => setMovieSearch(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none text-gray-800"
              />
            </div>
            <button
              onClick={() => setIsMovieModalOpen(true)}
              className="px-2.5 py-1.5 bg-[#121212] hover:bg-neutral-800 text-[#f5c518] text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-2">
            {movies
              .filter(
                (m) =>
                  m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
                  m.titleZh.toLowerCase().includes(movieSearch.toLowerCase())
              )
              .sort((a, b) => a.reward - b.reward)
              .map((m, idx) => (
                <div key={m.id} className="bg-white rounded-xl p-3 shadow-xs border border-gray-200 flex items-center space-x-3">
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-12 h-16 object-cover rounded-md bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] bg-neutral-900 text-yellow-400 font-bold px-1.5 py-0.2 rounded">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-xs text-gray-900 truncate">{m.title}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{m.titleZh} · {m.year}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-bold text-emerald-600">+${m.reward.toFixed(2)}</span>
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded">★ {m.imdbRating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMovie(m.id)}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-lg cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= 4. FINANCIAL LEDGER TAB ================= */}
      {subTab === 'finance' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 bg-white rounded-xl p-2 shadow-xs border border-gray-200">
            {['all', 'commission', 'deposit', 'withdraw'].map((f) => (
              <button
                key={f}
                onClick={() => setFinanceFilter(f)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize cursor-pointer ${
                  financeFilter === f ? 'bg-[#121212] text-[#f5c518] font-bold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {finances
              .filter((item) => financeFilter === 'all' || item.type === financeFilter)
              .map((txn) => (
                <div key={txn.id} className="bg-white rounded-xl p-3 shadow-xs border border-gray-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900">{txn.id}</span>
                    <span
                      className={`text-xs font-black ${
                        txn.type === 'withdraw' ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {txn.type === 'withdraw' ? '-' : '+'}${txn.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700">{txn.description}</div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                    <span>Account: {txn.userPhone}</span>
                    <span>{txn.timestamp}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= 5. SQL QUERY TERMINAL TAB ================= */}
      {subTab === 'sql' && (
        <div className="space-y-3">
          <div className="bg-[#121212] text-gray-200 rounded-xl p-3.5 shadow-md border border-neutral-800 space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs text-yellow-400 font-bold">SQL Query Console</span>
              <span className="text-[10px] text-gray-400">Database: postgres_zhmd_dev</span>
            </div>

            <textarea
              rows={3}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full bg-neutral-900 text-emerald-400 p-2.5 rounded-lg text-xs font-mono focus:outline-none border border-neutral-700"
              placeholder="Enter SQL command..."
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => setSqlQuery('SELECT * FROM users ORDER BY balance DESC;')}
                  className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-gray-300 px-2 py-1 rounded cursor-pointer"
                >
                  users table
                </button>
                <button
                  type="button"
                  onClick={() => setSqlQuery('SELECT * FROM movies_tasks ORDER BY reward ASC;')}
                  className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-gray-300 px-2 py-1 rounded cursor-pointer"
                >
                  tasks table
                </button>
              </div>

              <button
                type="button"
                onClick={handleRunSql}
                disabled={sqlStatus === 'running'}
                className="px-3 py-1 bg-[#f5c518] hover:bg-yellow-400 text-black font-bold text-xs rounded-md cursor-pointer flex items-center space-x-1"
              >
                <span>Execute SQL</span>
              </button>
            </div>
          </div>

          {sqlResult && (
            <div className="bg-neutral-900 text-gray-200 rounded-xl p-3 border border-neutral-800 font-mono text-[11px] overflow-x-auto max-h-64">
              <div className="text-[10px] text-gray-500 mb-1">Result Query Output:</div>
              <pre className="text-emerald-400 whitespace-pre">{sqlResult}</pre>
            </div>
          )}
        </div>
      )}

      {/* ================= EDIT USER MODAL ================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Edit User #{editingUser.userId}</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-gray-500 font-medium">Account Phone</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.phone}
                  className="w-full mt-1 p-2 bg-gray-100 rounded-lg text-gray-600 border border-gray-200"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium">Adjust Balance ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full mt-1 p-2 bg-gray-50 rounded-lg text-gray-900 font-bold border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium">VIP Tier Rank</label>
                <select
                  value={newVip}
                  onChange={(e) => setNewVip(e.target.value)}
                  className="w-full mt-1 p-2 bg-gray-50 rounded-lg text-gray-900 border border-gray-300 focus:outline-none"
                >
                  <option value="VIP 1">VIP 1</option>
                  <option value="VIP 2">VIP 2</option>
                  <option value="VIP 3">VIP 3</option>
                  <option value="VIP 4">VIP 4</option>
                  <option value="VIP 5">VIP 5</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserEdit}
                className="flex-1 py-2 text-xs bg-[#121212] hover:bg-black text-[#f5c518] font-bold rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD MOVIE MODAL ================= */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveMovie} className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Add Film Task to Database</h3>
              <button type="button" onClick={() => setIsMovieModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-gray-700 font-medium">Film English Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gladiator II"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full mt-1 p-2 bg-gray-50 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium">Chinese Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 角斗士2 (超前特别评审)"
                  value={movieForm.titleZh}
                  onChange={(e) => setMovieForm((prev) => ({ ...prev, titleZh: e.target.value }))}
                  className="w-full mt-1 p-2 bg-gray-50 rounded-lg border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-700 font-medium">Reward ($ USD)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={movieForm.reward}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, reward: parseFloat(e.target.value) }))}
                    className="w-full mt-1 p-2 bg-gray-50 rounded-lg border border-gray-300 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-medium">IMDb Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.imdbRating}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, imdbRating: parseFloat(e.target.value) }))}
                    className="w-full mt-1 p-2 bg-gray-50 rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-medium">Poster Image URL</label>
                <input
                  type="url"
                  value={movieForm.poster}
                  onChange={(e) => setMovieForm((prev) => ({ ...prev, poster: e.target.value }))}
                  className="w-full mt-1 p-2 bg-gray-50 rounded-lg border border-gray-300 text-[10px]"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMovieModalOpen(false)}
                className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs bg-[#121212] hover:bg-black text-[#f5c518] font-bold rounded-lg cursor-pointer"
              >
                Commit to DB
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
