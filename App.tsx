
import React, { useState, useRef, useEffect } from 'react';
import { Send, Disc, Copy, Check, Bookmark, BookMarked, Plus } from 'lucide-react';
import { Message, Mode, SavedMoment } from './types';
import { sendMessageToGemini } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import ModeSelector from './components/ModeSelector';
import IntroScreen from './components/IntroScreen';
import SecretRoom from './components/SecretRoom';

function App() {
  // Intro State
  const [hasEntered, setHasEntered] = useState(false);

  // State now holds separate histories for each mode
  const [histories, setHistories] = useState<Record<Mode, Message[]>>({
    devocional: [],
    estudo: [],
    professor: []
  });

  // Saved Moments (Sala Secreta)
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([]);
  const [isSecretRoomOpen, setIsSecretRoomOpen] = useState(false);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>('devocional');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Saved Moments from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('upperroom_moments');
    if (stored) {
      try {
        setSavedMoments(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved moments", e);
      }
    }
  }, []);

  // Save to LocalStorage whenever savedMoments changes
  useEffect(() => {
    localStorage.setItem('upperroom_moments', JSON.stringify(savedMoments));
  }, [savedMoments]);

  // Derive current messages from the history of the active mode
  const messages = histories[currentMode];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, currentMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const modeForRequest = currentMode; // Capture mode for this request
    const currentHistory = histories[modeForRequest];

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: Date.now(),
    };

    // Update history for specific mode
    setHistories(prev => ({
      ...prev,
      [modeForRequest]: [...prev[modeForRequest], userMessage]
    }));

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(currentHistory, userMessage.text, modeForRequest);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      setHistories(prev => ({
        ...prev,
        [modeForRequest]: [...prev[modeForRequest], botMessage]
      }));
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSaveMoment = (message: Message, index: number) => {
    // Try to find the user prompt that generated this response (usually index - 1)
    let title = "Pensamento Upperroom";
    if (index > 0 && messages[index - 1].role === 'user') {
      title = messages[index - 1].text;
    }

    const newMoment: SavedMoment = {
      id: Date.now().toString(),
      title: title,
      content: message.text,
      mode: currentMode,
      timestamp: Date.now()
    };

    setSavedMoments(prev => [newMoment, ...prev]);
    setSavedId(message.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleDeleteMoment = (id: string) => {
    setSavedMoments(prev => prev.filter(m => m.id !== id));
  };

  const handleNewChat = () => {
    setHistories(prev => ({
      ...prev,
      [currentMode]: []
    }));
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!hasEntered) {
    return <IntroScreen onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 font-sans selection:bg-zinc-800 selection:text-white overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      
      {/* Secret Room Panel */}
      <SecretRoom 
        isOpen={isSecretRoomOpen} 
        onClose={() => setIsSecretRoomOpen(false)} 
        moments={savedMoments}
        onDelete={handleDeleteMoment}
      />

      {/* Header - Fixed Height */}
      <header className="shrink-0 h-14 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-2">
          <Disc className="text-white animate-spin-slow" size={20} />
          <h1 className="text-sm font-bold tracking-[0.2em] text-white uppercase">Upperroom</h1>
        </div>
        
        {/* Desktop Secret Room Trigger */}
        <button 
          onClick={() => setIsSecretRoomOpen(true)}
          className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <Bookmark size={16} />
          <span>SALA SECRETA</span>
        </button>
      </header>

      {/* Mode Bar - Transparent Wrapper */}
      <div className="shrink-0 py-3 px-4 z-10">
         <ModeSelector 
            currentMode={currentMode} 
            onModeChange={(m) => {
              setCurrentMode(m);
              setTimeout(() => textareaRef.current?.focus(), 50);
            }} 
            disabled={isLoading}
          />
      </div>

      {/* Chat View - Scrollable Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:px-6 relative flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Messages */}
          <div className="space-y-6 pb-4 flex-1">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`
                    relative group
                    max-w-[95%] sm:max-w-[85%] rounded-2xl p-4 sm:p-6 text-sm sm:text-base shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-br-none' 
                      : 'bg-transparent text-zinc-300 pl-4 border-l-2 border-zinc-800 rounded-none pr-10'
                    }
                  `}
                >
                  {/* Action Buttons for Model Messages */}
                  {msg.role === 'model' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                      {/* Save Button */}
                      <button
                        onClick={() => handleSaveMoment(msg, index)}
                        className={`p-2 rounded-lg transition-colors ${savedId === msg.id ? 'text-white' : 'text-zinc-600 hover:text-white hover:bg-zinc-800/50'}`}
                        title="Guardar na Sala"
                      >
                         {savedId === msg.id ? <BookMarked size={16} /> : <Bookmark size={16} />}
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-zinc-800/50 transition-colors"
                        title="Copiar"
                      >
                        {copiedId === msg.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  )}

                  {msg.role === 'model' ? (
                    <MarkdownRenderer content={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                 <div className="pl-4 border-l-2 border-zinc-800 py-2">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </main>

      {/* Floating New Chat Button - Only shows if there are messages */}
      {messages.length > 0 && !isLoading && (
         <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
            <button 
                onClick={handleNewChat}
                className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-full shadow-lg shadow-black/50 hover:bg-zinc-200 transition-all duration-300 font-bold text-xs uppercase tracking-wider"
            >
                <Plus size={16} />
                Novo Chat
            </button>
         </div>
      )}

      {/* Input Area - Fixed at Bottom */}
      <footer className="shrink-0 bg-zinc-950 border-t border-zinc-900 p-4 pb-6 z-20">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          
          {/* Mobile Secret Room Button (Bottom Bar) */}
          <button
            onClick={() => setIsSecretRoomOpen(true)}
            className="sm:hidden p-3 bg-zinc-900 text-zinc-400 rounded-xl border border-zinc-800 hover:text-white hover:border-zinc-700 transition-colors"
            title="Sala Secreta"
          >
            <Bookmark size={20} />
          </button>

          <div className="flex-1 relative flex items-end gap-3 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 focus-within:border-zinc-600 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Escreva para o modo ${currentMode}...`}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-zinc-500 resize-none outline-none max-h-32 py-3 px-2 text-base font-light custom-scrollbar"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
