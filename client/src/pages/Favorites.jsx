import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { supabase } from '../lib/supabaseClient';
import { normalizeVisibility } from '../utils/posts';
import { getAvatarUrl } from '../utils/avatar';
import { mapCommentRows } from '../utils/comments';
import { Star } from 'lucide-react';

const Favorites = () => {
  const { user } = useAuth();
  const { toggleLike, addComment, fetchComments } = usePosts();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritePosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Get post IDs that the user has liked
        const { data: likedPosts, error: likesError } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (likesError) throw likesError;

        if (!likedPosts || likedPosts.length === 0) {
          setPosts([]);
          return;
        }

        const postIds = likedPosts.map(l => l.post_id);

        // 2. Fetch those posts
        let query = supabase
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
            ),
            saved_posts:saved_posts (user_id)
          `)
          .in('id', postIds)
          .order('created_at', { ascending: false });

        let { data: postsData, error: postsError } = await query;

        // Fallback if saved_posts join fails
        if (postsError && postsError.message.includes('saved_posts')) {
          console.warn('saved_posts table might be missing in Favorites.');
          const fallbackQuery = supabase
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
            .in('id', postIds)
            .order('created_at', { ascending: false });
          const fallbackResult = await fallbackQuery;
          postsData = fallbackResult.data;
          postsError = fallbackResult.error;
        }

        if (postsError) throw postsError;

        const mappedPosts = postsData.map(p => {
          const isLiked = user ? p.likes?.some(like => like.user_id === user.id) : false;
          const isSaved = user && p.saved_posts ? p.saved_posts.some(save => save.user_id === user.id) : false;
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
            likes: p.likes?.length || 0,
            isLiked: isLiked,
            isSaved: isSaved,
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
        console.error('Favorites fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritePosts();
  }, [user]);

  const handleToggleLike = async (postId) => {
    // Optimistically update the UI by removing the post from the list
    setPosts(prev => prev.filter(p => p.id !== postId));
    // Actually toggle the like in the context/DB
    await toggleLike(postId);
  };

  const fetchCommentsForFavorites = async (postId) => {
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
      console.error('Favorites comment sync failed:', e);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <Navbar />
      <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
        <Sidebar />
        
        <main className="flex-1 max-w-[640px] mx-auto px-4 w-full min-w-0">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-amber-400/10 rounded-xl">
              <Star className="text-amber-500 w-6 h-6" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Favorites</h1>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Posts you've liked</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  addComment={addComment}
                  toggleLike={handleToggleLike}
                  fetchComments={fetchCommentsForFavorites}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card p-16 rounded-[3rem] border border-border text-center shadow-sm mx-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-border" />
              </div>
              <h2 className="text-xl font-black text-foreground mb-2">No favorites yet</h2>
              <p className="text-muted-foreground text-sm font-medium">When you like a post, it will appear here.</p>
            </div>
          )}
        </main>

        <Rightbar />
      </div>
    </div>
  );
};

export default Favorites;
