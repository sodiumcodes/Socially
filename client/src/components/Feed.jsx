import React, { useState } from 'react';
import {
  Image, Video, Heart, MessageCircle, Share2, Plus,
  Globe, Bookmark, AlertTriangle, Send, MoreHorizontal, Smile, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import PostCard from './PostCard';
import { getAvatarUrl } from '../utils/avatar';

const Feed = () => {
  const { user } = useAuth();
  const { posts, openCreatePost, addComment, toggleLike, fetchComments, reportPost } = usePosts();
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState(null);

  const handleReportSubmit = async () => {
    if (reportPostId && reportReason) {
      await reportPost(reportPostId, reportReason);
      setReportPostId(null);
      setReportReason(null);
    }
  };

  const stories = [
    { name: 'Your_Story', img: getAvatarUrl(user), isUser: true },
    { name: 'Manash', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' },
    { name: 'SonalSonal', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { name: 'Supra', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { name: 'Sam', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { name: 'Ronak', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150' },
  ];

  return (
    <div className="flex-1 max-w-[640px] mx-auto px-4 py-6 h-screen overflow-y-auto no-scrollbar bg-background">

      {/* 1. Refined Circular Stories */}
      <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2">
        {stories.map((story, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <div className={`p-[2.5px] rounded-full transition-transform duration-500 group-hover:rotate-45 ${story.isUser ? 'bg-muted' : 'bg-gradient-to-tr from-medium-slate-blue-500 via-indigo-velvet-600 to-amber-flame-500'
                }`}>
                <div className="p-[2px] bg-card rounded-full">
                  <img src={story.img} className="w-14 h-14 rounded-full object-cover group-hover:scale-105 transition-transform" alt="" />
                </div>
              </div>
              {story.isUser && (
                <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background shadow-sm">
                  <Plus className="text-white w-2.5 h-2.5" strokeWidth={3} />
                </div>
              )}
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter group-hover:text-primary transition-colors">
              {story.name.split(' ')[0]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 2. Integrated Post Creator */}
      <div
        onClick={openCreatePost}
        className="bg-card rounded-[2rem] p-4 shadow-sm border border-border mb-6 group cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex gap-4 items-center">
          <img src={getAvatarUrl(user)} className="w-10 h-10 rounded-full object-cover" alt="" />
          <div className="flex-1 bg-transparent border-none text-sm font-medium text-muted-foreground">
            Share an update...
          </div>
          <div className="flex gap-1">
            <button className="p-2.5 text-icon hover:text-primary hover:bg-primary/10 rounded-full transition-all"><Image size={18} /></button>
            <button className="p-2.5 text-muted-foreground hover:text-tiger-orange-500 hover:bg-tiger-orange-500/10 rounded-full transition-all"><Smile size={18} /></button>
          </div>
        </div>
      </div>

      {/* 3. Posts Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            setShowReport={() => setReportPostId(post.id)}
            addComment={addComment}
            toggleLike={toggleLike}
            fetchComments={fetchComments}
          />
        ))}
      </div>

      {/* 4. Reporting Modal */}
      <AnimatePresence>
        {reportPostId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-background/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-card/95 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-[340px] p-8 shadow-2xl border border-border"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-cayenne-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cayenne-red-500">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-base font-black text-foreground mb-1">Report Content</h3>
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-6">Select Reason</p>

                <div className="space-y-2 mb-8">
                  {['Inappropriate Content', 'Spam', 'Harassment', 'Other'].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`w-full py-3.5 rounded-2xl border text-xs font-bold transition-all ${reportReason === reason
                          ? 'bg-cayenne-red-500/10 border-cayenne-red-500/20 text-cayenne-red-500 shadow-inner'
                          : 'border-border text-muted-foreground hover:bg-muted hover:shadow-md hover:border-transparent'
                        }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setReportPostId(null)} className="flex-1 text-[11px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground">Cancel</button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={!reportReason}
                    className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${reportReason ? 'bg-foreground text-background hover:bg-cayenne-red-500' : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                  >Submit</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
/* --- Sub Components --- */
export default Feed;