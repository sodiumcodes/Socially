import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, GraduationCap, Building2, X } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatar';

const NotificationCard = ({ notification, onAccept, onDecline }) => {
    const navigate = useNavigate();
    const { sender } = notification;

    if (!sender) return null;

    return (
        <div className="bg-white rounded-[2rem] p-6 mb-4 shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
            <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${sender.id}`)}>
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-full blur-[2px] opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <img
                        src={getAvatarUrl(sender.full_name, sender.avatar_url)}
                        alt={sender.full_name}
                        className="w-16 h-16 rounded-full object-cover relative border-2 border-white shadow-sm"
                    />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h3
                                className="font-black text-slate-800 text-lg leading-tight tracking-tight cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => navigate(`/profile/${sender.id}`)}
                            >
                                {sender.username || sender.full_name || 'Anonymous'}
                            </h3>
                            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Request
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <GraduationCap size={12} className="text-indigo-400" /> {sender.batch || '20XX'}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <Building2 size={12} className="text-fuchsia-400" /> {sender.branch || 'None'}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <MapPin size={12} className="text-emerald-400" /> {sender.campus || 'Online'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDecline(notification)}
                        className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-all border border-slate-100 group/decline"
                        title="Decline"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={() => onAccept(notification)}
                        className="flex items-center justify-between gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-md group/btn"
                    >
                        <span className="text-xs font-black uppercase tracking-[0.15em]">Accept ✔️</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationCard;
