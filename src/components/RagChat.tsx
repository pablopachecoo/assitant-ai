import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface Source {
  title: string;
  content: string;
  relevance?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

interface RagChatProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

const RagChat: React.FC<RagChatProps> = ({ messages, isLoading = false }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={chatRef}
      className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 shadow-inner"
    >
      {messages.map((msg, index) => (
        <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
          <div 
            className={`inline-block px-4 py-3 rounded-lg max-w-xs md:max-w-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
            }`}
          >
            <div className="prose prose-sm">
              {msg.content}
              {msg.isStreaming && <span className="ml-1 animate-pulse">▌</span>}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 px-1">
            {msg.role === 'user' ? 'Você' : 'Gemini'}
          </div>
          
          {/* Fontes citadas */}
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-2 text-left">
              <div className="text-xs font-medium text-gray-500 mb-1">Fontes:</div>
              <div className="flex flex-wrap gap-2">
                {msg.sources.map((source, sourceIndex) => (
                  <div 
                    key={sourceIndex} 
                    className="bg-gray-100 border border-gray-200 rounded-md p-2 text-xs text-gray-700 max-w-xs"
                  >
                    <div className="font-medium mb-1">{source.title}</div>
                    <div className="text-gray-600 text-xs line-clamp-3">{source.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {messages.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center py-12 flex flex-col items-center">
          <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
          <p>Envie uma mensagem para iniciar a conversa!</p>
        </div>
      )}
      
      {isLoading && messages.length === 0 && (
        <div className="text-gray-400 text-center py-12">
          <div className="animate-pulse">Carregando...</div>
        </div>
      )}
    </div>
  );
};

export default RagChat; 