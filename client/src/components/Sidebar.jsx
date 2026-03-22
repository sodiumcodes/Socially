import React from 'react';
import { 
  LayoutGrid, Users, Calendar, MessageSquare, 
  Bookmark, LogOut, Sparkles, Star, Video, FileText
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutGrid, label: 'Feed', path: '/feed' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Calendar, label: 'Events', badge: '4', path: '/events' },
    { icon: Video, label: 'Live Stream', path: '/live' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: FileText, label: 'Resources', path: '/resources' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ];

  const handleCreateEvent = () => {
    navigate('/events', { state: { openCreateModal: true } });
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pb-6">
      {/* Primary Navigation */}
      <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden mb-4 shrink-0">
        <div className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`
                  flex items-center justify-between p-3.5 rounded-2xl transition-all group
                  ${isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-icon'} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`
                    text-[10px] font-black px-2 py-0.5 rounded-lg
                    ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-indigo-velvet-900 rounded-[2.5rem] p-6 mb-4 relative overflow-hidden group shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10">
          <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="text-primary w-5 h-5" />
          </div>
          <h3 className="text-white font-black text-lg leading-tight mb-2">Host an<br />Event?</h3>
          <p className="text-indigo-velvet-200 text-xs font-medium mb-4 leading-relaxed">Share your knowledge with the campus community.</p>
          <button 
            onClick={handleCreateEvent}
            className="w-full py-3 bg-primary text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/25"
          >
            Create Now
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-card rounded-[2.5rem] border border-border p-3 space-y-1 shrink-0">
        <button 
          onClick={signOut}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-cayenne-red-500 hover:bg-cayenne-red-500/5 transition-all group"
        >
          <LogOut size={20} />
          <span className="text-sm font-bold tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
