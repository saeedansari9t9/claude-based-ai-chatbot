import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedStreamingText, setDisplayedStreamingText] = useState('');
  const displayedTextRef = useRef('');
  const fullStreamingTextRef = useRef('');
  const abortControllerRef = useRef(null);

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };


  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      const full = fullStreamingTextRef.current;
      const current = displayedTextRef.current;
      
      if (current.length < full.length) {
        const diff = full.length - current.length;

        const charsToAdd = diff > 40 ? 4 : diff > 15 ? 2 : 1;
        const nextText = full.slice(0, current.length + charsToAdd);
        
        displayedTextRef.current = nextText;
        setDisplayedStreamingText(nextText);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSendMessage = async (messageText, isRegenerate = false) => {

    if (!isRegenerate) {
      const newUserMessage = { role: 'user', content: messageText };
      setMessages((prev) => [...prev, newUserMessage]);
    } else {

      setMessages((prev) => prev.filter((_, idx) => idx !== prev.length - 1 || prev[prev.length - 1].role !== 'assistant'));
    }
    
    setIsLoading(true);
    setDisplayedStreamingText('');
    displayedTextRef.current = '';
    fullStreamingTextRef.current = '';
    
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ message: messageText }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }


      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullAssistantResponse = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '');
              
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  fullAssistantResponse += `\n[Error: ${parsed.error}]`;
                } else if (parsed.text) {
                  fullAssistantResponse += parsed.text;
                }
                
                fullStreamingTextRef.current = fullAssistantResponse;
              } catch (err) {
                console.error("Error parsing stream chunk:", err, "Data string:", dataStr);
              }
            }
          }
        }
      }


      while (displayedTextRef.current.length < fullAssistantResponse.length && !abortControllerRef.current.signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      if (!abortControllerRef.current.signal.aborted) {

        setMessages((prev) => [...prev, { role: 'assistant', content: fullAssistantResponse }]);
      } else {

        if (displayedTextRef.current) {
          const finalContent = displayedTextRef.current;
          setMessages((prev) => [...prev, { role: 'assistant', content: finalContent }]);
        }
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream stopped by user.');
        if (displayedTextRef.current) {
          const finalContent = displayedTextRef.current;
          setMessages((prev) => [...prev, { role: 'assistant', content: finalContent }]);
        }
      } else {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev, 
          { role: 'assistant', content: "I'm sorry, I encountered an error connecting to the server. Please try again." }
        ]);
      }
    } finally {
      setIsLoading(false);
      setDisplayedStreamingText('');
      displayedTextRef.current = '';
      fullStreamingTextRef.current = '';
    }
  };

  const handleRegenerate = () => {
    if (isLoading) return;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        handleSendMessage(messages[i].content, true);
        return;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent font-sans">

      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center z-10 sticky top-0">
        <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
          <div className="w-9 h-9 bg-black rounded flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 9h.01M15 9h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-[19px] font-semibold text-black tracking-tight">Balosys Compliance Advisor</h1>
            <p className="text-[13px] text-gray-500 font-normal">Enterprise Secure Chat</p>
          </div>
        </div>
      </header>


      <ChatWindow 
        messages={messages} 
        isLoading={isLoading} 
        streamingText={displayedStreamingText} 
        onRegenerate={handleRegenerate}
      />


      <ChatInput 
        onSendMessage={handleSendMessage} 
        onStop={stopGenerating}
        isLoading={isLoading} 
      />
    </div>
  );
}

export default App;
