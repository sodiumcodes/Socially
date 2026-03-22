import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { Calendar, MapPin, Clock, Users, ExternalLink, Plus, X, Upload, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsCreateModalOpen(true);
    }
  }, [location.state]);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    category: 'Workshop',
    image: null
  });

  const categories = ['Workshop', 'Meetup', 'Career', 'Hackathon', 'Seminar', 'Other'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        if (error.message.includes('relation "events" does not exist')) {
          console.warn('events table does not exist yet.');
          setEvents([]);
          return;
        }
        throw error;
      }
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      let image_url = null;
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts') // Reusing posts bucket for simplicity
          .upload(filePath, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
        
        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          event_time: formData.event_time,
          location: formData.location,
          category: formData.category,
          image_url: image_url
        });

      if (error) throw error;

      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        category: 'Workshop',
        image: null
      });
      fetchEvents();
    } catch (err) {
      console.error('Event creation failed:', err);
      let msg = err.message;
      if (msg.includes('relation "events" does not exist')) {
        msg = "The 'events' table is missing. Please run the database migration script.";
      }
      alert('Failed to create event: ' + msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <Navbar />
      <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
        <Sidebar />
        
        <main className="flex-1 max-w-[800px] w-full min-w-0">
          <div className="mb-8 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <CalendarIcon className="text-indigo-500 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">Campus Events</h1>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Never miss what's happening</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus size={20} /> <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">Create Event</span>
            </button>
          </div>

          <div className="space-y-6 px-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : events.length > 0 ? (
              events.map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-sm group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden bg-muted">
                      {event.image_url ? (
                        <img src={event.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <CalendarIcon size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur-md rounded-xl shadow-lg">
                        <p className="text-xs font-black text-primary uppercase tracking-widest text-center">
                          {new Date(event.event_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {event.category}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground text-sm font-medium mb-6 leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Clock size={16} className="text-icon" />
                            <span className="text-xs font-bold uppercase tracking-tight">{event.event_time.slice(0, 5)}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <MapPin size={16} className="text-icon" />
                            <span className="text-xs font-bold uppercase tracking-tight truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-muted hover:bg-primary hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                        Register Now <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-card p-16 rounded-[3rem] border border-border text-center shadow-sm">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon size={32} className="text-border" />
                </div>
                <h2 className="text-xl font-black text-foreground mb-2">No events scheduled</h2>
                <p className="text-muted-foreground text-sm font-medium">Be the first to create an event on campus!</p>
              </div>
            )}
          </div>
        </main>

        <Rightbar />
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !creating && setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-2xl rounded-[2.5rem] border border-border shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Create Event</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={creating}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Event Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Annual Tech Hackathon"
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell students more about the event..."
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Time</label>
                    <input 
                      type="time" 
                      required
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Location</label>
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Auditorium B, Block 2"
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
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Event Cover Image</label>
                    <div 
                      onClick={() => !creating && document.getElementById('event-image-upload').click()}
                      className={`
                        border-2 border-dashed border-border rounded-[2rem] p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all
                        ${formData.image ? 'border-primary bg-primary/5' : ''}
                      `}
                    >
                      <input 
                        id="event-image-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {formData.image ? (
                        <div className="flex flex-col items-center">
                          <img src={URL.createObjectURL(formData.image)} alt="Preview" className="w-20 h-20 rounded-xl object-cover mb-2" />
                          <p className="text-xs font-bold text-foreground">{formData.image.name}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="text-muted-foreground w-8 h-8 mb-2" />
                          <p className="text-xs font-bold text-foreground">Click to upload image</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={creating}
                  className={`
                    w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 mt-4
                    ${creating 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : 'bg-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02]'}
                  `}
                >
                  {creating ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating...</>
                  ) : (
                    'Create Event'
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

export default Events;
