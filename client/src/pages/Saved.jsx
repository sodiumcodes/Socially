import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import PostCard from '../components/PostCard';
import { supabase } from '../lib/supabaseClient';
import { getAvatarUrl } from '../utils/avatar';
import { mapCommentRows } from '../utils/comments';
import { normalizeVisibility } from '../utils/posts';

const Saved = () => {
  const { user } = useAuth();
  const { toggleLike, addComment, fetchComments, toggleSave } = usePosts();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data: saved, error: savedError } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id);

        if (savedError) {
          if (savedError.message.includes('relation "saved_posts" does not exist')) {
            console.warn('saved_posts table does not exist yet.');
            setPosts([]);
            return;
          }
          throw savedError;
        }

        if (!saved || saved.length === 0) {
          setPosts([]);
          return;
        }

        const postIds = saved.map(s => s.post_id);

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
        console.error('Saved fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user]);

  const handleToggleSave = async (postId) => {
    // Optimistically remove from list
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await toggleSave(postId);
    } catch (err) {
      console.error('Unsave failed:', err);
      // Optionally re-fetch if it fails to ensure consistency
      fetchSavedPosts();
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      // Optimistically update local state
      setPosts(current => current.map(p => {
        if (p.id === postId) {
          const newIsLiked = !p.isLiked;
          return {
            ...p,
            isLiked: newIsLiked,
            likes: newIsLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      }));
      await toggleLike(postId);
    } catch (err) {
      console.error('Like failed in Saved:', err);
    }
  };

  const fetchCommentsForSaved = async (postId) => {
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
      console.error('Saved comment sync failed:', e);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <Navbar />
      <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
        <Sidebar />
        
        <main className="flex-1 max-w-[640px] mx-auto px-4 w-full min-w-0">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bookmark className="text-primary w-6 h-6" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Saved Posts</h1>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Read them later</p>
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
                  toggleSave={handleToggleSave}
                  fetchComments={fetchCommentsForSaved}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card p-16 rounded-[3rem] border border-border text-center shadow-sm mx-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark size={32} className="text-border" />
              </div>
              <h2 className="text-xl font-black text-foreground mb-2">No saved posts</h2>
              <p className="text-muted-foreground text-sm font-medium">When you bookmark a post, it will appear here.</p>
            </div>
          )}
        </main>

        <Rightbar />
      </div>
    </div>
  );
};

export default Saved;
