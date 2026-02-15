export const normalizeVisibility = (vis) => {
    if (!vis || vis === 'null' || vis === 'public') return null;
    if (typeof vis === 'string') {
        try {
            return JSON.parse(vis);
        } catch (e) {
            return vis; // Return as is for legacy strings like 'campus'
        }
    }
    return vis;
};
