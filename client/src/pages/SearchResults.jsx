import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Users, Loader2, MessageSquare } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import UserCard from '../components/UserCard';
import PostCard from '../components/PostCard';
import { usePosts } from '../context/PostContext';
import { getAvatarUrl } from '../utils/avatar';
import { normalizeVisibility } from '../utils/posts';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results, postResults, loading, error, searchUsers, searchPosts } = useSearch();
    const { toggleLike, addComment, fetchComments, user: currentUser } = usePosts();
    const [activeTab, setActiveTab] = useState('users');

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    const batchFilter = searchParams.get('batch')?.split(',').filter(Boolean) || [];
    const campusFilter = searchParams.get('campus')?.split(',').filter(Boolean) || [];
    const branchFilter = searchParams.get('branch')?.split(',').filter(Boolean) || [];

    useEffect(() => {
        if (query.startsWith('#')) {
            setActiveTab('posts');
            searchPosts(query);
        } else {
            setActiveTab('users');
            searchUsers(query, {
                batches: batchFilter,
                campuses: campusFilter,
                branches: branchFilter
            });
        }
    }, [location.search]);

    const mappedPosts = postResults.map(p => {
        const isLiked = currentUser ? p.likes.some(like => like.user_id === currentUser.id) : false;
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
            comments: [], // Comments will be fetched on demand
            commentCount: p.comments?.length || 0,
            shares: 0,
            timestamp: new Date(p.created_at).toLocaleDateString(),
            visibility: normalizeVisibility(p.visibility),
            category: p.category
        };
    });

    return (
        <div className="bg-background min-h-screen text-foreground">
            <Navbar />
            <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
                <Sidebar />

                <main className="flex-1 max-w-[800px] mx-auto px-4 py-6">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/15 border border-primary/25 rounded-2xl shadow-lg shadow-primary/10">
                                <SearchIcon className="text-icon w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-foreground tracking-tight">Search Results</h1>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                    {activeTab === 'users' ? `Showing users matching "${query}"` : `Showing posts matching "${query}"`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                            {activeTab === 'users' ? (
                                <><Users size={16} className="text-muted-foreground" /><span className="text-xs font-black text-foreground">{results.length} Found</span></>
                            ) : (
                                <><MessageSquare size={16} className="text-muted-foreground" /><span className="text-xs font-black text-foreground">{postResults.length} Found</span></>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border border-border hover:bg-muted'}`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border border-border hover:bg-muted'}`}
                        >
                            Posts
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-icon animate-spin" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Searching campus records...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-cayenne-red-500/10 border border-cayenne-red-500/20 p-6 rounded-3xl text-center">
                            <p className="text-cayenne-red-500 font-bold">Search error: {error}</p>
                        </div>
                    ) : activeTab === 'users' ? (
                        results.length > 0 ? (
                            <div className="space-y-4">
                                {results.map(user => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card p-16 rounded-[3rem] border border-border text-center shadow-sm">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users size={32} className="text-border" />
                                </div>
                                <h2 className="text-xl font-black text-foreground mb-2">No users found</h2>
                                <p className="text-muted-foreground text-sm font-medium">Try a different name, campus, or batch.</p>
                            </div>
                        )
                    ) : (
                        mappedPosts.length > 0 ? (
                            <div className="space-y-6">
                                {mappedPosts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        addComment={addComment}
                                        toggleLike={toggleLike}
                                        fetchComments={fetchComments}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card p-16 rounded-[3rem] border border-border text-center shadow-sm">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={32} className="text-border" />
                                </div>
                                <h2 className="text-xl font-black text-foreground mb-2">No posts found</h2>
                                <p className="text-muted-foreground text-sm font-medium">Try searching for a different keyword or hashtag.</p>
                            </div>
                        )
                    )}
                </main>

                <Rightbar />
            </div>
        </div>
    );
};

export default SearchResults;
