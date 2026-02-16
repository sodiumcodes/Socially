import React from 'react';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import ProfilePostCard from './ProfilePostCard';

const ProfileFriendAdded = ({ profile, posts = [], onRemoveFriend }) => {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Single Unified Card Container */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Profile Header Section */}
                    <ProfileHeader
                        profile={profile}
                        showRemoveButton={true}
                        isFriend={true}
                        onRemoveFriend={onRemoveFriend}
                    />

                    {/* Stats Section */}
                    <StatsSection stats={stats} />

                    {/* Posts Section - Inside Same Container */}
                    <div className="px-8 py-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Posts</h2>

                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {posts.map((post) => (
                                    <ProfilePostCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>No posts yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileFriendAdded;
