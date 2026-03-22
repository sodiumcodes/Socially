import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { FileText, Download, ShieldCheck, Zap, Search, ChevronRight, Plus, X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Study Materials',
    file: null
  });

  const categories = [
    { name: 'Study Materials', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Exam Papers', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Research Docs', icon: Zap, color: 'text-tiger-orange-500', bg: 'bg-tiger-orange-500/10' },
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('relation "resources" does not exist')) {
          console.warn('resources table does not exist yet.');
          setResources([]);
          return;
        }
        throw error;
      }
      setResources(data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.title) return;

    setUploading(true);
    try {
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      const fileSize = (formData.file.size / (1024 * 1024)).toFixed(1) + ' MB';

      const { error: dbError } = await supabase
        .from('resources')
        .insert({
          uploader_id: user.id,
          title: formData.title,
          category: formData.category,
          file_url: publicUrl,
          file_type: fileExt.toUpperCase(),
          file_size: fileSize
        });

      if (dbError) throw dbError;

      setIsUploadModalOpen(false);
      setFormData({ title: '', category: 'Study Materials', file: null });
      fetchResources();
    } catch (err) {
      console.error('Upload failed:', err);
      let msg = err.message;
      if (msg.includes('relation "resources" does not exist')) {
        msg = "The 'resources' table is missing. Please run the database migration script.";
      }
      alert('Upload failed: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background min-h-screen text-foreground font-sans tracking-tight">
      <Navbar />
      <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
        <Sidebar />
        
        <main className="flex-1 max-w-[800px] w-full min-w-0 px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <FileText className="text-indigo-500 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">Resources</h1>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Everything you need to learn</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-64 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..." 
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} /> <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">Upload</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSearchQuery(cat.name)}
                className="bg-card p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer"
              >
                <div className={`p-3 ${cat.bg} rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <cat.icon className={`${cat.color} w-6 h-6`} />
                </div>
                <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-1">{cat.name}</h3>
                <p className="text-xs text-muted-foreground font-bold">
                  {resources.filter(r => r.category === cat.name).length} files
                </p>
              </motion.div>
            ))}
          </div>

          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-black text-foreground text-[11px] uppercase tracking-[0.2em]">
                {searchQuery ? `Results for "${searchQuery}"` : "Recently Added"}
              </h2>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                  Clear Search
                </button>
              )}
            </div>
            
            <div className="divide-y divide-border">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : filteredResources.length > 0 ? (
                filteredResources.map((file) => (
                  <div key={file.id} className="px-8 py-6 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-xl text-muted-foreground font-black text-[10px] uppercase tracking-tighter">
                        {file.file_type}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{file.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                          {file.file_size} • {file.category} • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-muted-foreground font-medium">
                  No resources found matching your search.
                </div>
              )}
            </div>
          </div>
        </main>

        <Rightbar />
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-[2.5rem] border border-border shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Upload Resource</h2>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Advanced Data Structures Notes"
                    className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">File</label>
                  <div 
                    onClick={() => !uploading && document.getElementById('file-upload').click()}
                    className={`
                      border-2 border-dashed border-border rounded-[2rem] p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all
                      ${formData.file ? 'border-primary bg-primary/5' : ''}
                    `}
                  >
                    <input 
                      id="file-upload"
                      type="file" 
                      required
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {formData.file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="text-primary w-10 h-10 mb-4" />
                        <p className="text-sm font-bold text-foreground mb-1">{formData.file.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{(formData.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="text-muted-foreground w-10 h-10 mb-4" />
                        <p className="text-sm font-bold text-foreground mb-1">Click to select file</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">Max 50MB • PDF, ZIP, DOCX</p>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={uploading || !formData.file || !formData.title}
                  className={`
                    w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                    ${uploading || !formData.file || !formData.title 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : 'bg-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02]'}
                  `}
                >
                  {uploading ? (
                    <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                  ) : (
                    'Upload Resource'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resources;
