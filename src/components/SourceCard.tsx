import React from 'react';
import { FileText, FileCode, BookOpen } from 'lucide-react';

interface Source {
  id: string;
  title: string;
  content: string;
  filename?: string;
  filetype?: string;
  relevance?: number;
  page?: number;
}

interface SourceCardProps {
  source: Source;
  onClick?: (source: Source) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, onClick }) => {
  const getFileIcon = () => {
    if (!source.filetype) return <FileText className="h-5 w-5 text-gray-400" />;
    
    switch(source.filetype.toLowerCase()) {
      case 'md':
      case 'markdown':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case 'txt':
      case 'text':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'json':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <FileCode className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(source);
    }
  };

  return (
    <div 
      className={`
        border border-gray-200 rounded-lg shadow-sm p-4 bg-white 
        hover:shadow-md transition-shadow duration-200
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {source.title}
            </h3>
            {source.relevance !== undefined && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {Math.round(source.relevance * 100)}% relevante
              </span>
            )}
          </div>
          
          <div className="mt-1 text-xs text-gray-500 flex items-center">
            {source.filename && (
              <span className="truncate max-w-[150px]">{source.filename}</span>
            )}
            {source.page !== undefined && (
              <span className="ml-1">• Página {source.page}</span>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-600 line-clamp-3 bg-gray-50 p-2 rounded border border-gray-100">
            {source.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceCard; 