/**
 * Logic for profile picture placeholders:
 * - If avatar_url exists, use it.
 * - If not, show initials:
 *     - First letters of first name and last name (e.g., "Naina Dugar" -> "ND")
 *     - If only one name is provided, first two letters (e.g., "Naina" -> "NA")
 *     - Fallback to "US"
 */
export const getAvatarUrl = (userOrName, avatarUrl) => {
    // 1. Direct avatar URL check
    if (avatarUrl) return avatarUrl;

    let name = '';

    // 2. Extract name from object or string
    if (typeof userOrName === 'object' && userOrName !== null) {
        // Sometimes the avatar_url is inside the object itself
        if (userOrName.avatar_url) return userOrName.avatar_url;
        if (userOrName.user_metadata?.avatar_url) return userOrName.user_metadata.avatar_url;

        name = userOrName.full_name ||
            userOrName.name ||
            userOrName.user_metadata?.full_name ||
            userOrName.user_metadata?.name ||
            userOrName.email?.split('@')[0] ||
            'User';
    } else if (typeof userOrName === 'string') {
        name = userOrName;
    } else {
        name = 'User';
    }

    // 3. Compute Initials
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    let initials = '';

    if (parts.length >= 2) {
        // First letter of first name + first letter of last name
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
        // First two letters of the name
        initials = parts[0].substring(0, 2).toUpperCase();
    } else {
        initials = 'US';
    }

    // 4. Return UI-Avatars URL
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=f##`;
};
