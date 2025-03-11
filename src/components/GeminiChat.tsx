import React, { useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GeminiChatProps {
  messages: ChatMessage[];
}

const GeminiChat: React.FC<GeminiChatProps> = ({ messages }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={chatRef}
      className="h-64 overflow-y-auto border rounded p-4 bg-gray-50"
    >
      {messages.map((msg, index) => (
        <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
          <div 
            className={`inline-block px-3 py-2 rounded-lg max-w-xs md:max-w-md ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {msg.content}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {msg.role === 'user' ? 'You' : 'Gemini'}
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="text-gray-400 text-center py-4">
          No messages yet. Start a conversation!
        </div>
      )}
    </div>
  );
};

export default GeminiChat;