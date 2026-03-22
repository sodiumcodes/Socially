import React from 'react';
import {
  Home, Users, Calendar, Video, Image, FileText,
  ChevronDown, LayoutGrid, Bookmark, Star, Settings, Bell,
  Sparkles, ShieldCheck, Zap
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '../utils/avatar';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutGrid, label: 'Feed', path: '/feed' },
    { icon: Users, label: 'Connections', path: '/connections' },
    { icon: Calendar, label: 'Events', badge: '4', path: '/events' },
    { icon: Video, label: 'Live Stream', path: '/live' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: FileText, label: 'Resources', path: '/resources' },
  ];

  const getIsActive = (itemPath) => {
    // Simple active check logic
    if (itemPath === '/feed') return location.pathname === '/feed';
    return location.pathname.startsWith(itemPath);
  };

  return (
    /* PREMIUM FRAME: Borderless feel with high-end shadow */
    <aside className="w-[260px] hidden lg:flex flex-col h-[calc(100vh-64px)] overflow-y-auto pr-3 pl-5 no-scrollbar py-6 sticky top-16 bg-card/80 backdrop-blur-xl border-r border-border/80">

      {/* 1. High-End Profile Header */}
      <Link to={`/profile/${user?.id}`} className="flex items-center gap-3.5 px-2 mb-10 group cursor-pointer relative">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-tr from-medium-slate-blue-500 to-indigo-velvet-600 rounded-full blur-[2px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
          {/* ... Image & Info (Same as before) ... */}
          {/* Re-implementing inner content since replace overwrites block */}
          <img
            src={getAvatarUrl(user)}
            className="w-11 h-11 rounded-full object-cover relative border-2 border-card shadow-sm"
            alt="Profile"
          />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full shadow-sm" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-black text-foreground text-[14px] tracking-tight truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User'}
            </h3>
            <ShieldCheck size={14} className="text-icon shrink-0" fill="currentColor" fillOpacity={0.1} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{user?.role || 'Student'}</p>
        </div>
      </Link>

      {/* 2. Navigation with "Floating" Active State */}
      <nav className="flex-1 space-y-8">
        <div>
          <h4 className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-[0.25em] mb-5 ml-2">Navigation</h4>
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = getIsActive(item.path);
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-500 group relative ${isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary/10 rounded-[1.25rem] border border-primary/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'text-icon/80 group-hover:scale-110 group-hover:text-icon'
                        }`} />
                      <span className={`font-bold text-[13px] tracking-tight ${isActive ? 'text-primary' : ''}`}>
                        {item.label}
                      </span>
                    </div>

                    {item.badge && (
                      <span className="relative z-10 text-[9px] font-black px-2 py-0.5 bg-card shadow-sm border border-border rounded-lg text-muted-foreground group-hover:border-primary/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 3. Premium Quick Actions Card */}
        <div className="mx-2 p-5 bg-gradient-to-br from-indigo-velvet-600 via-medium-slate-blue-500 to-amber-flame-500 rounded-[2rem] shadow-xl shadow-medium-slate-blue-500/25 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="bg-white/20 backdrop-blur-md w-8 h-8 rounded-xl flex items-center justify-center mb-3">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <p className="text-white text-[12px] font-black leading-tight">Host an Event</p>
            <p className="text-white/80 text-[10px] font-medium mt-1">Start a campus meetup</p>
            <button className="mt-4 w-full py-2 bg-foreground text-background text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-white transition-colors">
              Create Now
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Settings & Notifications (Integrated Icons) */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-around">
        <NavBottomBtn icon={<Settings size={18} />} label="Settings" />
        <div className="w-[1px] h-4 bg-border" />
        <NavBottomBtn
          icon={<Bell size={18} />}
          label="Alerts"
          badge
          onClick={() => navigate('/notifications')}
        />
        <div className="w-[1px] h-4 bg-border" />
        <NavBottomBtn icon={<Sparkles size={18} />} label="Themes" />
      </div>

    </aside>
  );
};

/* --- Internal Premium Components --- */

const NavBottomBtn = ({ icon, label, badge, onClick }) => (
  <button className="flex flex-col items-center gap-1 group" onClick={onClick}>
    <div className="p-2 rounded-xl text-icon group-hover:bg-primary/10 group-hover:text-primary transition-all relative">
      {icon}
      {badge && <div className="absolute top-2 right-2 w-2 h-2 bg-cayenne-red-500 rounded-full border-2 border-card" />}
    </div>
    <span className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-tighter group-hover:text-foreground">{label}</span>
  </button>
);

export default Sidebar;