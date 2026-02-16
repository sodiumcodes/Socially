import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileFriendAdded from '../components/ProfileFriendAdded';
import ProfileNotFriend from '../components/ProfileNotFriend';
import { supabase } from '../lib/supabaseClient';
import { getAvatarUrl } from '../utils/avatar';

const ProfileDemo = () => {
    const { user: currentUser } = useAuth();
    const [activeVersion, setActiveVersion] = useState('friend-added');
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndPosts = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Fetch current user's profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

                // Fetch user's posts
                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles:user_id (id, full_name, avatar_url),
                        likes (user_id),
                        comments (id)
                    `)
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false });

                if (postsError) throw postsError;

                const mappedPosts = postsData.map(p => ({
                    id: p.id,
                    author: {
                        id: p.profiles?.id,
                        name: p.profiles?.full_name || 'Unknown',
                        avatar: getAvatarUrl(p.profiles?.full_name, p.profiles?.avatar_url)
                    },
                    content: p.content,
                    images: p.image_urls || [],
                    image: p.image_url,
                    likes: p.likes.length,
                    commentCount: p.comments.length,
                    visibility: p.visibility,
                    category: p.category,
                    timestamp: new Date(p.created_at).toLocaleDateString()
                }));

                setPosts(mappedPosts);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndPosts();
    }, [currentUser]);

    const handleAddFriend = () => {
        alert('Add friend functionality - to be implemented');
    };

    const handleRemoveFriend = () => {
        alert('Remove friend functionality - to be implemented');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Version Switcher */}
            <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setActiveVersion('friend-added')}
                            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${activeVersion === 'friend-added'
                                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Version 1: Friend Added
                        </button>
                        <button
                            onClick={() => setActiveVersion('not-friend')}
                            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${activeVersion === 'not-friend'
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Version 2: Not Friend
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Version Display */}
            <div>
                {activeVersion === 'friend-added' ? (
                    <ProfileFriendAdded
                        profile={profile}
                        posts={posts}
                        onRemoveFriend={handleRemoveFriend}
                    />
                ) : (
                    <ProfileNotFriend
                        profile={profile}
                        posts={posts}
                        onAddFriend={handleAddFriend}
                    />
                )}
            </div>
        </div>
    );
};

export default ProfileDemo;
