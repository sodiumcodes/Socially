import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Users, Loader2 } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import UserCard from '../components/UserCard';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results, loading, error, searchUsers } = useSearch();

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    const batchFilter = searchParams.get('batch')?.split(',').filter(Boolean) || [];
    const campusFilter = searchParams.get('campus')?.split(',').filter(Boolean) || [];
    const branchFilter = searchParams.get('branch')?.split(',').filter(Boolean) || [];

    useEffect(() => {
        // If no query and no filters, we can either show all or redirect
        // For now, let's search with whatever we have (even if it's just filters)
        searchUsers(query, {
            batches: batchFilter,
            campuses: campusFilter,
            branches: branchFilter
        });
    }, [location.search]); // Depend on the whole search string

    return (
        <div className="bg-[#F1F5F9] min-h-screen text-slate-900">
            <Navbar />
            <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
                <Sidebar />

                <main className="flex-1 max-w-[800px] mx-auto px-4 py-6">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                <SearchIcon className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Search Results</h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Showing users matching "{query}"</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                            <Users size={16} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-900">{results.length} Found</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Searching campus records...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-center">
                            <p className="text-rose-600 font-bold">Search error: {error}</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map(user => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SearchIcon size={32} className="text-slate-200" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">No users found</h2>
                            <p className="text-slate-400 text-sm font-medium">Try a different name, campus, or batch.</p>
                        </div>
                    )}
                </main>

                <Rightbar />
            </div>
        </div>
    );
};

export default SearchResults;
