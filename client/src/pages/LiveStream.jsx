import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { Video, Sparkles, Play, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveStream = () => {
  return (
    <div className="bg-background min-h-screen text-foreground font-sans tracking-tight">
      <Navbar />
      <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
        <Sidebar />
        
        <main className="flex-1 max-w-[800px] w-full min-w-0">
          <div className="mb-8 px-4 flex items-center gap-3">
            <div className="p-2 bg-tiger-orange-500/10 rounded-xl">
              <Video className="text-tiger-orange-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Live Stream</h1>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Connect in real-time</p>
            </div>
          </div>

          <div className="space-y-6 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-[3rem] p-12 md:p-16 border border-border text-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-tiger-orange-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-tiger-orange-500/20 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-border">
                  <Video size={40} className="text-border" />
                </div>
                
                <h2 className="text-3xl font-black text-foreground mb-4">No Active Streams</h2>
                <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                  The campus is quiet right now. Check back later for live workshops, events, and discussions!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="px-8 py-4 bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <Sparkles size={16} /> Get Notified
                  </button>
                  <button className="px-8 py-4 bg-muted hover:bg-muted/80 text-foreground font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all border border-border flex items-center gap-3">
                    <Zap size={16} className="text-tiger-orange-500" /> Schedule Stream
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                  <ShieldCheck className="text-indigo-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-2">Verified Only</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">Only verified students and faculty can host live streams on campus pulse.</p>
                </div>
              </div>
              
              <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex items-start gap-4">
                <div className="p-3 bg-amber-flame-500/10 rounded-2xl">
                  <Play className="text-amber-flame-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-sm uppercase tracking-widest mb-2">Recordings</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">Missed a stream? Don't worry! All live events are automatically recorded.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Rightbar />
      </div>
    </div>
  );
};

export default LiveStream;
