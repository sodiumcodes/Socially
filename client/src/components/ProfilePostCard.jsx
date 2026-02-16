import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const ProfilePostCard = ({ post }) => {
    if (!post) return null;

    // Check if visibility is custom (not "All" or "Public")
    const isCustom = post.visibility && post.visibility !== "All" && post.visibility !== "Public";

    // Get the first image from images array or fallback to single image
    const imageUrl = (post.images && post.images.length > 0)
        ? post.images[0]
        : post.image || 'https://via.placeholder.com/400x300/e0c3fc/000000?text=No+Image';

    return (
        <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            {/* Post Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={post.content || 'Post image'}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Post Content */}
            <div className="p-4">
                {/* Caption */}
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {post.content || post.caption || 'No caption'}
                </p>

                {/* Action Row */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    {/* Likes */}
                    <div className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes || 0}</span>
                    </div>

                    {/* Comments */}
                    <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentCount || post.comments || 0}</span>
                    </div>

                    {/* Share or Customized Label */}
                    {isCustom ? (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full font-medium">
                            Customized
                        </span>
                    ) : (
                        <div className="flex items-center gap-1.5 hover:text-green-500 cursor-pointer transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePostCard;
