import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import NotificationCard from '../components/NotificationCard';
import { Bell, BellOff } from 'lucide-react';

const Notifications = () => {
    const { user: currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    sender:profiles!sender_id (*)
                `)
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Real-time subscription
        const channel = supabase
            .channel('notifications_changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${currentUser.id}`
            }, () => {
                fetchNotifications();
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${currentUser.id}`
            }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser]);

    const handleAccept = async (notification) => {
        try {
            // 1. Update Connection Status
            const { error: connError } = await supabase
                .from('connections')
                .update({ status: 'accepted' })
                .eq('user_id', notification.sender_id)
                .eq('friend_id', currentUser.id);

            if (connError) throw connError;

            // 2. Mark notification as read or delete it (as per UX preference)
            const { error: notifError } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notification.id);

            if (notifError) throw notifError;

            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        } catch (err) {
            console.error('Failed to accept follow request:', err);
            alert('Failed to accept follow request');
        }
    };

    const handleDecline = async (notification) => {
        try {
            // 1. Delete Connection
            await supabase
                .from('connections')
                .delete()
                .eq('user_id', notification.sender_id)
                .eq('friend_id', currentUser.id);

            // 2. Delete Notification
            await supabase
                .from('notifications')
                .delete()
                .eq('id', notification.id);

            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        } catch (err) {
            console.error('Failed to decline follow request:', err);
            alert('Failed to decline follow request');
        }
    };

    return (
        <div className="bg-background min-h-screen text-foreground">
            <Navbar />
            <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
                <Sidebar />
                <main className="flex-1 max-w-2xl w-full min-w-0">
                    <div className="flex items-center justify-between mb-6 px-4 lg:px-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-card rounded-xl shadow-sm border border-border">
                                <Bell className="w-5 h-5 text-icon" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">Notifications</h1>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map(notif => (
                                <NotificationCard
                                    key={notif.id}
                                    notification={notif}
                                    onAccept={handleAccept}
                                    onDecline={handleDecline}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card rounded-[2rem] p-12 text-center border border-border shadow-sm">
                            <div className="inline-flex p-4 rounded-full bg-muted mb-4 text-muted-foreground">
                                <BellOff className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">Clear for now!</h3>
                            <p className="text-muted-foreground text-sm">You've caught up with everything.</p>
                        </div>
                    )}
                </main>
                <div className="hidden xl:block w-80 shrink-0 px-4">
                    <Rightbar />
                </div>
            </div>
        </div>
    );
};

export default Notifications;
