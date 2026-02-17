import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, MapPin, GraduationCap, Building2, ChevronRight } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatar';

const UserCard = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-[2rem] p-6 mb-4 shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
            <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="relative shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-full blur-[2px] opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <img
                        src={getAvatarUrl(user.full_name, user.avatar_url)}
                        alt={user.full_name}
                        className="w-16 h-16 rounded-full object-cover relative border-2 border-white shadow-sm"
                    />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-black text-slate-800 text-lg leading-tight tracking-tight">
                            {user.username || user.full_name || 'Anonymous'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <GraduationCap size={12} className="text-indigo-400" /> {user.batch || '20XX'}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <Building2 size={12} className="text-fuchsia-400" /> {user.branch || 'None'}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <MapPin size={12} className="text-emerald-400" /> {user.campus || 'Online'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="flex items-center justify-between gap-4 px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100 group/btn shadow-inner"
                >
                    <span className="text-xs font-black uppercase tracking-[0.15em]">Show Profile</span>
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default UserCard;
