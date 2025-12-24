
import React, { useState } from 'react';
import { generateHolidayWish } from '../services/gemini';
import { TreeState } from './Tree';
import { Sparkles, Send, Loader2, X, Hand, HandMetal } from 'lucide-react';

interface Props {
  onStartThinking: () => void;
  onFinishThinking: () => void;
  gestureActive: boolean;
  treeState: TreeState;
}

export const UIOverlay: React.FC<Props> = ({ onStartThinking, onFinishThinking, gestureActive, treeState }) => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [wish, setWish] = useState<{ message: string; signature: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    onStartThinking();
    const result = await generateHolidayWish(keyword);
    setWish(result);
    setLoading(false);
    onFinishThinking();
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="group cursor-pointer">
          <h1 className="text-4xl tracking-[0.2em] font-serif text-[#D4AF37] uppercase">Arix</h1>
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/50 mt-1">Signature Experience</p>
        </div>
        
        {gestureActive && (
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 border border-[#D4AF37]/30 rounded-full">
            <span className="text-[9px] uppercase tracking-widest text-[#D4AF37]">Gesture Control Active</span>
            {treeState === TreeState.SCATTERED ? (
              <div className="flex items-center gap-2 text-white">
                <Hand size={16} className="text-[#D4AF37]" />
                <span className="text-[10px]">Unleashed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <HandMetal size={16} className="text-[#D4AF37]" />
                <span className="text-[10px]">Formed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {wish && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          <div className="max-w-xl w-full bg-black/80 backdrop-blur-3xl border border-[#D4AF37]/40 p-12 rounded-sm pointer-events-auto relative shadow-[0_0_80px_rgba(212,175,55,0.2)]">
            <button onClick={() => setWish(null)} className="absolute top-4 right-4 text-[#D4AF37]/50 hover:text-[#D4AF37]">
              <X size={20} />
            </button>
            <Sparkles className="text-[#D4AF37] mb-6 mx-auto animate-pulse" size={32} />
            <p className="text-2xl font-serif text-white text-center leading-relaxed mb-8 italic">"{wish.message}"</p>
            <p className="text-sm tracking-[0.5em] text-[#D4AF37] uppercase text-center">{wish.signature}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center pointer-events-auto">
        <div className="w-full max-w-md bg-black/60 backdrop-blur-md border border-[#D4AF37]/20 p-6 rounded-sm">
          <h2 className="text-[#D4AF37] font-serif text-2xl mb-4 text-center tracking-[0.2em] uppercase">Merry Christmas</h2>
          <p className="text-[10px] text-white/60 text-center mb-6 tracking-widest uppercase">Cast a Golden Wish</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a holiday keyword..."
              className="flex-1 bg-transparent border-b border-[#D4AF37]/30 text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] py-2 text-sm"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="bg-[#D4AF37] text-black px-6 py-2 hover:bg-[#FFD700] transition-colors">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-[9px] text-white/40 text-center uppercase tracking-[0.1em]">
              Tip: Open hand to Unleash • Close fist to Form
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
