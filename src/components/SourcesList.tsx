import React from 'react';
import SourceCard from './SourceCard';

// Reutilizando a interface Source do SourceCard.tsx
interface Source {
  id: string;
  title: string;
  content: string;
  filename?: string;
  filetype?: string;
  relevance?: number;
  page?: number;
}

interface SourcesListProps {
  sources: Source[];
  title?: string;
  onSourceClick?: (source: Source) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const SourcesList: React.FC<SourcesListProps> = ({
  sources,
  title = "Fontes Relevantes",
  onSourceClick,
  isLoading = false,
  emptyMessage = "Nenhuma fonte relevante encontrada"
}) => {
  // Ordenar fontes por relevância, se disponível
  const sortedSources = [...sources].sort((a, b) => {
    if (a.relevance === undefined && b.relevance === undefined) return 0;
    if (a.relevance === undefined) return 1;
    if (b.relevance === undefined) return -1;
    return b.relevance - a.relevance;
  });
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{sources.length} {sources.length === 1 ? 'fonte' : 'fontes'}</span>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSources.map((source) => (
            <SourceCard 
              key={source.id} 
              source={source} 
              onClick={onSourceClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default SourcesList; 