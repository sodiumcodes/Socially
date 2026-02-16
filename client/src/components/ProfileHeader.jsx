import React from 'react';
import { MapPin, GraduationCap, Calendar, BadgeCheck } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatar';

const ProfileHeader = ({ profile, showRemoveButton = false, isFriend = false, onAddFriend, onRemoveFriend }) => {
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
            <div className="h-32 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 rounded-t-3xl"></div>

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
                                    className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center shadow-xl border-4 border-white">
                                    <span className="text-3xl font-bold text-gray-800">{getInitials(profile.full_name)}</span>
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                                <BadgeCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="mt-14">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-gray-800">{profile.full_name || 'User'}</h1>
                                <BadgeCheck className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full mb-3">
                                STUDENT
                            </span>
                            {isFriend && (
                                <span className="ml-2 text-xs text-gray-500 font-medium">Friends</span>
                            )}
                            <p className="text-gray-600 mb-3">{profile.bio || 'No bio yet.'}</p>

                            {/* Details */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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

                    {/* Right: Action Button */}
                    {showRemoveButton ? (
                        <button
                            onClick={onRemoveFriend}
                            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                        >
                            Remove Friend
                        </button>
                    ) : (
                        <button
                            onClick={onAddFriend}
                            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
                        >
                            Add Friend
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
