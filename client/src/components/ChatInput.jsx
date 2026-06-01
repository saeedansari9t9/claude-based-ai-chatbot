import { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, onStop, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white pb-6 pt-2 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="relative flex items-end w-full border border-gray-300 rounded-[24px] px-2 py-1.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors">
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a compliance question..."
            className="w-full bg-transparent pl-4 pr-12 py-2 focus:outline-none resize-none overflow-y-auto max-h-[120px] min-h-[40px] text-[15px] text-black placeholder-gray-400"
            disabled={isLoading}
            rows={1}
            style={{ scrollbarWidth: 'none' }}
          />
          
          <div className="absolute right-2 bottom-1.5 flex items-center">
            {isLoading ? (
              <button
                onClick={(e) => { e.preventDefault(); onStop(); }}
                className="flex items-center justify-center w-9 h-9 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                title="Stop generating"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <rect x="7" y="7" width="10" height="10" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="flex items-center justify-center w-9 h-9 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
                title="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
