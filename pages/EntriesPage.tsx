
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, ListFilter, ArrowUpDown, ChevronRight, Edit3 } from 'lucide-react';
import { entryService } from '../services/entryService';
import { LearningEntry, Category } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { format } from 'date-fns';

const EntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LearningEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    entryService.getEntries().then(data => {
      setEntries(data);
      setFilteredEntries(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filtered = entries.filter(e => {
      const matchesSearch = e.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredEntries(filtered);
  }, [searchTerm, selectedCategory, entries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Learning History</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-2 font-medium ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search topics or tags..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
            <select 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as Category | 'All')}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort By</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none">
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Longest Study Time</option>
              <option>Alphabetical</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
            <div className="flex gap-2">
              <button className="flex-1 py-2 px-3 border border-blue-200 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg">Published</button>
              <button className="flex-1 py-2 px-3 border border-gray-200 text-gray-500 text-sm font-bold rounded-lg">Draft</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredEntries.map(entry => (
          <div 
            key={entry._id}
            className="group flex flex-col md:flex-row bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
          >
            <Link to={`/entries/${entry._id}`} className={`md:w-32 flex flex-col items-center justify-center p-4 bg-gray-50 group-hover:bg-blue-50 transition-colors border-r border-gray-100`}>
              <span className="text-xl font-bold text-gray-900">{format(new Date(entry.date), 'dd')}</span>
              <span className="text-sm font-medium text-gray-500 uppercase">{format(new Date(entry.date), 'MMM')}</span>
            </Link>
            
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase">
                  {CATEGORY_ICONS[entry.category]}
                  {entry.category}
                  <span className="text-gray-300 mx-1">•</span>
                  <span className="text-gray-400 normal-case font-medium">{entry.timeSpent.amount} {entry.timeSpent.unit}</span>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/entry/${entry._id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit Log"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <Link to={`/entries/${entry._id}`}>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{entry.topic}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{entry.keyTakeaway}</p>
                
                <div className="flex flex-wrap items-center gap-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">#{tag}</span>
                  ))}
                </div>
              </Link>
            </div>

            <Link to={`/entries/${entry._id}`} className="p-6 flex items-center justify-center border-l border-gray-100 bg-gray-50 md:bg-transparent">
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          </div>
        ))}

        {filteredEntries.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <ArrowUpDown className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No logs found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntriesPage;
