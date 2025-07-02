import React from 'react';
import { Mail, Users, Calendar } from 'lucide-react';

export interface Newsletter {
  id: string;
  name: string;
  prompt: string;
  created_at: string;
  subscriber_count: number;
}

interface NewsletterCardProps {
  newsletter: Newsletter;
  onClick: () => void;
}

export function NewsletterCard({ newsletter, onClick }: NewsletterCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-white/90 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {newsletter.name}
          </h3>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {newsletter.prompt}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{newsletter.subscriber_count} subscribers</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(newsletter.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}