import React, { useEffect, useState } from 'react';
import { 
  Calendar, Sparkles, TrendingUp, ArrowUpRight, MapPin, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Rightbar = () => {
  const navigate = useNavigate();
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('posts')
          .select('content')
          .gt('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        const counts = {};
        data.forEach(post => {
          if (!post.content) return;
          const tags = post.content.match(/#\w+/g);
          if (tags) {
            tags.forEach(tag => {
              const cleanTag = tag.slice(1);
              counts[cleanTag] = (counts[cleanTag] || 0) + 1;
            });
          }
        });

        const sorted = Object.entries(counts)
          .map(([tag, count]) => ({ tag, postsCount: count }))
          .sort((a, b) => b.postsCount - a.postsCount)
          .slice(0, 5)
          .map((item, i) => ({
            tag: item.tag,
            posts: item.postsCount > 999 ? (item.postsCount / 1000).toFixed(1) + 'k' : item.postsCount.toString(),
            rank: i + 1,
            category: 'Trending'
          }));

        setTrendingHashtags(sorted);
      } catch (err) {
        console.error('Trending fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleHashtagClick = (tag) => {
    navigate(`/search?q=%23${tag}`);
  };

  return (
    /* FIX: Isolated Scroll 
       Using h-[calc(100vh-theme(spacing.20))] ensures it fits below navbar 
       and scrolls independently without affecting the Feed.
    */
    <aside className="w-[340px] hidden xl:flex flex-col gap-6 h-[calc(100vh-80px)] overflow-y-auto pr-4 pl-2 no-scrollbar py-6 sticky top-20">
      
      {/* 1. Refined Trending Section */}
      <section className="bg-card rounded-[2.5rem] border border-border shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 px-1">
            <h3 className="font-black text-foreground text-[13px] uppercase tracking-widest flex items-center gap-2">
              Trending <TrendingUp size={16} className="text-icon" />
            </h3>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : trendingHashtags.length > 0 ? (
              trendingHashtags.map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 5 }}
                  onClick={() => handleHashtagClick(item.tag)}
                  className="group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-muted"
                >
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-muted-foreground/60 w-4">{item.rank}</span>
                     <div>
                       <p className="text-[11px] font-bold text-primary uppercase tracking-tighter mb-0.5">{item.category}</p>
                       <p className="font-black text-foreground text-sm">#{item.tag}</p>
                       <p className="text-[10px] text-muted-foreground font-bold">{item.posts} posts</p>
                     </div>
                  </div>
                  <div className="text-border group-hover:text-icon group-hover:translate-x-1 transition-all">
                     <ArrowUpRight size={18} />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-[10px] text-muted-foreground font-bold text-center py-4 uppercase tracking-widest">No recent trends</p>
            )}
          </div>

          <button className="w-full mt-6 py-3.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border hover:border-primary/40 hover:text-primary rounded-2xl transition-all">
            Show More
          </button>
        </div>
      </section>

      {/* 2. Campus Pulse (Events) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-4">
          <h3 className="font-black text-foreground text-[13px] uppercase tracking-widest flex items-center gap-2">
            Campus Pulse <Sparkles size={14} className="text-amber-flame-500" />
          </h3>
        </div>

        <div className="space-y-3">
          <EventCard 
            title="UI Design Workshop"
            time="4:00 PM"
            location="Auditorium A"
            image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=100"
            date="24 Jan"
          />
          <EventCard 
            title="Tech Stack Meetup"
            time="10:30 AM"
            location="Block 4 Lab"
            image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=100"
            date="26 Jan"
          />
          <EventCard 
            title="Career Fair 2026"
            time="9:00 AM"
            location="Main Hall"
            image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
            date="02 Feb"
          />
        </div>
      </section>

      {/* 3. Minimal Footer Info */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {['Privacy', 'Terms', 'Help', 'Advertising'].map(link => (
            <span key={link} className="text-[10px] font-bold text-muted-foreground/70 hover:text-primary cursor-pointer transition-colors uppercase tracking-tight">{link}</span>
          ))}
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/50 mt-4 uppercase tracking-widest">© 2026 WeShare Campus</p>
      </div>

    </aside>
  );
};

/* --- Refined Internal Components --- */

const EventCard = ({ title, time, location, image, date }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-card p-4 rounded-[2.2rem] border border-border shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
  >
    <div className="relative shrink-0">
      <img src={image} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-border" alt="" />
      <div className="absolute -top-2 -left-2 bg-primary text-[8px] font-black text-primary-foreground px-2 py-1 rounded-lg shadow-lg">
        {date}
      </div>
    </div>
    
    <div className="flex-1 min-w-0">
      <h4 className="text-[12px] font-black text-foreground truncate mb-1">{title}</h4>
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
          <Clock size={10} className="text-icon" /> {time}
        </p>
        <p className="text-[10px] font-medium text-muted-foreground truncate flex items-center gap-1">
          <MapPin size={10} /> {location}
        </p>
      </div>
    </div>
  </motion.div>
);

export default Rightbar;