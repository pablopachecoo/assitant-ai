import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface TextInputProps {
  onSend: (message: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState<string>('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        className="flex-1 p-2 border rounded"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleSend}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default TextInput;