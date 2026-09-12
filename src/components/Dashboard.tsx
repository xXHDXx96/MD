import { useState } from 'react';
import {
  Film,
  Award,
  Clock,
  User,
  Star,
  Copy,
  Check,
  LogOut,
  Headphones,
  Bell,
  Sparkles,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  X,
  RotateCcw,
  Database,
} from 'lucide-react';
import { UserSession, MovieItem } from '../types';
import { INITIAL_MOVIES } from '../data/movies';
import { AdminDatabaseTab } from './AdminDatabaseTab';

interface DashboardProps {
  user: UserSession;
  onLogout: () => void;
  onUpdateUser: (updater: (prev: UserSession) => UserSession) => void;
}

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80';

export function Dashboard({ user, onLogout, onUpdateUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'records' | 'profile' | 'admin'>('home');
  const [movies, setMovies] = useState<MovieItem[]>(INITIAL_MOVIES);
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(9);
  const [commentText, setCommentText] = useState<string>('Masterpiece! Fantastic storytelling and cinematography.');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for Deposit, Withdraw, and Logout
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('20');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleCopyInvite = () => {
    try {
      navigator.clipboard?.writeText(user.inviteCode);
    } catch {
      // clipboard fallback
    }
    setCopiedCode(true);
    showToast('Invitation Code Copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenRating = (movie: MovieItem) => {
    setSelectedMovie(movie);
    setRatingValue(9);
    setCommentText('Great movie with outstanding acting and visuals!');
  };

  const handleSubmitRating = () => {
    if (!selectedMovie) return;
    setIsSubmittingRating(true);

    setTimeout(() => {
      // Update movie status
      setMovies((prev) =>
        prev.map((m) =>
          m.id === selectedMovie.id
            ? { ...m, status: 'completed', userRating: ratingValue, userComment: commentText }
            : m
        )
      );

      // Update user session balance & tasks
      const reward = selectedMovie.reward;
      onUpdateUser((prev) => ({
        ...prev,
        balance: Number((prev.balance + reward).toFixed(2)),
        todayEarnings: Number((prev.todayEarnings + reward).toFixed(2)),
        completedTasks: prev.completedTasks + 1,
      }));

      setIsSubmittingRating(false);
      setSelectedMovie(null);
      showToast(`Rating Submitted! +$${reward.toFixed(2)} Commission Credited`);
    }, 800);
  };

  const handleConfirmDeposit = () => {
    if (depositAmount <= 0) return;
    onUpdateUser((prev) => ({
      ...prev,
      balance: Number((prev.balance + depositAmount).toFixed(2)),
    }));
    setShowDepositModal(false);
    showToast(`Successfully Deposited $${depositAmount.toFixed(2)}!`);
  };

  const handleConfirmWithdraw = () => {
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid amount');
      return;
    }
    if (num > user.balance) {
      showToast('Insufficient balance');
      return;
    }
    onUpdateUser((prev) => ({
      ...prev,
      balance: Number((prev.balance - num).toFixed(2)),
    }));
    setShowWithdrawModal(false);
    showToast(`Withdrawal of $${num.toFixed(2)} submitted successfully!`);
  };

  const handleResetTasks = () => {
    setMovies(INITIAL_MOVIES);
    showToast('Task list refreshed with fresh films!');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-between max-w-md mx-auto relative shadow-2xl pb-20 select-none" id="memberDashboardContainer">
      {/* Top Header */}
      <header className="bg-[#121212] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-2">
          {/* ZHMD Gold Logo */}
          <div className="bg-[#f5c518] text-black font-extrabold text-lg px-2.5 py-0.5 rounded tracking-tighter">
            ZHMD
          </div>
          <span className="text-xs text-yellow-400 font-semibold px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30">
            {user.vipLevel}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1 text-gray-300">
            <span className="text-xs font-mono">{user.phone}</span>
          </div>
          <button
            onClick={() => showToast('No new notifications')}
            className="text-gray-400 hover:text-white relative p-1 cursor-pointer"
            id="notificationBellBtn"
          >
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-4 py-2 rounded-full z-50 shadow-lg border border-yellow-500/40 flex items-center space-x-2 animate-fadeIn">
          <Sparkles size={14} className="text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tab Views */}
      <main className="flex-1 overflow-y-auto">
        {/* ================= TAB 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-3 p-3">
            {/* Asset Balance Card */}
            <div className="bg-gradient-to-br from-[#1c1c1c] via-[#242424] to-[#171717] rounded-xl p-4 text-white shadow-lg border border-yellow-500/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Total Asset Balance</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Daily Tasks: {user.completedTasks}/10
                </span>
              </div>
              <div className="text-3xl font-black text-[#f5c518] mb-3 tracking-tight">
                ${user.balance.toFixed(2)}
                <span className="text-xs text-gray-400 font-normal ml-2">USD</span>
              </div>

              {/* Sub stats */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-gray-700/60 text-xs">
                <div>
                  <div className="text-gray-400">Today Earnings</div>
                  <div className="text-emerald-400 font-bold text-sm">+${user.todayEarnings.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Completed Reviews</div>
                  <div className="text-white font-bold text-sm">{user.completedTasks} movies</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-700/60">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="bg-[#f5c518] hover:bg-yellow-400 text-black font-semibold py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1 active:scale-95 transition-transform cursor-pointer"
                >
                  <CreditCard size={14} />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1 active:scale-95 transition-transform cursor-pointer"
                >
                  <TrendingUp size={14} />
                  <span>Withdraw</span>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1 active:scale-95 transition-transform cursor-pointer"
                >
                  <Award size={14} />
                  <span>Tasks</span>
                </button>
              </div>
            </div>

            {/* Announcement banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 flex items-center space-x-2 text-xs text-yellow-800">
              <Sparkles size={16} className="text-yellow-600 shrink-0" />
              <div className="truncate">
                Welcome to ZHMD Media rating portal! Rate movies to earn daily commission.
              </div>
            </div>

            {/* Featured Movies for Review */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-1">
                  <Film size={16} className="text-[#f5c518]" />
                  <span>Recommended Movies</span>
                </h3>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs text-[#2a58b6] hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>View all</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {movies
                  .slice()
                  .sort((a, b) => a.reward - b.reward)
                  .map((movie, idx) => (
                  <div
                    key={movie.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-yellow-400 transition-colors"
                  >
                    <img
                      src={movie.poster}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_POSTER;
                      }}
                      alt={movie.title}
                      className="w-16 h-20 object-cover rounded shadow-sm shrink-0 bg-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] bg-neutral-900 text-yellow-400 font-bold px-1.5 py-0.2 rounded shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-sm text-gray-900 truncate">{movie.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{movie.titleZh} · {movie.year}</div>

                      <div className="flex items-center space-x-2 mt-1">
                        <span className="flex items-center text-xs text-yellow-700 font-bold bg-yellow-100 px-1.5 py-0.5 rounded">
                          <Star size={12} className="fill-yellow-500 text-yellow-500 mr-0.5" />
                          {movie.imdbRating}
                        </span>
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          +${movie.reward.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {movie.status === 'completed' ? (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1 rounded font-medium">
                          Done
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenRating(movie)}
                          className="bg-[#f5c518] hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded shadow active:scale-95 transition-all cursor-pointer"
                        >
                          Rate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TASKS ================= */}
        {activeTab === 'tasks' && (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-base font-bold text-gray-900">Movie Task Center</h2>
                  <span className="text-[10px] bg-yellow-100 text-yellow-800 font-semibold px-1.5 py-0.5 rounded border border-yellow-300">
                    从小到大收益递增
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Task rewards scale progressively from $0.50 to $22.00
                </p>
              </div>
              <button
                onClick={handleResetTasks}
                title="Refresh tasks"
                className="text-gray-500 hover:text-black p-2 bg-gray-100 rounded-lg flex items-center space-x-1 text-xs cursor-pointer shrink-0 ml-2"
              >
                <RotateCcw size={14} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-3">
              {movies
                .slice()
                .sort((a, b) => a.reward - b.reward)
                .map((movie, idx) => (
                <div key={movie.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                  <div className="flex space-x-3">
                    <img
                      src={movie.poster}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_POSTER;
                      }}
                      alt={movie.title}
                      className="w-20 h-28 object-cover rounded-lg shadow shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-[10px] bg-[#121212] text-[#f5c518] font-bold px-1.5 py-0.2 rounded shrink-0">
                            Task #{idx + 1}
                          </span>
                          <span className="font-bold text-gray-900 text-sm leading-tight truncate">{movie.title}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{movie.titleZh} ({movie.year})</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {movie.genres.map((g) => (
                            <span key={g} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div>
                          <div className="text-[10px] text-gray-400">Task Commission</div>
                          <div className="text-emerald-600 font-bold text-sm">+${movie.reward.toFixed(2)}</div>
                        </div>

                        {movie.status === 'completed' ? (
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full">
                            ★ Rated {movie.userRating}/10
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenRating(movie)}
                            className="bg-[#121212] hover:bg-black text-[#f5c518] font-bold text-xs px-4 py-1.5 rounded-lg active:scale-95 shadow transition-all cursor-pointer"
                          >
                            Submit Rating
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: RECORDS ================= */}
        {activeTab === 'records' && (
          <div className="p-3 space-y-3">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
              <h2 className="text-base font-bold text-gray-900">Task Commission Records</h2>
              <p className="text-xs text-gray-500">History of your movie review task rewards and payouts</p>
            </div>

            <div className="space-y-2">
              {movies.filter((m) => m.status === 'completed').length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No rating records yet. Go to Task Center to start rating!</p>
                </div>
              ) : (
                movies
                  .filter((m) => m.status === 'completed')
                  .map((movie) => (
                    <div
                      key={movie.id}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-sm text-gray-900">{movie.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Rating: {movie.userRating} / 10 ⭐</div>
                        <div className="text-[11px] text-gray-500 italic mt-0.5">&quot;{movie.userComment}&quot;</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-600 font-bold text-sm">+${movie.reward.toFixed(2)}</div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                          Settled
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: PROFILE / MINE ================= */}
        {activeTab === 'profile' && (
          <div className="p-3 space-y-3">
            {/* User Profile Card */}
            <div className="bg-gradient-to-r from-[#1b1b1b] to-[#2a2a2a] text-white rounded-2xl p-4 shadow-lg border border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-[#f5c518] text-black font-extrabold flex items-center justify-center text-xl shadow-md">
                  {user.phone.slice(-4) || 'VIP'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-white">{user.phone}</span>
                    <span className="text-[10px] bg-[#f5c518] text-black font-bold px-1.5 py-0.5 rounded">
                      {user.vipLevel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono">UID: {user.userId}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Invitation Code: <span className="text-yellow-400 font-bold">{user.inviteCode}</span>
                  </div>
                </div>
              </div>

              {/* Balance Box */}
              <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center mt-2">
                <div>
                  <div className="text-xs text-gray-300">Available Balance</div>
                  <div className="text-2xl font-black text-[#f5c518]">${user.balance.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-[#f5c518] text-black text-xs font-bold px-4 py-2 rounded-lg active:scale-95 shadow cursor-pointer"
                >
                  Withdraw
                </button>
              </div>
            </div>

            {/* Menu Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden text-sm">
              <div
                onClick={handleCopyInvite}
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <Copy size={18} className="text-blue-600" />
                  <span>Invite Friends & Share</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <span>{copiedCode ? 'Copied' : user.inviteCode}</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div
                onClick={() => showToast('VIP 2 unlocks higher commissions')}
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <Award size={18} className="text-yellow-600" />
                  <span>VIP Privileges</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              <div
                onClick={() => setActiveTab('admin')}
                className="p-3.5 flex items-center justify-between hover:bg-yellow-50/50 cursor-pointer bg-amber-50/30 rounded-lg border border-amber-200/60 transition-colors"
                id="profileAdminDbEntry"
              >
                <div className="flex items-center space-x-3 text-gray-900">
                  <Database size={18} className="text-[#f5c518] fill-[#f5c518]/20" />
                  <div className="text-left">
                    <div className="font-bold text-xs flex items-center space-x-1.5">
                      <span>后台管理与数据库中心</span>
                      <span className="text-[9px] bg-black text-[#f5c518] font-mono px-1 rounded">ADMIN</span>
                    </div>
                    <div className="text-[10px] text-gray-500">用户资产调整 · 任务报酬 · 财务流水 · SQL引擎</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              <div
                onClick={() => showToast('Online agent is ready to assist you (24/7)')}
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <Headphones size={18} className="text-emerald-600" />
                  <span>Online Customer Service</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              <div
                onClick={() => showToast('Account security is verified')}
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  <span>Security & Password</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-98 transition-all shadow-sm cursor-pointer"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 5. ADMIN DATABASE MANAGEMENT TAB ================= */}
        {activeTab === 'admin' && (
          <AdminDatabaseTab
            currentUser={user}
            movies={movies}
            onUpdateMovies={setMovies}
            onUpdateCurrentUser={onUpdateUser}
            showToast={showToast}
          />
        )}
      </main>

      {/* ================= RATING MODAL ================= */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900 text-sm">ZHMD Movie Review & Rating</h4>
              <button
                onClick={() => setSelectedMovie(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex space-x-3 mb-3 bg-gray-50 p-2 rounded-lg">
              <img
                src={selectedMovie.poster}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_POSTER;
                }}
                alt={selectedMovie.title}
                className="w-14 h-20 object-cover rounded shadow"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{selectedMovie.title}</div>
                <div className="text-xs text-gray-500">{selectedMovie.titleZh}</div>
                <div className="text-xs text-emerald-600 font-bold mt-1">
                  Commission Reward: +${selectedMovie.reward.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Star Selector */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Score:</span>
                <span className="font-bold text-yellow-600 text-sm">{ratingValue} / 10 ⭐</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={ratingValue}
                onChange={(e) => setRatingValue(Number(e.target.value))}
                className="w-full accent-[#f5c518] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>1 (Poor)</span>
                <span>5 (Average)</span>
                <span>10 (Masterpiece)</span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f5c518]"
                placeholder="Share your thoughts on this movie..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitRating}
              disabled={isSubmittingRating}
              className="w-full bg-[#f5c518] hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 active:scale-95 shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingRating ? (
                <span>Submitting to ZHMD...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Submit & Collect +${selectedMovie.reward.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= DEPOSIT MODAL ================= */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Account Deposit</h4>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Select an amount to deposit to your balance:
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    depositAmount === amt
                      ? 'border-[#f5c518] bg-[#f5c518]/20 text-black'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Custom Amount ($)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Math.max(1, Number(e.target.value)))}
                className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f5c518]"
                min="1"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmDeposit}
              className="w-full bg-[#f5c518] hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm active:scale-95 shadow transition-all cursor-pointer"
            >
              Confirm Deposit (+${depositAmount.toFixed(2)})
            </button>
          </div>
        </div>
      )}

      {/* ================= WITHDRAW MODAL ================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Account Withdrawal</h4>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 p-2.5 rounded-lg mb-3 flex justify-between items-center text-xs">
              <span className="text-gray-500">Available:</span>
              <span className="font-bold text-[#f5c518] text-sm">${user.balance.toFixed(2)} USD</span>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Withdrawal Amount ($)</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full text-sm p-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f5c518]"
                  placeholder="0.00"
                  max={user.balance}
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(user.balance.toString())}
                  className="absolute right-2 text-xs text-[#2a58b6] font-semibold cursor-pointer"
                >
                  All
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">USDT (TRC20) / Bank Account</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter address or card number"
                className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f5c518]"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmWithdraw}
              className="w-full bg-[#121212] hover:bg-black text-[#f5c518] font-bold py-2.5 rounded-lg text-sm active:scale-95 shadow transition-all cursor-pointer"
            >
              Submit Withdrawal Request
            </button>
          </div>
        </div>
      )}

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-xs rounded-2xl p-4 shadow-2xl border border-gray-200 text-center">
            <h4 className="font-bold text-gray-900 text-base mb-1">Log Out</h4>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to log out of your ZHMD account?
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 z-40 flex items-center justify-around py-2 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-black font-bold' : 'text-gray-400'
          }`}
        >
          <Film size={20} className={activeTab === 'home' ? 'text-[#f5c518]' : ''} />
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'tasks' ? 'text-black font-bold' : 'text-gray-400'
          }`}
        >
          <Award size={20} className={activeTab === 'tasks' ? 'text-[#f5c518]' : ''} />
          <span className="text-[11px] mt-0.5">Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex flex-col items-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'records' ? 'text-black font-bold' : 'text-gray-400'
          }`}
        >
          <Clock size={20} className={activeTab === 'records' ? 'text-[#f5c518]' : ''} />
          <span className="text-[11px] mt-0.5">Records</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-black font-bold' : 'text-gray-400'
          }`}
        >
          <User size={20} className={activeTab === 'profile' ? 'text-[#f5c518]' : ''} />
          <span className="text-[11px] mt-0.5">Mine</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'admin' ? 'text-black font-bold' : 'text-gray-400'
          }`}
        >
          <Database size={20} className={activeTab === 'admin' ? 'text-[#f5c518]' : ''} />
          <span className="text-[11px] mt-0.5">DB后台</span>
        </button>
      </nav>
    </div>
  );
}
