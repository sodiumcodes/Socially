import React from 'react';

const StatsSection = ({ stats }) => {
    return (
        <div className="flex items-center gap-8 px-8 py-4 border-t border-gray-200">
            {/* Posts */}
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.posts}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Posts</div>
            </div>

            {/* Followers */}
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.followers}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Followers</div>
            </div>

            {/* Following */}
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.following}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Following</div>
            </div>
        </div>
    );
};

export default StatsSection;
