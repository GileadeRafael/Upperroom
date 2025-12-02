import React from 'react';
import { Mode } from '../types';
import { MODES } from '../constants';
import { BookOpen, Flame, GraduationCap } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  disabled: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, disabled }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'devocional': return <Flame size={18} className="sm:w-4 sm:h-4" />;
      case 'estudo': return <BookOpen size={18} className="sm:w-4 sm:h-4" />;
      case 'professor': return <GraduationCap size={18} className="sm:w-4 sm:h-4" />;
      default: return <Flame size={18} className="sm:w-4 sm:h-4" />;
    }
  };

  return (
    <div className="flex flex-row gap-2 sm:gap-3 w-full max-w-2xl mx-auto bg-transparent">
      {MODES.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id as Mode)}
            disabled={disabled}
            className={`
              relative group overflow-hidden
              flex-1 flex items-center justify-center py-3 sm:py-2.5 px-1 sm:px-3 rounded-xl 
              transition-all duration-300
              border
              ${isActive 
                ? 'bg-white/10 border-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.03)] backdrop-blur-md' 
                : 'bg-zinc-900/20 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-200 hover:border-white/10 backdrop-blur-sm'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Subtle inner sheen for glass effect */}
            {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />}
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
                <div className={`${isActive ? 'text-white' : 'text-current'}`}>
                    {getIcon(mode.id)}
                </div>
                <span className="uppercase text-[10px] leading-none sm:text-sm sm:leading-normal font-bold sm:font-medium tracking-wider">
                    {mode.label}
                </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;