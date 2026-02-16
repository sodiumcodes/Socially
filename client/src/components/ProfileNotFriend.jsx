import React from 'react';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import ProfilePostCard from './ProfilePostCard';
import { Lock } from 'lucide-react';

const ProfileNotFriend = ({ profile, posts = [], onAddFriend }) => {
    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12 px-4 flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    const stats = {
        posts: posts.length,
        followers: 0, // TODO: Implement followers count from database
        following: 0  // TODO: Implement following count from database
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
                {/* Single Unified Card Container */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Profile Header Section */}
                    <ProfileHeader
                        profile={profile}
                        showRemoveButton={false}
                        isFriend={false}
                        onAddFriend={onAddFriend}
                    />

                    {/* Stats Section */}
                    <StatsSection stats={stats} />

                    {/* Posts Section - Inside Same Container with Restricted Access */}
                    <div className="px-8 py-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Posts</h2>

                        {/* Posts Grid with Blur Overlay */}
                        <div className="relative">
                            {/* Blurred Posts */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 blur-sm pointer-events-none opacity-50">
                                {displayPosts.slice(0, 3).map((post) => (
                                    <ProfilePostCard key={post.id} post={post} />
                                ))}
                            </div>

                            {/* Friends Only Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-purple-200 text-center">
                                    <div className="flex justify-center mb-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                            <Lock className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Friends Only Content</h3>
                                    <p className="text-gray-600 text-sm">Add friend to view posts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileNotFriend;
