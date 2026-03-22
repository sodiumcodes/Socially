import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, AlertTriangle, Send, MoreHorizontal, Users, Globe, Trash2, Edit2, CornerDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import ImageLightbox from './ImageLightbox';
import { getAvatarUrl } from '../utils/avatar';

const PostCard = ({ post, setShowReport, addComment, toggleLike, toggleSave, fetchComments }) => {
  const { user } = useAuth();
  const { deletePost, editComment, deleteComment, toggleSave: contextToggleSave } = usePosts();

  const handleToggleSave = () => {
    if (toggleSave) {
      toggleSave(post.id);
    } else {
      contextToggleSave(post.id);
    }
  };
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // commentId to reply to
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleCreateComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText, replyTo);
    setCommentText('');
    setReplyTo(null);
  };

  const toggleComments = () => {
    if (!isCommentsOpen && fetchComments) {
      fetchComments(post.id);
    }
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateComment();
  };

  const authorId = post.author?.id;
  const isOwner = user?.id === authorId || user?.id === post.userId;

  // Organize comments into a tree
  const organizeComments = (comments) => {
    if (!comments) return [];
    const map = {};
    const roots = [];
    comments.forEach(c => {
      map[c.id] = { ...c, children: [] };
    });
    comments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  };

  const commentTree = organizeComments(post.comments);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-[0_4px_20px_rgb(0,0,0,0.35)]"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-3 items-center min-w-0 flex-1">
            {authorId ? (
              <Link
                to={`/profile/${authorId}`}
                className="flex gap-3 items-center min-w-0 rounded-xl -m-1 p-1 pr-2 hover:bg-muted/50 transition-colors"
              >
                <div className="relative shrink-0">
                  <img src={post.author.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-[13px] tracking-tight">{post.author.name}</h4>
                  <div className="flex items-center flex-wrap gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                    <span>{post.timestamp}</span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1">
                      {(() => {
                        const vis = post.visibility;
                        const isPublic = !vis || vis === 'public' || vis === 'null';
                        if (isPublic) return <><Globe size={10} /> All</>;
                        if (typeof vis === 'string') {
                          if (vis === 'campus') return <><Users size={10} /> Campus</>;
                          return <><Globe size={10} /> All</>;
                        }
                        const count = (vis.batches?.length || 0) + (vis.campuses?.length || 0) + (vis.branches?.length || 0);
                        if (count === 0) return <><Globe size={10} /> All</>;
                        return <><Users size={10} /> Custom</>;
                      })()}
                    </span>
                    {post.category && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md tracking-tight normal-case font-bold">{post.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <>
                <div className="relative shrink-0">
                  <img src={post.author.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-[13px] tracking-tight">{post.author.name}</h4>
                  <div className="flex items-center flex-wrap gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                    <span>{post.timestamp}</span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1">
                      {(() => {
                        const vis = post.visibility;
                        const isPublic = !vis || vis === 'public' || vis === 'null';
                        if (isPublic) return <><Globe size={10} /> All</>;
                        if (typeof vis === 'string') {
                          if (vis === 'campus') return <><Users size={10} /> Campus</>;
                          return <><Globe size={10} /> All</>;
                        }
                        const count = (vis.batches?.length || 0) + (vis.campuses?.length || 0) + (vis.branches?.length || 0);
                        if (count === 0) return <><Globe size={10} /> All</>;
                        return <><Users size={10} /> Custom</>;
                      })()}
                    </span>
                    {post.category && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md tracking-tight normal-case font-bold">{post.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-1">
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-muted-foreground/60 hover:text-cayenne-red-500 hover:bg-cayenne-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => setShowReport?.(true)}
              className="p-2 text-muted-foreground/60 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all"
            >
              <AlertTriangle size={16} />
            </button>
          </div>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-card/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center rounded-[2.5rem]"
              >
                <div className="w-12 h-12 bg-cayenne-red-500/10 rounded-full flex items-center justify-center mb-3 text-cayenne-red-500">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-sm font-black text-foreground mb-1">Delete this post?</h3>
                <p className="text-[11px] font-bold text-muted-foreground mb-6 max-w-[200px] leading-relaxed">
                  This action cannot be undone. Are you sure you want to proceed?
                </p>
                <div className="flex gap-2 w-full max-w-[200px]">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="flex-1 py-2.5 rounded-xl bg-cayenne-red-500 text-xs font-bold text-white hover:bg-cayenne-red-600 shadow-lg shadow-cayenne-red-500/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-muted-foreground text-[14px] leading-relaxed mb-5 font-medium px-1 whitespace-pre-wrap">
          {post.content}
        </p>


        {/* Multiple Images Display */}
        {(() => {
          const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);

          if (images.length === 0) return null;

          // Single image layout
          if (images.length === 1) {
            return (
              <div
                className="rounded-[2rem] overflow-hidden max-h-[500px] mb-5 border border-border relative group bg-muted cursor-pointer"
                onClick={() => { setSelectedImageIndex(0); setIsLightboxOpen(true); }}
              >
                <img
                  src={images[0]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt=""
                  style={{ aspectRatio: '4/5', maxHeight: '500px', objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          }

          // Two images layout
          if (images.length === 2) {
            return (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-border relative group bg-muted cursor-pointer"
                    onClick={() => { setSelectedImageIndex(idx); setIsLightboxOpen(true); }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt=""
                      style={{ aspectRatio: '4/5', height: '300px', objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            );
          }

          // Three images layout
          if (images.length === 3) {
            return (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-border relative group bg-muted cursor-pointer"
                    onClick={() => { setSelectedImageIndex(idx); setIsLightboxOpen(true); }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt=""
                      style={{ aspectRatio: '4/5', height: '250px', objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            );
          }

          // Four images layout (2x2 grid)
          if (images.length === 4) {
            return (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-border relative group bg-muted cursor-pointer"
                    onClick={() => { setSelectedImageIndex(idx); setIsLightboxOpen(true); }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt=""
                      style={{ aspectRatio: '4/5', height: '250px', objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            );
          }

          // Five images layout (2 + 3 grid)
          if (images.length === 5) {
            return (
              <div className="space-y-2 mb-5">
                <div className="grid grid-cols-2 gap-2">
                  {images.slice(0, 2).map((img, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden border border-border relative group bg-muted cursor-pointer"
                      onClick={() => { setSelectedImageIndex(idx); setIsLightboxOpen(true); }}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt=""
                        style={{ aspectRatio: '4/5', height: '200px', objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {images.slice(2, 5).map((img, idx) => (
                    <div
                      key={idx + 2}
                      className="rounded-2xl overflow-hidden border border-border relative group bg-muted cursor-pointer"
                      onClick={() => { setSelectedImageIndex(idx + 2); setIsLightboxOpen(true); }}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt=""
                        style={{ aspectRatio: '4/5', height: '200px', objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })()}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border border-border/50">
            <PostAction
              active={post.isLiked}
              onClick={() => toggleLike(post.id)}
              icon={<Heart size={18} fill={post.isLiked ? "#f35b04" : "none"} />}
              count={post.likes}
              color="hover:text-cayenne-red-500"
            />
            <PostAction
              active={isCommentsOpen}
              onClick={toggleComments}
              icon={<MessageCircle size={18} />}
              count={post.commentCount || 0}
              color="hover:text-primary"
            />
            {(() => {
              const vis = post.visibility;
              const isPostForAll = (!vis || vis === 'public' || vis === 'null') ||
                (typeof vis === 'string' && vis !== 'campus') ||
                (typeof vis === 'object' && ((vis.batches?.length || 0) + (vis.campuses?.length || 0) + (vis.branches?.length || 0)) === 0);

              return isPostForAll ? (
                <PostAction icon={<Share2 size={18} />} count={post.shares} color="hover:text-emerald-500" />
              ) : null;
            })()}
          </div>
          <button 
             onClick={handleToggleSave}
             className={`p-3 rounded-2xl transition-all ${post.isSaved ? 'text-primary bg-primary/10' : 'text-icon/80 hover:text-primary hover:bg-primary/10'}`}
           >
            <Bookmark size={20} fill={post.isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Improved Dynamic Comment Section */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50/40 border-t border-slate-100 overflow-hidden"
          >
            <div className="p-6 space-y-5">
              {/* Render dynamic comments */}
              {commentTree && commentTree.length > 0 ? (
                <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  {commentTree.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      user={user}
                      onReply={id => { setReplyTo(id); document.getElementById(`comment-input-${post.id}`).focus(); }}
                      onEdit={(id, text) => editComment(id, post.id, text)}
                      onDelete={(id) => deleteComment(id, post.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 rounded-xl border border-dashed border-border">
                  No comments yet
                </div>
              )}

              <div className="flex flex-col gap-2">
                {replyTo && (
                  <div className="flex items-center justify-between px-4 py-1 text-xs text-primary bg-primary/10 rounded-lg mb-2">
                    <span>Replying to comment...</span>
                    <button onClick={() => setReplyTo(null)} className="font-bold hover:underline">Cancel</button>
                  </div>
                )}
                <div className="flex gap-3 items-center bg-card p-2 pl-4 rounded-[1.5rem] shadow-sm border border-border w-full">
                  <input
                    id={`comment-input-${post.id}`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                    className="flex-1 text-xs outline-none font-medium text-muted-foreground bg-transparent"
                  />
                  <button
                    onClick={handleCreateComment}
                    disabled={!commentText.trim()}
                    className={`
                        p-2.5 rounded-xl shadow-lg transition-all
                        ${commentText.trim()
                        ? 'btn-cta shadow-primary/25'
                        : 'bg-muted text-muted-foreground shadow-none cursor-not-allowed'}
                    `}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageLightbox
        isOpen={isLightboxOpen}
        images={post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : [])}
        initialIndex={selectedImageIndex}
        onClose={() => setIsLightboxOpen(false)}
      />
    </motion.div>
  );
};

const CommentItem = ({ comment, user, onReply, onEdit, onDelete, level = 0 }) => {
  const isOwner = user?.id === comment.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  return (
    <div className={`flex flex-col gap-2 ${level > 0 ? 'ml-5 relative' : ''}`}>
      {level > 0 && <div className="absolute -left-3.5 top-0 w-3.5 h-4 border-l-2 border-b-2 border-border rounded-bl-xl" />}

      <div className="flex gap-3 group">
        <div className="w-8 h-8 rounded-full bg-foreground shrink-0 overflow-hidden shadow-inner">
          <img src={comment.avatar} alt="" />
        </div>
        <div className="flex-1 max-w-[90%]">
          <div className="bg-card p-3 rounded-2xl rounded-tl-none shadow-sm border border-border/50 group-hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="font-black text-foreground text-[11px] mr-2">{comment.user}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase">{comment.time}</span>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full text-xs border-b border-primary/30 focus:outline-none bg-transparent text-foreground"
                />
                <button onClick={() => { onEdit(comment.id, editText); setIsEditing(false); }} className="text-[9px] font-bold text-primary">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-[9px] font-bold text-muted-foreground">Cancel</button>
              </div>
            ) : (
              <p className="text-[12px] text-muted-foreground font-medium leading-snug whitespace-pre-wrap">{comment.text}</p>
            )}
          </div>

          <div className="flex gap-3 mt-1.5 ml-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => onReply(comment.id)} className="text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors flex items-center gap-1">
              <CornerDownRight size={10} /> Reply
            </button>
            {isOwner && (
              <>
                {(() => {
                  const createdTime = new Date(comment.createdAt).getTime();
                  const now = new Date().getTime();
                  const minutesPassed = (now - createdTime) / (1000 * 60);
                  const isEditable = minutesPassed <= 30;

                  return isEditable ? (
                    <button onClick={() => setIsEditing(!isEditing)} className="text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors flex items-center gap-1">
                      Edit
                    </button>
                  ) : null;
                })()}
                <button onClick={() => onDelete(comment.id)} className="text-[9px] font-black text-muted-foreground uppercase hover:text-cayenne-red-500 transition-colors flex items-center gap-1">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render Children */}
      {comment.children && comment.children.map(child => (
        <CommentItem
          key={child.id}
          comment={child}
          user={user}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      ))}
    </div>
  );
};

const PostAction = ({ icon, count, color, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground transition-all ${active ? 'bg-card shadow-sm text-primary' : 'hover:bg-muted/80 text-muted-foreground/80'} ${color}`}
  >
    <span className={active ? 'scale-110 transition-transform' : ''}>{icon}</span>
    <span className="text-[11px] font-black tracking-tight">{count}</span>
  </button>
);

export default PostCard;
