import React from 'react';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import ProfilePostCard from './ProfilePostCard';
import { Clock } from 'lucide-react';

const ProfilePending = ({ profile, posts = [], onRemoveFriend, isReceived = false, onAcceptFriend }) => {
    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12 px-4 flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    const stats = {
        posts: posts.length,
        followers: 0,
        following: 0
    };

    // Create dummy posts for blur effect if no posts
    const displayPosts = posts.length > 0 ? posts : [
        { id: 1, content: 'Sample post...', likes: 0, commentCount: 0, visibility: 'All' },
        { id: 2, content: 'Sample post...', likes: 0, commentCount: 0, visibility: 'Custom' },
        { id: 3, content: 'Sample post...', likes: 0, commentCount: 0, visibility: 'All' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header with status */}
                    <div className="relative">
                        <ProfileHeader
                            profile={profile}
                            showRemoveButton={!isReceived} // Using remove button as 'Cancel Request' for sender
                            isFriend={false}
                            onRemoveFriend={onRemoveFriend}
                        />
                        {isReceived && (
                            <div className="absolute top-8 right-8 flex gap-3">
                                <button
                                    onClick={onRemoveFriend}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-full hover:bg-gray-200 transition-all"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={onAcceptFriend}
                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
                                >
                                    Accept Request
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Status Banner */}
                    <div className="bg-amber-50 border-b border-amber-100 px-8 py-3 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-amber-700 uppercase tracking-wider">
                            {isReceived ? 'They want to be your friend!' : 'Friend Request Sent'}
                        </span>
                    </div>

                    <StatsSection stats={stats} />

                    <div className="px-8 py-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Posts</h2>
                        <div className="relative">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 blur-sm pointer-events-none opacity-50">
                                {displayPosts.slice(0, 3).map((post) => (
                                    <ProfilePostCard key={post.id} post={post} />
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-amber-200 text-center">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {isReceived ? 'Accept to View Posts' : 'Pending Approval'}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {isReceived ? `Accept ${profile.full_name}'s request to see their posts.` : `Waiting for ${profile.full_name} to accept your request.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePending;
