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

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Explore');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search Filters State
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedCampuses, setSelectedCampuses] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const { openCreatePost } = usePosts();

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
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-2.5">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-8">

        {/* 1. Brand Logo - Minimal & Bold */}
        <Link to="/feed" className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-slate-900 p-2 rounded-xl">
              <Layout className="text-white w-5 h-5" />
            </div>
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tighter hidden xl:block">
            Socially
          </span>
        </Link>

        {/* 2. Central Navigation - Fills the "Empty" space */}
        <div className="hidden lg:flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-100">
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
            <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all group">
              <Search className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-indigo-500" />
              <input
                type="text"
                placeholder="Search campus..."
                className="bg-transparent border-none outline-none text-xs w-full font-medium text-slate-600 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => setShowSearchFilters(true)}
              />
              <button
                onClick={() => setShowSearchFilters(!showSearchFilters)}
                className={`p-1.5 rounded-lg transition-colors ${showSearchFilters ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-400'}`}
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 p-4 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Filters</span>
                      <button onClick={() => {
                        setSelectedBatches([]);
                        setSelectedCampuses([]);
                        setSelectedBranches([]);
                      }} className="text-[9px] font-bold text-rose-500 uppercase">Clear</button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                      {/* Batches */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-tight mb-2">
                          <GraduationCap size={12} className="text-indigo-500" /> Batches
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {BATCHES.map(batch => (
                            <button
                              key={batch}
                              onClick={() => toggleFilter(batch, selectedBatches, setSelectedBatches)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${selectedBatches.includes(batch) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                              {batch}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Campuses */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-tight mb-2">
                          <MapPin size={12} className="text-emerald-500" /> Campuses
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {CAMPUSES.map(campus => (
                            <button
                              key={campus}
                              onClick={() => toggleFilter(campus, selectedCampuses, setSelectedCampuses)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${selectedCampuses.includes(campus) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                              {campus}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Branches */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-tight mb-2">
                          <Building2 size={12} className="text-fuchsia-500" /> Branches
                        </label>
                        <div className="flex flex-col gap-1.5">
                          {BRANCHES.map(branch => (
                            <button
                              key={branch}
                              onClick={() => toggleFilter(branch, selectedBranches, setSelectedBranches)}
                              className={`px-2 py-2 rounded-lg text-[10px] font-bold border text-left transition-all ${selectedBranches.includes(branch) ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                              {branch}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSearch({ key: 'Enter' })}
                      className="w-full mt-4 bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
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
              badge="!"
              onClick={() => navigate('/notifications')}
            />
          </div>

          {/* Profile - Sleeker & More Integrated */}
          {/* User Profile Dropdown */}
          <div className="relative pl-4 border-l border-slate-100 ml-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={getAvatarUrl(user)}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-indigo-100 transition-all"
                  alt="Profile"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full" />
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-sm font-black text-slate-800 truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Student'}</p>
                  </div>

                  <Link
                    to={`/profile/${user?.id}`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <User size={16} />
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-colors text-left"
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
      ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200'
      : 'text-slate-400 hover:text-slate-600'
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
    className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all relative flex items-center gap-2"
  >
    {icon}
    {!hideLabel && label && <span className="text-xs font-bold">{label}</span>}
    {badge && (
      <span className="absolute top-2 right-2 min-w-[14px] h-[14px] bg-rose-500 text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">
        {badge}
      </span>
    )}
  </motion.button>
);

export default Navbar;