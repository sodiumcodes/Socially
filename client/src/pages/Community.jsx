import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FeedComponent from '../components/Feed';
import Rightbar from '../components/Rightbar';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { supabase } from '../lib/supabaseClient';
import { normalizeVisibility } from '../utils/posts';
import { getAvatarUrl } from '../utils/avatar';
import { mapCommentRows } from '../utils/comments';

const Community = () => {
  const { user } = useAuth();
  const { toggleLike, addComment, fetchComments } = usePosts();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Get accepted connections
        const { data: connections, error: connError } = await supabase
          .from('connections')
          .select('friend_id, user_id')
          .eq('status', 'accepted')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        if (connError) throw connError;

        const friendIds = connections.map(c => 
          c.user_id === user.id ? c.friend_id : c.user_id
        );

        // Always include self
        friendIds.push(user.id);

        // 2. Fetch posts from friends
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
          .in('user_id', friendIds)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        const mappedPosts = postsData.map(p => {
          const isLiked = user ? p.likes.some(like => like.user_id === user.id) : false;
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
      } catch (err) {
        console.error('Community fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityPosts();
  }, [user]);

  const fetchCommentsForCommunity = async (postId) => {
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
      console.error('Community comment sync failed:', e);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
        <Sidebar />
        
        <main className="flex-1 max-w-[640px] w-full min-w-0">
          <div className="mb-6 px-4">
            <h1 className="text-2xl font-black text-foreground">Community Feed</h1>
            <p className="text-sm text-muted-foreground font-medium">Posts from people you follow</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6 px-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  addComment={addComment}
                  toggleLike={toggleLike}
                  fetchComments={fetchCommentsForCommunity}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card p-12 rounded-[2rem] border border-border text-center mx-4">
              <h3 className="text-lg font-bold text-foreground mb-1">Your community is quiet</h3>
              <p className="text-muted-foreground text-sm">Follow more people to see their updates here!</p>
            </div>
          )}
        </main>

        <Rightbar />
      </div>
    </div>
  );
};

export default Community;
