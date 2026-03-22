import React, { useState } from 'react';
import {
  Search, Bell, ChevronDown, Grid, Layout, Command, Filter,
  Compass, Users, Briefcase, PlusCircle, MessageCircle, User, LogOut,
  GraduationCap, Building2, MapPin, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import { getAvatarUrl } from '../utils/avatar';
import { supabase } from '../lib/supabaseClient';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Explore');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Search Filters State
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedCampuses, setSelectedCampuses] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const { openCreatePost } = usePosts();

  const fetchNotificationCount = async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  React.useEffect(() => {
    fetchNotificationCount();

    const channel = supabase
      .channel('navbar_notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchNotificationCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const BATCHES = ['2023', '2024', '2025'];
  const CAMPUSES = ['Bengaluru', 'Pune', 'Noida', 'Lucknow', 'Patna', 'Indore', 'Online'];
  const BRANCHES = ['School of Technology', 'School of Management', 'School of Health'];

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedBatches.length) params.append('batch', selectedBatches.join(','));
      if (selectedCampuses.length) params.append('campus', selectedCampuses.join(','));
      if (selectedBranches.length) params.append('branch', selectedBranches.join(','));

      navigate(`/search?${params.toString()}`);
      setShowSearchFilters(false);
    }
  };

  const toggleFilter = (item, currentList, setList) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  return (
    <nav className="sticky top-0 z-[100] bg-card/80 backdrop-blur-xl border-b border-border px-6 py-2.5">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-8">

        {/* 1. Brand Logo - Minimal & Bold */}
        <Link to="/feed" className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-tr from-medium-slate-blue-500 to-amber-flame-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-foreground p-2 rounded-xl">
              <Layout className="text-white w-5 h-5" />
            </div>
          </div>
          <span className="text-lg font-black text-foreground tracking-tighter hidden xl:block">
            Socially
          </span>
        </Link>

        {/* 2. Central Navigation - Fills the "Empty" space */}
        <div className="hidden lg:flex items-center bg-muted/50 p-1 rounded-2xl border border-border">
          <Link to="/feed">
            <TabItem
              icon={<Compass size={18} />}
              label="Explore"
              active={activeTab === 'Explore'}
              onClick={() => setActiveTab('Explore')}
            />
          </Link>
          <TabItem
            icon={<Users size={18} />}
            label="Communities"
            active={activeTab === 'Communities'}
            onClick={() => setActiveTab('Communities')}
          />
          <TabItem
            icon={<Briefcase size={18} />}
            label="Collaborate"
            active={activeTab === 'Collaborate'}
            onClick={() => setActiveTab('Collaborate')}
          />
        </div>

        {/* 3. Search & Actions Container */}
        <div className="flex-1 flex items-center justify-end gap-4">

          {/* Dynamic Search Bar */}
          <div className="hidden md:flex flex-col relative w-full max-w-[320px]">
            <div className="flex items-center bg-muted px-4 py-2 rounded-xl border border-transparent focus-within:border-primary/20 focus-within:bg-card transition-all group">
              <Search className="w-4 h-4 text-icon mr-2 group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search campus..."
                className="bg-transparent border-none outline-none text-xs w-full font-medium text-foreground/90 placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => setShowSearchFilters(true)}
              />
              <button
                onClick={() => setShowSearchFilters(!showSearchFilters)}
                className={`p-1.5 rounded-lg transition-colors ${showSearchFilters ? 'bg-primary/10 text-icon' : 'hover:bg-muted text-icon'}`}
              >
                <Filter size={14} />
              </button>
            </div>

            {/* Search Filters Dropdown */}
            <AnimatePresence>
              {showSearchFilters && (
                <>
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowSearchFilters(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] border border-border p-4 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Search Filters</span>
                      <button onClick={() => {
                        setSelectedBatches([]);
                        setSelectedCampuses([]);
                        setSelectedBranches([]);
                      }} className="text-[9px] font-bold text-cayenne-red-500 uppercase">Clear</button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                      {/* Batches */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-tight mb-2">
                          <GraduationCap size={12} className="text-icon" /> Batches
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {BATCHES.map(batch => (
                            <button
                              key={batch}
                              onClick={() => toggleFilter(batch, selectedBatches, setSelectedBatches)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${selectedBatches.includes(batch) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
                            >
                              {batch}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Campuses */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-tight mb-2">
                          <MapPin size={12} className="text-icon" /> Campuses
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {CAMPUSES.map(campus => (
                            <button
                              key={campus}
                              onClick={() => toggleFilter(campus, selectedCampuses, setSelectedCampuses)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${selectedCampuses.includes(campus) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-card text-muted-foreground border-border'}`}
                            >
                              {campus}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Branches */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-tight mb-2">
                          <Building2 size={12} className="text-icon" /> Branches
                        </label>
                        <div className="flex flex-col gap-1.5">
                          {BRANCHES.map(branch => (
                            <button
                              key={branch}
                              onClick={() => toggleFilter(branch, selectedBranches, setSelectedBranches)}
                              className={`px-2 py-2 rounded-lg text-[10px] font-bold border text-left transition-all ${selectedBranches.includes(branch) ? 'bg-indigo-velvet-600 text-white border-indigo-velvet-600' : 'bg-card text-muted-foreground border-border'}`}
                            >
                              {branch}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSearch({ key: 'Enter' })}
                      className="w-full mt-4 bg-foreground text-background py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                    >
                      Apply Filters
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            <NavAction icon={<PlusCircle size={20} />} label="New Post" hideLabel onClick={openCreatePost} />
            <NavAction icon={<MessageCircle size={20} />} badge="3" />
            <NavAction
              icon={<Bell size={20} />}
              badge={unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null}
              onClick={() => navigate('/notifications')}
            />
          </div>

          {/* Profile - Sleeker & More Integrated */}
          {/* User Profile Dropdown */}
          <div className="relative pl-4 border-l border-border ml-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={getAvatarUrl(user)}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary/25 transition-all"
                  alt="Profile"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-card rounded-full" />
              </div>
              <ChevronDown className={`w-4 h-4 text-icon group-hover:text-primary transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card rounded-2xl shadow-xl border border-border py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border mb-1">
                    <p className="text-sm font-black text-foreground truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user?.role || 'Student'}</p>
                  </div>

                  <Link
                    to={`/profile/${user?.id}`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-muted-foreground hover:bg-muted hover:text-icon transition-colors"
                  >
                    <User size={16} />
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-cayenne-red-500 hover:bg-cayenne-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

/* --- Refined Internal Components --- */

const TabItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${active
      ? 'bg-card text-primary shadow-sm shadow-primary/10 border border-border'
      : 'text-icon/85 hover:text-primary'
      }`}
  >
    {icon}
    <span className={active ? 'block' : 'hidden xl:block'}>{label}</span>
  </button>
);

const NavAction = ({ icon, badge, label, hideLabel, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.9 }}
    className="p-2.5 rounded-xl text-icon hover:text-primary hover:bg-primary/10 transition-all relative flex items-center gap-2"
  >
    {icon}
    {!hideLabel && label && <span className="text-xs font-bold">{label}</span>}
    {badge && (
      <span className="absolute top-2 right-2 min-w-[14px] h-[14px] bg-cayenne-red-500 text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-card">
        {badge}
      </span>
    )}
  </motion.button>
);

export default Navbar;