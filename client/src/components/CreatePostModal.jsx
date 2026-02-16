import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Globe, Lock, Users, ChevronDown, Loader2, AlertCircle, Briefcase, Calendar, Megaphone, FileText, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

// Verification Constants
const MIN_CONTENT_LENGTH = 10;
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];

const CreatePostModal = () => {
  const { isCreatePostOpen, closeCreatePost, createPost } = usePosts();
  const { user } = useAuth();

  // Form State
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // Array of files
  const [previewUrls, setPreviewUrls] = useState([]); // Array of preview URLs

  // Settings State
  const [category, setCategory] = useState('general'); // Default: General

  // UI State
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selections
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedCampuses, setSelectedCampuses] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  // Temp State (Buffered for Visibility Panel)
  const [tempBatches, setTempBatches] = useState([]);
  const [tempCampuses, setTempCampuses] = useState([]);
  const [tempBranches, setTempBranches] = useState([]);

  // UI Toggles
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAdvancedVisibility, setShowAdvancedVisibility] = useState(false);

  // Constants
  const BATCHES = ['2023', '2024', '2025'];
  const CAMPUSES = ['Bengaluru', 'Pune', 'Noida', 'Lucknow', 'Patna', 'Indore', 'Online'];
  const BRANCHES = ['School of Technology', 'School of Management', 'School of Health'];

  // Toggle Helpers
  const toggleSelection = (item, currentList, setList) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const toggleAll = (allList, currentList, setList) => {
    if (currentList.length === allList.length) {
      setList([]);
    } else {
      setList([...allList]);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setContent(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const textareaRef = useRef(null);
  const visibilityMenuRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (visibilityMenuRef.current && !visibilityMenuRef.current.contains(event.target)) {
        // If filters are selected in temp state, don't close
        const hasFilters = tempBatches.length > 0 || tempCampuses.length > 0 || tempBranches.length > 0;
        if (!hasFilters) {
          setShowAdvancedVisibility(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tempBatches, tempCampuses, tempBranches]); // Add dependencies

  // Focus and Reset
  useEffect(() => {
    if (isCreatePostOpen) {
      if (textareaRef.current) textareaRef.current.focus();
      // Reset state on open
      setContent('');
      setImageFiles([]);
      setPreviewUrls([]);
      setCategory('general');
      setSelectedBatches([]);
      setSelectedCampuses([]);
      setSelectedBranches([]);
      setTempBatches([]);
      setTempCampuses([]);
      setTempBranches([]);
      setError('');
      setIsSubmitting(false); // Reset submitting state when modal opens
    }
  }, [isCreatePostOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        const hasFilters = tempBatches.length > 0 || tempCampuses.length > 0 || tempBranches.length > 0;
        if (showAdvancedVisibility && hasFilters) return;
        closeCreatePost();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCreatePost, showAdvancedVisibility, tempBatches, tempCampuses, tempBranches]);

  const handleGuardedClose = () => {
    const hasFilters = tempBatches.length > 0 || tempCampuses.length > 0 || tempBranches.length > 0;
    if (showAdvancedVisibility && hasFilters) return;
    closeCreatePost();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 2. CONTENT VALIDATION
    if (!content.trim() || content.trim().length < MIN_CONTENT_LENGTH) {
      setError(`Post content must be at least ${MIN_CONTENT_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate Backend Latency
      // await new Promise(resolve => setTimeout(resolve, 800));

      // Build Visibility Object
      const isCustomSelected = selectedBatches.length > 0 || selectedCampuses.length > 0 || selectedBranches.length > 0;
      const visibilityPayload = isCustomSelected ? {
        batches: selectedBatches,
        campuses: selectedCampuses,
        branches: selectedBranches
      } : null;

      // Build FormData
      const formData = new FormData();
      formData.append('content', content);

      // Append all images
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      formData.append('visibility', visibilityPayload ? JSON.stringify(visibilityPayload) : 'null');
      formData.append('category', category);

      await createPost(formData);

      setIsSubmitting(false); // Reset submitting state after success
      closeCreatePost();
      // Reset additional state
      setSelectedBatches([]);
      setSelectedCampuses([]);
      setSelectedBranches([]);
      setShowAdvancedVisibility(false);

      // Revoke all preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));

    } catch (err) {
      setError(err.message || 'Failed to post. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isCreatePostOpen) return null;

  const isValid = content.trim().length >= MIN_CONTENT_LENGTH;

  const categories = [
    { label: 'General Update', icon: FileText, color: 'text-slate-500' },
    { label: 'Career Guidance', icon: Briefcase, color: 'text-indigo-500' },
    { label: 'Opportunity', icon: Megaphone, color: 'text-emerald-500' },
    { label: 'Event', icon: Calendar, color: 'text-rose-500' },
  ];

  const currentCategory = categories.find(c => c.label === category) || categories[0];

  return (
    <AnimatePresence>
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleGuardedClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Create Post</h2>
              <button
                onClick={handleGuardedClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">

              {/* Error Banner */}
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="bg-rose-50 px-6 py-3 mb-4 rounded-xl border border-rose-100 flex items-center gap-2 text-rose-600 text-xs font-bold"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 mb-4">
                <img
                  src={getAvatarUrl(user)}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-50 shrink-0"
                />
                <div className="flex-1 w-full">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight mb-2">{user?.name}</h3>

                  {/* Selectors Row */}
                  <div className="flex flex-wrap gap-2 relative">
                    {/* Visibility Main Selector */}
                    <div className="relative" ref={visibilityMenuRef}>
                      <button
                        onClick={() => {
                          if (showAdvancedVisibility) {
                            // If trying to close via button, check for filters
                            const hasFilters = tempBatches.length > 0 || tempCampuses.length > 0 || tempBranches.length > 0;
                            if (hasFilters) return;
                          } else {
                            // Sync temp state with main state when opening
                            setTempBatches([...selectedBatches]);
                            setTempCampuses([...selectedCampuses]);
                            setTempBranches([...selectedBranches]);
                          }
                          setShowAdvancedVisibility(!showAdvancedVisibility);
                        }}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all border ${showAdvancedVisibility ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'text-slate-500 bg-slate-100/80 border-transparent hover:border-slate-200'
                          }`}
                      >
                        <Globe size={11} />
                        Visibility {(selectedBatches.length + selectedCampuses.length + selectedBranches.length) > 0 && `(${selectedBatches.length + selectedCampuses.length + selectedBranches.length} selected)`}
                        <ChevronDown size={11} className={`transition-transform ${showAdvancedVisibility ? 'rotate-180' : ''}`} />
                      </button>

                      {/* ADVANCED VISIBILITY POPUP */}
                      <AnimatePresence>
                        {showAdvancedVisibility && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 p-4 z-50 origin-top-left"
                          >
                            <div className="space-y-4">
                              {/* Header with Clear All */}
                              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
                                {(tempBatches.length > 0 || tempCampuses.length > 0 || tempBranches.length > 0) && (
                                  <button
                                    onClick={() => {
                                      setTempBatches([]);
                                      setTempCampuses([]);
                                      setTempBranches([]);
                                    }}
                                    className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-tight"
                                  >
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Audience Configuration Panel */}
                              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">

                                {/* Batches Group */}
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batches</label>
                                    <button onClick={() => toggleAll(BATCHES, tempBatches, setTempBatches)} className="text-[9px] font-bold text-indigo-600 hover:underline">
                                      {tempBatches.length === BATCHES.length ? 'Clear' : 'Select All'}
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {BATCHES.map(batch => (
                                      <button
                                        key={batch}
                                        onClick={() => toggleSelection(batch, tempBatches, setTempBatches)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${tempBatches.includes(batch) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'}`}
                                      >
                                        {batch}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Campus Group */}
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campuses</label>
                                    <button onClick={() => toggleAll(CAMPUSES, tempCampuses, setTempCampuses)} className="text-[9px] font-bold text-indigo-600 hover:underline">
                                      {tempCampuses.length === CAMPUSES.length ? 'Clear' : 'Select All'}
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {CAMPUSES.map(campus => (
                                      <button
                                        key={campus}
                                        onClick={() => toggleSelection(campus, tempCampuses, setTempCampuses)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${tempCampuses.includes(campus) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200 hover:border-teal-200'}`}
                                      >
                                        {campus}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Branch Group */}
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branches</label>
                                    <button onClick={() => toggleAll(BRANCHES, tempBranches, setTempBranches)} className="text-[9px] font-bold text-indigo-600 hover:underline">
                                      {tempBranches.length === BRANCHES.length ? 'Clear' : 'Select All'}
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    {BRANCHES.map(branch => (
                                      <button
                                        key={branch}
                                        onClick={() => toggleSelection(branch, tempBranches, setTempBranches)}
                                        className={`px-2 py-1.5 rounded-md text-[10px] font-bold border text-left transition-all ${tempBranches.includes(branch) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-500 border-slate-200 hover:border-orange-200'}`}
                                      >
                                        {branch}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                              </div>

                              {/* Footer Submit Button */}
                              <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedBatches(tempBatches);
                                    setSelectedCampuses(tempCampuses);
                                    setSelectedBranches(tempBranches);
                                    setShowAdvancedVisibility(false);
                                  }}
                                  disabled={
                                    tempBatches.length === selectedBatches.length &&
                                    tempCampuses.length === selectedCampuses.length &&
                                    tempBranches.length === selectedBranches.length &&
                                    tempBatches.every(v => selectedBatches.includes(v)) &&
                                    tempCampuses.every(v => selectedCampuses.includes(v)) &&
                                    tempBranches.every(v => selectedBranches.includes(v))
                                  }
                                  className={`w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${!(
                                    tempBatches.length === selectedBatches.length &&
                                    tempCampuses.length === selectedCampuses.length &&
                                    tempBranches.length === selectedBranches.length &&
                                    tempBatches.every(v => selectedBatches.includes(v)) &&
                                    tempCampuses.every(v => selectedCampuses.includes(v)) &&
                                    tempBranches.every(v => selectedBranches.includes(v))
                                  )
                                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Category Selector */}
                    <div className="relative">
                      <button
                        onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowAdvancedVisibility(false); }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <ChevronDown size={10} />
                        {currentCategory ? currentCategory.label : category}
                      </button>

                      <AnimatePresence>
                        {showCategoryMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 overflow-hidden"
                          >
                            {categories.map((cat) => (
                              <button
                                key={cat.label}
                                onClick={() => {
                                  setCategory(cat.label);
                                  setShowCategoryMenu(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold flex items-center gap-2 transition-colors ${category === cat.label ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                <cat.icon size={14} className={category === cat.label ? 'text-indigo-600' : cat.color} />
                                {cat.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts... (min 10 chars)"
                className="w-full text-base text-slate-700 placeholder:text-slate-300 border-none outline-none resize-none bg-transparent min-h-[120px]"
              />

              <div className="mb-4">
                <input
                  type="file"
                  id="post-image-upload"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);

                    // Check max limit
                    if (imageFiles.length + files.length > 5) {
                      setError(`Maximum 5 images allowed. You have ${imageFiles.length} and tried to add ${files.length} more.`);
                      return;
                    }

                    try {
                      // Preserve original images (no auto-cropping)
                      const newPreviewUrls = files.map(file => URL.createObjectURL(file));

                      setImageFiles(prev => [...prev, ...files]);
                      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
                      setError(''); // Clear any previous errors
                    } catch (err) {
                      setError('Failed to process images. Please try again.');
                    }

                    // Reset input
                    e.target.value = '';
                  }}
                />
              </div>

              {previewUrls.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">
                      {previewUrls.length}/5 images
                    </span>
                    <button
                      onClick={() => {
                        previewUrls.forEach(url => URL.revokeObjectURL(url));
                        setImageFiles([]);
                        setPreviewUrls([]);
                      }}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600"
                    >
                      Remove All
                    </button>
                  </div>
                  <div className={`grid gap-2 ${previewUrls.length === 1 ? 'grid-cols-1' :
                    previewUrls.length === 2 ? 'grid-cols-2' :
                      previewUrls.length === 3 ? 'grid-cols-3' :
                        previewUrls.length === 4 ? 'grid-cols-2' :
                          'grid-cols-3'
                    }`}>
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden group border border-slate-100">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover"
                          style={{ aspectRatio: '4/5' }}
                        />
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(url);
                            setImageFiles(prev => prev.filter((_, i) => i !== index));
                            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 pt-4 border-t border-slate-50 bg-white sticky bottom-0 z-10">
              <div className="flex gap-2 relative">
                <div className="flex gap-1">
                  <button
                    onClick={() => document.getElementById('post-image-upload')?.click()}
                    className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Add Image"
                  >
                    <Image size={22} />
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                  >
                    <Smile size={22} />
                  </button>
                </div>
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    {/* We will lazy load or load the picker here if available, or just a placeholder if not. 
                          Since package.json says emoji-picker-react is there, we use it. */}
                    <React.Suspense fallback={<div className="bg-white p-4 shadow-xl rounded-2xl">Loading...</div>}>
                      <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                    </React.Suspense>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold transition-colors ${content.length > 0 && content.length < MIN_CONTENT_LENGTH ? 'text-orange-500' : 'text-slate-300'}`}>
                    {content.length > 0 && content.length < MIN_CONTENT_LENGTH ? `${MIN_CONTENT_LENGTH - content.length} more` : `${content.length}/500`}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className={`
                    px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all transform flex items-center gap-2
                    ${(!isValid || isSubmitting)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5'
                    }
                  `}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
