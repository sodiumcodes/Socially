import React from 'react';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import PostCard from './PostCard';
import { usePosts } from '../context/PostContext';

const ProfileNotFriend = ({ profile, posts = [], stats = { posts: 0, followers: 0, following: 0 }, onAddFriend, toggleLike, addComment, fetchComments }) => {
    if (!profile) {
        return (
            <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
                <div className="text-muted-foreground">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-6 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Single Unified Card Container */}
                <div className="bg-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden mb-6">
                    {/* Profile Header Section */}
                    <ProfileHeader
                        profile={profile}
                        showRemoveButton={false}
                        isFriend={false}
                        onAddFriend={onAddFriend}
                    />

                    {/* Stats Section */}
                    <StatsSection stats={stats} />
                </div>

                {/* Posts Section */}
                <div className="space-y-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-black text-foreground mb-6">Posts</h2>

                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                toggleLike={toggleLike}
                                addComment={addComment}
                                fetchComments={fetchComments}
                            />
                        ))
                    ) : (
                        <div className="bg-card p-12 rounded-[2rem] border border-border text-center">
                            <h3 className="text-lg font-bold text-foreground mb-1">No posts yet</h3>
                            <p className="text-muted-foreground text-sm">When {profile.full_name} posts, you'll see it here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileNotFriend;
