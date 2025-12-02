
import React, { useState } from 'react';
import { X, Trash2, Calendar, Bookmark, Quote, ArrowLeft } from 'lucide-react';
import { SavedMoment } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface SecretRoomProps {
  isOpen: boolean;
  onClose: () => void;
  moments: SavedMoment[];
  onDelete: (id: string) => void;
}

const SecretRoom: React.FC<SecretRoomProps> = ({ isOpen, onClose, moments, onDelete }) => {
  const [viewingMoment, setViewingMoment] = useState<SavedMoment | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setViewingMoment(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-[fadeIn_0.3s_ease-out]"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={`
        fixed inset-y-0 right-0 z-50
        w-full sm:w-[480px]
        bg-zinc-950 border-l border-zinc-900 shadow-2xl
        flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {viewingMoment ? (
              <button 
                onClick={() => setViewingMoment(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Bookmark className="text-white" size={20} />
            )}
            
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-widest leading-none">
                Sala Secreta
              </h2>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950">
          
          {/* VIEW MODE: FULL CONTENT */}
          {viewingMoment ? (
            <div className="p-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                  {viewingMoment.mode}
                </span>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <Calendar size={12} />
                  {new Date(viewingMoment.timestamp).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white mb-8 leading-snug">
                "{viewingMoment.title}"
              </h1>

              <div className="prose prose-invert prose-zinc max-w-none">
                <MarkdownRenderer content={viewingMoment.content} />
              </div>

              <div className="mt-12 pt-6 border-t border-zinc-900 flex justify-end">
                <button 
                    onClick={() => {
                      onDelete(viewingMoment.id);
                      setViewingMoment(null);
                    }}
                    className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors text-xs uppercase font-bold tracking-wider px-4 py-2 rounded-lg hover:bg-zinc-900"
                >
                  <Trash2 size={14} />
                  Apagar
                </button>
              </div>
            </div>
          ) : (
            /* LIST MODE */
            <div className="p-6 space-y-4">
              {moments.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-600 space-y-4 opacity-50">
                  <Quote size={48} className="stroke-1" />
                  <p className="text-sm font-light tracking-wide text-center max-w-[200px]">
                    A sala está vazia.<br/>Guarde palavras que queimam aqui.
                  </p>
                </div>
              ) : (
                moments.map((moment) => (
                  <div 
                    key={moment.id}
                    onClick={() => setViewingMoment(moment)}
                    className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 hover:border-zinc-600 hover:bg-zinc-900/60 cursor-pointer transition-all duration-300"
                  >
                    {/* Mode Tag & Date */}
                    <div className="flex items-center justify-between mb-3 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                        {moment.mode}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                        <Calendar size={10} />
                        {new Date(moment.timestamp).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                    </div>

                    {/* Title (User Prompt) */}
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3 leading-snug line-clamp-2 group-hover:text-white transition-colors pointer-events-none">
                      "{moment.title}"
                    </h3>

                    {/* Content Snippet (Preview) */}
                    <div className="relative max-h-24 overflow-hidden text-zinc-400 text-xs leading-relaxed font-light mb-4 mask-image-b pointer-events-none">
                       {/* Simplified plain text preview for the card to avoid markdown complexity in small preview */}
                       <p className="opacity-80">{moment.content.slice(0, 150).replace(/[#*`]/g, '')}...</p>
                       <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-900/0 to-transparent" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end pt-3 border-t border-zinc-800/50" onClick={(e) => e.stopPropagation()}>
                       <button 
                          onClick={(e) => {
                             e.stopPropagation(); // Prevent opening modal
                             onDelete(moment.id);
                          }}
                          className="flex items-center gap-1.5 text-zinc-600 hover:text-red-400 transition-colors text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded hover:bg-zinc-800"
                       >
                         <Trash2 size={12} />
                         Apagar
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SecretRoom;
