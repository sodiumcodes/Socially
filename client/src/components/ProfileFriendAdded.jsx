import React from 'react';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import PostCard from './PostCard';

const ProfileFriendAdded = ({
    profile,
    posts = [],
    stats = { posts: 0, followers: 0, following: 0 },
    onRemoveFriend,
    toggleLike,
    addComment,
    fetchComments
}) => {
    if (!profile) {
        return (
            <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
                <div className="text-muted-foreground">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Single Unified Card Container */}
                <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
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
                        <h2 className="text-2xl font-bold text-foreground mb-6">Posts</h2>

                        {posts.length > 0 ? (
                            <div className="space-y-6 max-w-2xl">
                                {posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        setShowReport={() => { }}
                                        addComment={addComment}
                                        toggleLike={toggleLike}
                                        fetchComments={fetchComments}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
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
