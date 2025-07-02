import React, { useState, useEffect } from 'react';
import { Mail, Plus, Search, Sparkles } from 'lucide-react';
import { NewsletterCard, Newsletter } from '../components/NewsletterCard';

interface NewslettersPageProps {
  onCreateNew: () => void;
  onSelectNewsletter: (newsletter: Newsletter) => void;
}


export function NewslettersPage({ onCreateNew, onSelectNewsletter }: NewslettersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

  useEffect(() => {
    fetch('/api/newsletters')
    .then(r => {
      if (!r.ok) throw new Error(`API error ${r.status}`);
      return r.json();
    })
    .then(setNewsletters)
    .catch(err => {
      console.error(err);
      // maybe show a toast: “Couldn’t load newsletters—try again soon!”
    });
  }, []);

  const filteredNewsletters = newsletters.filter(newsletter =>
    newsletter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    newsletter.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Vibeletter
              </h1>
            </div>
            
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Newsletter
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                All Newsletters
              </h2>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
              Discover and subscribe to AI-generated newsletters on topics you love.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search newsletters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm placeholder-gray-400"
              />
            </div>
          </div>

          {/* Newsletters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredNewsletters.map((newsletter) => (
              <NewsletterCard
                key={newsletter.id}
                newsletter={newsletter}
                onClick={() => onSelectNewsletter(newsletter)}
              />
            ))}
          </div>

          {filteredNewsletters.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No newsletters found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or create a new newsletter.
              </p>
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Newsletter
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            Powered by advanced AI technology to create compelling newsletters
          </p>
        </div>
      </footer>
    </div>
  );
}