import React from 'react';

const StatsSection = ({ stats }) => {
    return (
        <div className="flex items-center gap-8 px-8 py-4 border-t border-border">
            {/* Posts */}
            <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.posts}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Posts</div>
            </div>

            {/* Followers */}
            <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.followers}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Followers</div>
            </div>

            {/* Following */}
            <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.following}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Following</div>
            </div>
        </div>
    );
};

export default StatsSection;
