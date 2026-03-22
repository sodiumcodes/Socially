import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getAvatarUrl } from '../utils/avatar';
import { useNavigate } from 'react-router-dom';

const ConnectionsModal = ({ isOpen, onClose, type, userId, currentUserId }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchConnections();
        }
    }, [isOpen, type, userId]);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            let query;
            if (type === 'followers') {
                // People who follow this user
                query = supabase
                    .from('connections')
                    .select('user_id, profiles:user_id (id, full_name, avatar_url, branch, batch)')
                    .eq('friend_id', userId)
                    .eq('status', 'accepted');
            } else {
                // People this user follows
                query = supabase
                    .from('connections')
                    .select('friend_id, profiles:friend_id (id, full_name, avatar_url, branch, batch)')
                    .eq('user_id', userId)
                    .eq('status', 'accepted');
            }

            const { data, error } = await query;
            if (error) throw error;

            const profiles = data.map(item => item.profiles);
            setList(profiles || []);
        } catch (err) {
            console.error(`Failed to fetch ${type}:`, err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (id) => {
        onClose();
        navigate(`/profile/${id}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card w-full max-w-md rounded-[2.5rem] border border-border shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
                            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">
                                {type === 'followers' ? 'Followers' : 'Following'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : list.length > 0 ? (
                                <div className="space-y-2">
                                    {list.map((person) => (
                                        <div
                                            key={person.id}
                                            onClick={() => handleUserClick(person.id)}
                                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getAvatarUrl(person.full_name, person.avatar_url)}
                                                    alt={person.full_name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-background"
                                                />
                                                <div>
                                                    <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                                                        {person.full_name}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        {person.branch} • {person.batch}
                                                    </p>
                                                </div>
                                            </div>
                                            {person.id === currentUserId && (
                                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">You</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground font-medium">
                                        No {type} yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConnectionsModal;
