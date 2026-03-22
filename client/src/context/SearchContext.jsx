import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [results, setResults] = useState([]);
    const [postResults, setPostResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchUsers = async (query, filters = {}) => {
        setLoading(true);
        setError(null);

        try {
            let supabaseQuery = supabase.from('profiles').select('*');

            // Substring search on full_name or username
            if (query && query.trim()) {
                // If it's a hashtag search, don't search users
                if (query.startsWith('#')) {
                    setResults([]);
                    return;
                }
                supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query.trim()}%,username.ilike.%${query.trim()}%`);
            }

            // Apply Filters
            if (filters.batches?.length > 0) {
                supabaseQuery = supabaseQuery.in('batch', filters.batches);
            }
            if (filters.campuses?.length > 0) {
                supabaseQuery = supabaseQuery.in('campus', filters.campuses);
            }
            if (filters.branches?.length > 0) {
                supabaseQuery = supabaseQuery.in('branch', filters.branches);
            }

            const { data, error: searchError } = await supabaseQuery.limit(50);

            if (searchError) throw searchError;

            setResults(data || []);
        } catch (err) {
            console.error('Search failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const searchPosts = async (query) => {
        setLoading(true);
        setError(null);
        try {
            if (!query || !query.trim()) {
                setPostResults([]);
                return;
            }

            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (id, full_name, avatar_url),
                    likes (user_id),
                    comments (id)
                `)
                .ilike('content', `%${query.trim()}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPostResults(data || []);
        } catch (err) {
            console.error('Post search failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SearchContext.Provider value={{ results, postResults, loading, error, searchUsers, searchPosts }}>
            {children}
        </SearchContext.Provider>
    );
};
