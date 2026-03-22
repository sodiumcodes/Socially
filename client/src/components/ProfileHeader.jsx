import React from 'react';
import { MapPin, GraduationCap, Calendar, BadgeCheck, X } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatar';

const ProfileHeader = ({
    profile,
    showRemoveButton = false,
    isFriend = false,
    onAddFriend,
    onRemoveFriend,
    isPendingReceived = false,
    onAcceptFriend,
    onDeclineFriend,
    // New independent follower management props
    isFollower = false,
    onRemoveFollower
}) => {
    if (!profile) return null;

    // Get first letters of name for fallback
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="relative">
            {/* Gradient Header */}
            <div className="h-32 bg-gradient-to-r from-indigo-velvet-600 via-medium-slate-blue-500 to-amber-flame-500 rounded-t-3xl"></div>

            {/* Profile Content */}
            <div className="px-8 pb-6">
                <div className="flex items-start justify-between">
                    {/* Left: Avatar and Info */}
                    <div className="flex items-start gap-4 -mt-12">
                        {/* Avatar with Badge */}
                        <div className="relative">
                            {profile.avatar_url ? (
                                <img
                                    src={getAvatarUrl(profile.full_name, profile.avatar_url)}
                                    alt={profile.full_name}
                                    className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-card"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-flame-500 to-medium-slate-blue-500 flex items-center justify-center shadow-xl border-4 border-card">
                                    <span className="text-3xl font-bold text-indigo-velvet-100">{getInitials(profile.full_name)}</span>
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                                <BadgeCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="mt-14">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-foreground">{profile.full_name || 'User'}</h1>
                                <BadgeCheck className="w-5 h-5 text-icon" />
                            </div>
                            <span className="inline-block px-3 py-1 bg-primary/15 text-primary text-xs font-semibold rounded-full mb-3">
                                STUDENT
                            </span>
                            {isFriend && (
                                <span className="ml-2 text-xs text-muted-foreground font-medium">Following</span>
                            )}
                            <p className="text-muted-foreground mb-3">{profile.bio || 'No bio yet.'}</p>

                            {/* Details */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {profile.campus && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{profile.campus}</span>
                                    </div>
                                )}
                                {profile.branch && (
                                    <div className="flex items-center gap-1">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{profile.branch}</span>
                                    </div>
                                )}
                                {profile.batch && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Batch of {profile.batch}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col items-end gap-2 mt-4">
                        {isPendingReceived ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onDeclineFriend}
                                    className="p-2.5 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-all duration-200 shadow-sm border border-border"
                                    title="Decline Follow Request"
                                >
                                    <X size={20} fontWeight="bold" />
                                </button>
                                <button
                                    onClick={onAcceptFriend}
                                    className="px-6 py-2.5 bg-gradient-to-r from-medium-slate-blue-500 to-indigo-velvet-600 text-white font-semibold rounded-full shadow-lg hover:from-medium-slate-blue-600 hover:to-indigo-velvet-700 transition-all duration-200"
                                >
                                    Accept Follow
                                </button>
                            </div>
                        ) : showRemoveButton ? (
                            <button
                                onClick={onRemoveFriend}
                                className="px-6 py-2.5 bg-gradient-to-r from-cayenne-red-500 to-tiger-orange-600 text-white font-semibold rounded-full shadow-lg hover:from-cayenne-red-600 hover:to-tiger-orange-600 transition-all duration-200"
                            >
                                Unfollow
                            </button>
                        ) : (
                            <button
                                onClick={onAddFriend}
                                className="px-6 py-2.5 bg-gradient-to-r from-medium-slate-blue-500 to-indigo-velvet-600 text-white font-semibold rounded-full shadow-lg hover:from-medium-slate-blue-600 hover:to-indigo-velvet-700 transition-all duration-200"
                            >
                                Follow
                            </button>
                        )}

                        {/* Independent Remove Follower Button */}
                        {isFollower && (
                            <button
                                onClick={onRemoveFollower}
                                className="px-4 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-full border border-border hover:bg-muted/80 transition-all"
                            >
                                Remove Follower
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
