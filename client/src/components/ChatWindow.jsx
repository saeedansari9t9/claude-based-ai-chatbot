import { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, isLoading, streamingText, onRegenerate }) => {
  const scrollRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (behavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: behavior
      });
    }
  };


  useEffect(() => {

    if (!showScrollButton) {
      scrollToBottom('auto');
    }
  }, [messages, streamingText, isLoading]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 150);
    }
  };

  return (
    <div className="flex-1 relative flex flex-col min-h-0">
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-transparent" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="max-w-4xl mx-auto flex flex-col pb-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full mt-24 text-gray-500 animate-in">
              <div className="w-16 h-16 mb-6 flex items-center justify-center border-2 border-black rounded-full text-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 9h.01M15 9h.01" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-black mb-3 tracking-tight">Welcome to Balosys</h2>
              <p className="text-center max-w-md text-[15px] leading-relaxed text-gray-500">
                I am your professional compliance advisor. Ask me any compliance-related questions and I will assist you clearly and concisely.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <MessageBubble 
                key={index} 
                role={msg.role} 
                content={msg.content} 
                onRegenerate={index === messages.length - 1 && msg.role === 'assistant' ? onRegenerate : undefined}
              />
            ))
          )}


          {isLoading && (
            <div className="mt-2">
              <MessageBubble 
                role="assistant" 
                content={
                  streamingText ? (
                    streamingText
                  ) : (
                    <span className="flex items-center gap-1.5 h-6">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  )
                } 
                isStreaming={!!streamingText}
              />
            </div>
          )}
        </div>
      </div>


      {showScrollButton && (
        <button 
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-200 text-black rounded-full p-2.5 shadow-md hover:bg-gray-50 transition-all z-20 flex items-center justify-center animate-in fade-in slide-in-from-bottom-5"
          title="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
