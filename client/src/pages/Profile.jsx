import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { MapPin, Calendar, ShieldCheck, Edit3, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { usePosts } from '../context/PostContext';
import { normalizeVisibility } from '../utils/posts';
import { supabase } from '../lib/supabaseClient';
import { getAvatarUrl } from '../utils/avatar';
import { mapCommentRows } from '../utils/comments';
import ProfileFriendAdded from '../components/ProfileFriendAdded';
import ProfileNotFriend from '../components/ProfileNotFriend';
import ProfilePending from '../components/ProfilePending';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth(); // Get logged-in user
    const { toggleLike, addComment, fetchComments, refreshTrigger } = usePosts();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [friendship, setFriendship] = useState({ status: null, senderId: null }); // { status, senderId }
    const [followingList, setFollowingList] = useState([]);
    const [loadingFollowing, setLoadingFollowing] = useState(false);
    const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        bio: '',
        username: '',
        full_name: '',
        // batch, campus, branch are set at registration and cannot be changed
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Use a ref to track if it's the first mount or id change
    const isInitialMount = useRef(true);
    const prevId = useRef(id);

    useEffect(() => {
        const fetchProfileAndPosts = async () => {
            if (!id) return;
            
            // Only show full page loader on initial load or user change
            const isNewUser = prevId.current !== id;
            if (isInitialMount.current || isNewUser) {
                setLoading(true);
                isInitialMount.current = false;
                prevId.current = id;
            } else {
                setRefreshing(true);
            }

            try {
                // 1. Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (profileError) throw profileError;
                if (!profileData) throw new Error("User not found");

                setProfile(profileData);

                // 2. Fetch User's Posts
                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select(`
            *,
            profiles:user_id (id, full_name, avatar_url),
            likes (user_id),
            comments (
              id,
              text,
              parent_id,
              user_id,
              created_at,
              profiles:user_id (full_name, avatar_url)
            )
          `)
                    .eq('user_id', id)
                    .order('created_at', { ascending: false });

                if (postsError) throw postsError;

                const mappedPosts = postsData.map(p => {
                    const isLiked = currentUser ? p.likes.some(like => like.user_id === currentUser.id) : false;
                    const commentList = mapCommentRows(p.comments || []);
                    return {
                        id: p.id,
                        userId: p.user_id,
                        author: {
                            id: p.profiles?.id,
                            name: p.profiles?.full_name || 'Unknown',
                            avatar: getAvatarUrl(p.profiles?.full_name, p.profiles?.avatar_url)
                        },
                        content: p.content,
                        images: p.image_urls || [],
                        image: p.image_url,
                        likes: p.likes.length,
                        isLiked: isLiked,
                        comments: commentList,
                        commentCount: commentList.length,
                        shares: 0,
                        timestamp: new Date(p.created_at).toLocaleDateString(),
                        visibility: normalizeVisibility(p.visibility),
                        category: p.category
                    };
                });

                setPosts(mappedPosts);

                // 3. Fetch Friendship Status (if not own profile)
                if (currentUser && currentUser.id !== id) {
                    const { data: connectionData } = await supabase
                        .from('connections')
                        .select('status, user_id')
                        .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${currentUser.id})`)
                        .maybeSingle();

                    setFriendship({
                        status: connectionData?.status || null,
                        senderId: connectionData?.user_id || null
                    });
                }

                // 4. Fetch Stats (Followers/Following)
                const { data: followings } = await supabase
                    .from('connections')
                    .select('id')
                    .eq('user_id', id)
                    .eq('status', 'accepted');

                const { data: followers } = await supabase
                    .from('connections')
                    .select('id')
                    .eq('friend_id', id)
                    .eq('status', 'accepted');

                setStats({
                    posts: mappedPosts.length,
                    followers: followers?.length || 0,
                    following: followings?.length || 0
                });

                // 5. Fetch Suggested People (Friends/Followings of the profile user)
                setLoadingFollowing(true);
                const { data: friends, error: friendsError } = await supabase
                    .from('connections')
                    .select('user_id, friend_id')
                    .eq('status', 'accepted')
                    .or(`user_id.eq.${id},friend_id.eq.${id}`);

                if (!friendsError && friends) {
                    const friendIds = friends.map(f => f.user_id === id ? f.friend_id : f.user_id);
                    
                    if (friendIds.length > 0) {
                        const { data: friendProfiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .in('id', friendIds)
                            .neq('id', currentUser?.id || ''); // Don't suggest self
                        
                        setFollowingList(friendProfiles || []);
                    } else {
                        setFollowingList([]);
                    }
                }
                setLoadingFollowing(false);

                // Initialize Edit Form
                setEditForm({
                    bio: profileData.bio || '',
                    username: profileData.username || '',
                    full_name: profileData.full_name || '',
                    // batch, campus, branch locked at registration — not editable
                });

            } catch (err) {
                console.error("Profile fetch error:", err);
                setError('User not found');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        fetchProfileAndPosts();
    }, [id, refreshTrigger, currentUser]);

    /** Syncs comment thread into local profile `posts` (feed context alone does not update this list). */
    const fetchCommentsForProfile = useCallback(async (postId) => {
        await fetchComments(postId);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            const mapped = mapCommentRows(data || []);
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, comments: mapped, commentCount: mapped.length } : p
            ));
        } catch (e) {
            console.error('Profile comment sync failed:', e);
        }
    }, [fetchComments]);

    const handleFollowRequest = async () => {
        try {
            const { data, error } = await supabase
                .from('connections')
                .insert({
                    user_id: currentUser.id,
                    friend_id: id,
                    status: 'pending' 
                })
                .select()
                .single();

            if (error) throw error;

            // Send Notification
            await supabase
                .from('notifications')
                .insert({
                    user_id: id,
                    sender_id: currentUser.id,
                    type: 'friend_request', // Keep type for now to avoid breaking other things
                    content: `${currentUser.user_metadata?.full_name || 'Someone'} sent you a follow request`,
                    data: { connection_id: data.id }
                });

            setFriendship({ status: 'pending', senderId: currentUser.id });
        } catch (err) {
            console.error("Failed to follow:", err);
            alert("Failed to send follow request");
        }
    };

    const handleAcceptFollow = async () => {
        try {
            // 1. Update Connection
            const { error: connError } = await supabase
                .from('connections')
                .update({ status: 'accepted' })
                .eq('friend_id', currentUser.id)
                .eq('user_id', id);

            if (connError) throw connError;

            // 2. Delete Notification
            await supabase
                .from('notifications')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('sender_id', id)
                .eq('type', 'friend_request');

            setFriendship(prev => ({ ...prev, status: 'accepted' }));
            
            // Re-fetch stats to update counts immediately
            const { data: followings } = await supabase
                .from('connections')
                .select('id')
                .eq('user_id', id)
                .eq('status', 'accepted');

            const { data: followers } = await supabase
                .from('connections')
                .select('id')
                .eq('friend_id', id)
                .eq('status', 'accepted');

            setStats(prev => ({
                ...prev,
                followers: followers?.length || 0,
                following: followings?.length || 0
            }));
        } catch (err) {
            console.error("Failed to accept follow request:", err);
            alert("Failed to accept follow request");
        }
    };

    const handleUnfollow = async () => {
        try {
            // 1. Delete Connection (Try both directions)
            await supabase
                .from('connections')
                .delete()
                .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${currentUser.id})`);

            // 2. Delete Notifications
            await supabase
                .from('notifications')
                .delete()
                .eq('type', 'friend_request')
                .or(`and(user_id.eq.${currentUser.id},sender_id.eq.${id}),and(user_id.eq.${id},sender_id.eq.${currentUser.id})`);

            setFriendship({ status: null, senderId: null });

            // Re-fetch stats to update counts immediately
            const { data: followings } = await supabase
                .from('connections')
                .select('id')
                .eq('user_id', id)
                .eq('status', 'accepted');

            const { data: followers } = await supabase
                .from('connections')
                .select('id')
                .eq('friend_id', id)
                .eq('status', 'accepted');

            setStats(prev => ({
                ...prev,
                followers: followers?.length || 0,
                following: followings?.length || 0
            }));
        } catch (err) {
            console.error("Failed to unfollow:", err);
            alert("Failed to unfollow");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            let newAvatarUrl = profile.avatar_url;

            // 1. Upload Avatar if Changed
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload to 'avatars' bucket
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                newAvatarUrl = publicUrl;
            }

            // 2. Update Profile in Supabase (Database)
            // Note: batch, campus, and branch are intentionally excluded — locked after registration
            const updates = {
                avatar_url: newAvatarUrl,
            };

            // Only update bio if changed
            if (editForm.bio !== (profile.bio || '')) {
                updates.bio = editForm.bio;
            }

            // Only update username if changed and not empty
            if (editForm.username && editForm.username !== (profile.username || '') && editForm.username.trim() !== '') {
                updates.username = editForm.username;
            }

            // Only update full_name if changed and not empty
            if (editForm.full_name && editForm.full_name !== (profile.full_name || '') && editForm.full_name.trim() !== '') {
                updates.full_name = editForm.full_name;
            }

            // If no changes besides avatar, still update avatar
            if (Object.keys(updates).length === 1 && updates.avatar_url !== profile.avatar_url) {
                // Avatar changed, proceed
            } else if (Object.keys(updates).length === 0) {
                // No changes, but avatar might have changed
                updates.avatar_url = newAvatarUrl;
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', currentUser.id);

            if (error) throw error;

            // 3. Update Supabase Auth User Metadata (Global Sync)
            // This ensures useAuth() user object is updated immediately so Navbar/Sidebar reflect changes
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: {
                    avatar_url: newAvatarUrl,
                    full_name: profile.full_name, // Ensure this is synced if editable
                    ...updates
                }
            });

            if (authUpdateError) throw authUpdateError;

            setProfile(prev => ({ ...prev, ...updates }));

            // Update local posts state to reflect new avatar immediately
            setPosts(prevPosts => prevPosts.map(p => {
                // Check if the post belongs to the current user (using p.author.id or just comparing current user)
                // In Profile page, all posts belong to likely the profile user, but let's be safe
                if (p.author.id === currentUser.id) {
                    return {
                        ...p,
                        author: {
                            ...p.author,
                            avatar: newAvatarUrl,
                            name: updates.full_name || p.author.name // Update name if changed (though name isn't in edit form yet)
                        }
                    };
                }
                return p;
            }));

            setIsEditing(false);

        } catch (err) {
            console.error("Update failed:", err);
            alert(`Failed to update profile: ${err.message}`);
        }
    };

    const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

    const isFriend = friendship.status === 'accepted';

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    if (error || !profile) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
            <div className="text-xl font-bold mb-2">User Not Found</div>
            <p className="text-sm">The user you are looking for does not exist.</p>
        </div>
    );

    if (isOwnProfile) {
        return (
            <div className="bg-background min-h-screen text-foreground">
                <Navbar />
                <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
                    <Sidebar />

                    {/* Main Profile Content */}
                    <main className="flex-1 w-full min-w-0">

                        {/* Cover Image & Header Info */}
                        <div className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden relative mb-6">
                            {/* Cover */}
                            <div className="h-48 bg-gradient-to-r from-indigo-velvet-600 via-medium-slate-blue-500 to-amber-flame-500 relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            </div>

                            <div className="px-8 pb-8 relative">
                                {/* Avatar */}
                                <div className="absolute -top-16 left-8 group/avatar">
                                    <div className="p-1.5 bg-card rounded-full relative">
                                        <img
                                            src={previewUrl || getAvatarUrl(profile)}
                                            alt={profile.full_name}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md bg-muted"
                                        />

                                        {/* Overlay Camera Icon for Editing */}
                                        {isEditing && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                                            >
                                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                    <Edit3 className="text-white w-6 h-6" />
                                                </div>
                                            </button>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons (Right) */}
                                <div className="flex justify-end pt-4 mb-4 gap-3">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted">
                                                <X size={18} />
                                            </button>
                                            <button onClick={handleSave} className="px-4 py-2 rounded-xl font-bold text-sm btn-cta flex items-center gap-2">
                                                <Check size={16} /> Save
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-xl font-bold text-sm border-2 border-border text-muted-foreground hover:border-primary/40 transition-colors flex items-center gap-2">
                                            <Edit3 size={16} /> Edit Profile
                                        </button>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-2xl font-black text-foreground">{profile.full_name}</h1>
                                        <ShieldCheck className="w-5 h-5 text-icon" />
                                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20">
                                            STUDENT
                                        </span>
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-4 max-w-lg mb-6">
                                            {/* Batch, Campus, and Branch are set during registration and cannot be changed */}
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                                                    value={editForm.full_name}
                                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                                    placeholder="Your Full Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Bio</label>
                                                <textarea
                                                    className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-primary min-h-[80px]"
                                                    value={editForm.bio}
                                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                                    placeholder="Tell us about yourself..."
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground font-medium mb-4 max-w-2xl">
                                            {profile.bio || "No bio yet."}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            <span>{profile.campus || 'Campus Not Set'}</span>
                                        </div>
                                        {profile.branch && (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span>{profile.branch}</span>
                                            </div>
                                        )}
                                        {profile.batch && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>Batch of {profile.batch}</span>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-8 mt-8 border-t border-border pt-6">
                                    <div className="text-center">
                                        <div className="text-xl font-black text-foreground">{stats.posts}</div>
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Posts</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-black text-foreground">{stats.followers}</div>
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-black text-foreground">{stats.following}</div>
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Following</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User's Posts */}
                        {posts.length > 0 ? (
                            <div className="space-y-6">
                                {posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        addComment={addComment}
                                        toggleLike={toggleLike}
                                        fetchComments={fetchCommentsForProfile}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card p-12 rounded-[2rem] border border-border text-center">
                                <div className="inline-flex p-4 rounded-full bg-muted mb-4 text-muted-foreground">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1">No posts yet</h3>
                                <p className="text-muted-foreground text-sm">When {profile.full_name} posts, you'll see it here.</p>
                            </div>
                        )}
                    </main>

                    <div className="hidden xl:block w-80 shrink-0">
                        <div className="sticky top-20 bg-card rounded-3xl p-6 border border-border shadow-sm">
                            <h3 className="font-black text-foreground mb-4">Suggested People</h3>
                            {loadingFollowing ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : followingList.length > 0 ? (
                                <div className="space-y-4">
                                    {followingList.slice(0, 5).map(person => (
                                        <div key={person.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/profile/${person.id}`)}>
                                            <img src={getAvatarUrl(person.full_name, person.avatar_url)} alt={person.full_name} className="w-10 h-10 rounded-full object-cover" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{person.full_name}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Connection</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground font-medium italic">No suggested people yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // CONDITIONAL VIEWS FOR OTHER USERS
    return (
        <div className="bg-background min-h-screen text-foreground">
            <Navbar />
            <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
                <Sidebar />
                <main className="flex-1 w-full min-w-0">
                    {isFriend ? (
                        <ProfileFriendAdded
                            profile={profile}
                            posts={posts}
                            stats={stats}
                            onRemoveFriend={handleUnfollow}
                            toggleLike={toggleLike}
                            addComment={addComment}
                            fetchComments={fetchCommentsForProfile}
                        />
                    ) : friendship.status === 'pending' ? (
                        <ProfilePending
                            profile={profile}
                            posts={posts}
                            stats={stats}
                            onRemoveFriend={handleUnfollow}
                            isReceived={friendship.senderId !== currentUser.id}
                            onAcceptFriend={handleAcceptFollow}
                            toggleLike={toggleLike}
                            addComment={addComment}
                            fetchComments={fetchCommentsForProfile}
                        />
                    ) : (
                        <ProfileNotFriend
                            profile={profile}
                            posts={posts}
                            stats={stats}
                            onAddFriend={handleFollowRequest}
                            toggleLike={toggleLike}
                            addComment={addComment}
                            fetchComments={fetchCommentsForProfile}
                        />
                    )}
                </main>
                <div className="hidden xl:block w-80 shrink-0">
                    <div className="sticky top-20 bg-card rounded-3xl p-6 border border-border shadow-sm">
                        <h3 className="font-black text-foreground mb-4">Suggested People</h3>
                        {loadingFollowing ? (
                            <div className="flex justify-center py-4">
                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : followingList.length > 0 ? (
                            <div className="space-y-4">
                                {followingList.slice(0, 5).map(person => (
                                    <div key={person.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/profile/${person.id}`)}>
                                        <img src={getAvatarUrl(person.full_name, person.avatar_url)} alt={person.full_name} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{person.full_name}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Following</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground font-medium italic">No suggested people yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
