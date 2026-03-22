import { getAvatarUrl } from './avatar';

/** Map Supabase comment rows (+ nested profiles) to PostCard shape */
export function mapCommentRows(rows) {
  if (!rows?.length) return [];
  return rows.map(c => ({
    id: c.id,
    user: c.profiles?.full_name || 'Unknown',
    userId: c.user_id,
    avatar: getAvatarUrl(c.profiles?.full_name, c.profiles?.avatar_url),
    text: c.text,
    parentId: c.parent_id,
    time: new Date(c.created_at).toLocaleDateString(),
    createdAt: c.created_at
  }));
}
