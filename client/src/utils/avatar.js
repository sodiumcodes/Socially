/**
 * Logic for profile picture placeholders:
 * - If avatar_url exists, use it (unless it's a ui-avatars placeholder).
 * - If not, show initials with brand-consistent styling.
 */
export const getAvatarUrl = (userOrName, avatarUrl) => {
    // 1. If it's a real avatar URL (not from ui-avatars), return it
    if (avatarUrl && !avatarUrl.includes('ui-avatars.com')) {
        return avatarUrl;
    }

    let name = '';

    // 2. Extract name from object or string
    if (typeof userOrName === 'object' && userOrName !== null) {
        // Double check if the object has a real avatar_url
        const objUrl = userOrName.avatar_url || userOrName.user_metadata?.avatar_url;
        if (objUrl && !objUrl.includes('ui-avatars.com')) return objUrl;

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
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
        initials = parts[0].substring(0, 2).toUpperCase();
    } else {
        initials = 'US';
    }

    // 4. Return UI-Avatars URL (Slate 900 background: 0f172a, white text, bold)
    // We generate a fresh one to guarantee brand consistency across all components.
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=bb&bold=true`;
};
