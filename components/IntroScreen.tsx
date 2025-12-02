import React, { useState, useEffect } from 'react';
import { Disc, ArrowRight } from 'lucide-react';

interface IntroScreenProps {
  onEnter: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Reveal button after text animation
    const timer = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    // Wait for exit animation
    setTimeout(onEnter, 500);
  };

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white
        transition-opacity duration-500 ease-in-out
        ${isExiting ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div className="flex flex-col items-center space-y-8 p-6 text-center">
        
        {/* Logo / Icon */}
        <div className="animate-[fadeIn_1s_ease-out]">
          <Disc size={48} className="text-white animate-spin-slow opacity-90" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-[0.2em] uppercase animate-[fadeIn_1.2s_ease-out_0.3s_both]">
            Bem-vindo ao<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
              Upperroom
            </span>
          </h1>
          
          <p className="text-zinc-400 font-light text-sm sm:text-lg tracking-wide max-w-md mx-auto animate-[fadeIn_1.2s_ease-out_0.8s_both]">
            A Sala está aberta. Entre, sente-se à mesa.
          </p>
        </div>

        {/* Enter Button */}
        <div className={`transition-all duration-1000 ease-out transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleEnter}
            className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          >
            <span className="uppercase text-xs font-bold tracking-widest text-zinc-200 group-hover:text-white transition-colors">
              Entrar no Upperroom
            </span>
            <ArrowRight size={14} className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </button>
        </div>
      </div>

      {/* Footer subtle text */}
      <div className={`absolute bottom-8 text-[10px] text-zinc-700 uppercase tracking-widest transition-opacity duration-1000 delay-1000 ${showButton ? 'opacity-100' : 'opacity-0'}`}>
        Experience
      </div>
    </div>
  );
};

export default IntroScreen;
