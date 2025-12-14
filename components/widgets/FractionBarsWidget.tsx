import React, { useState, useRef } from 'react';
import { Icons } from '../icons';

interface FractionBarsWidgetProps {
  isTransparent?: boolean;
}

interface FractionBar {
  id: string;
  denominator: number;
  activeCount: number; // Numerator
}

// Color Palette based on denominator families
// 1=Red, 1/2=Pink, 1/3=Orange, 1/4=Yellow, 1/5=Green, 1/6=Teal, 1/8=Blue, 1/10=Purple, 1/12=Gray
const getBarColor = (den: number) => {
    switch(den) {
        case 1: return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white' };
        case 2: return { bg: 'bg-pink-400', border: 'border-pink-500', text: 'text-white' };
        case 3: return { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-white' };
        case 4: return { bg: 'bg-yellow-300', border: 'border-yellow-400', text: 'text-yellow-900' };
        case 5: return { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' };
        case 6: return { bg: 'bg-teal-400', border: 'border-teal-500', text: 'text-white' };
        case 8: return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' };
        case 10: return { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white' };
        case 12: return { bg: 'bg-slate-500', border: 'border-slate-600', text: 'text-white' };
        default: return { bg: 'bg-slate-400', border: 'border-slate-500', text: 'text-white' };
    }
};

const PRESETS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

export const FractionBarsWidget: React.FC<FractionBarsWidgetProps> = ({ isTransparent }) => {
  const [bars, setBars] = useState<FractionBar[]>([
      { id: 'init-1', denominator: 2, activeCount: 1 },
      { id: 'init-2', denominator: 4, activeCount: 2 }
  ]);
  
  // Custom Input State
  const [customNum, setCustomNum] = useState(3);
  const [customDen, setCustomDen] = useState(7);
  
  // Settings
  const [showLabels, setShowLabels] = useState(true);
  
  // Magic Ruler
  const [rulerX, setRulerX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- ACTIONS ---

  const addBar = (den: number, num?: number) => {
      const newBar: FractionBar = {
          id: Date.now().toString() + Math.random(),
          denominator: den,
          activeCount: num !== undefined ? num : den // Default to full bar if not specified
      };
      setBars(prev => [...prev, newBar]);
  };

  const removeBar = (id: string) => {
      setBars(prev => prev.filter(b => b.id !== id));
  };

  const toggleSegment = (barId: string, segmentIndex: number) => {
      setBars(prev => prev.map(bar => {
          if (bar.id !== barId) return bar;
          
          // Logic: Clicking a segment sets the active count to that index + 1
          // If clicking the current active end, toggle it off (go back one step)
          const clickedNum = segmentIndex + 1;
          
          if (clickedNum === bar.activeCount) {
              return { ...bar, activeCount: clickedNum - 1 };
          } else {
              return { ...bar, activeCount: clickedNum };
          }
      }));
  };

  const moveBar = (index: number, direction: 'UP' | 'DOWN') => {
      if (direction === 'UP' && index === 0) return;
      if (direction === 'DOWN' && index === bars.length - 1) return;
      
      const newBars = [...bars];
      const temp = newBars[index];
      const targetIndex = direction === 'UP' ? index - 1 : index + 1;
      
      newBars[index] = newBars[targetIndex];
      newBars[targetIndex] = temp;
      
      setBars(newBars);
  };

  // --- RULER LOGIC ---

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Constrain to container width (ignoring padding for calculation simplicity)
      // The bars container has padding, so we adjust.
      // Let's assume the bars start at 0% and end at 100% of the internal container width.
      
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setRulerX(pct);
  };

  const handleMouseLeave = () => {
      setRulerX(null);
  };

  // Check if a fraction matches the ruler position (within tolerance)
  const isMatch = (num: number, den: number) => {
      if (rulerX === null) return false;
      const barPct = (num / den) * 100;
      return Math.abs(barPct - rulerX) < 1.5; // 1.5% tolerance
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 bg-white select-none">
        
        {/* SIDEBAR (Library) */}
        <div className="w-full md:w-48 flex flex-col gap-4 p-2 md:p-4 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0">
            
            {/* Presets */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hämta stav</h3>
                <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
                    {PRESETS.map(den => {
                        const colors = getBarColor(den);
                        return (
                            <button
                                key={den}
                                onClick={() => addBar(den)}
                                className={`h-10 rounded-md font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all ${colors.bg} ${colors.text} border-b-2 ${colors.border}`}
                            >
                                1/{den}
                            </button>
                        );
                    })}
                </div>
            </div>

            <hr className="border-slate-200" />

            {/* Custom Builder */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Egen stav</h3>
                <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200">
                    <input 
                        type="number" min="0" max={customDen} 
                        value={customNum} onChange={e => setCustomNum(Number(e.target.value))}
                        className="w-8 text-center font-bold text-slate-700 outline-none"
                    />
                    <span className="text-slate-300">/</span>
                    <input 
                        type="number" min="1" max="50" 
                        value={customDen} onChange={e => setCustomDen(Number(e.target.value))}
                        className="w-8 text-center font-bold text-slate-700 outline-none"
                    />
                </div>
                <button 
                    onClick={() => addBar(customDen, customNum)}
                    className="w-full py-2 bg-slate-800 text-white rounded-lg font-bold text-xs shadow-md hover:bg-slate-700 active:scale-95 transition-all"
                >
                    Skapa
                </button>
            </div>

            <div className="mt-auto">
                 <button 
                    onClick={() => setShowLabels(!showLabels)}
                    className={`w-full py-2 rounded-lg font-bold text-xs border transition-all flex items-center justify-center gap-2 ${showLabels ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200'}`}
                 >
                     <Icons.Book size={14} /> {showLabels ? 'Dölj etiketter' : 'Visa etiketter'}
                 </button>
            </div>
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 flex flex-col gap-4 p-2 md:p-4 min-h-[300px]">
            
            {/* The "Whole" Reference */}
            <div className="w-full h-12 bg-red-100 border-2 border-red-200 rounded-lg flex items-center justify-center relative shrink-0">
                <span className="font-bold text-red-800 text-lg">1 (Helhet)</span>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-300"></div>
            </div>

            {/* Interactive Area */}
            <div 
                ref={containerRef}
                className="flex-1 relative flex flex-col gap-3 overflow-y-auto pr-2 pb-8"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Magic Ruler Line */}
                {rulerX !== null && (
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-50 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                        style={{ left: `${rulerX}%` }}
                    >
                        <div className="absolute -top-6 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            Linjal
                        </div>
                    </div>
                )}

                {/* Bars List */}
                {bars.map((bar, index) => {
                    const colors = getBarColor(bar.denominator);
                    
                    return (
                        <div key={bar.id} className="relative w-full h-12 flex items-center group">
                            
                            {/* Controls (Left Hover) */}
                            <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <button onClick={() => moveBar(index, 'UP')} className="p-0.5 bg-slate-100 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600"><Icons.Move size={10} className="-rotate-90"/></button>
                                <button onClick={() => moveBar(index, 'DOWN')} className="p-0.5 bg-slate-100 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600"><Icons.Move size={10} className="rotate-90"/></button>
                            </div>

                            {/* Controls (Right Hover) */}
                            <div className="absolute -right-8 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                <button onClick={() => removeBar(bar.id)} className="p-1.5 bg-red-50 rounded-full hover:bg-red-500 text-red-400 hover:text-white transition-colors"><Icons.Trash size={14}/></button>
                            </div>

                            {/* The Bar Itself */}
                            <div className="flex-1 h-full flex rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5 bg-slate-100">
                                {Array.from({ length: bar.denominator }).map((_, i) => {
                                    const isActive = i < bar.activeCount;
                                    const match = isMatch(i + 1, bar.denominator);

                                    return (
                                        <div 
                                            key={i}
                                            onClick={() => toggleSegment(bar.id, i)}
                                            className={`
                                                flex-1 h-full border-r last:border-r-0 border-white/40 flex items-center justify-center cursor-pointer transition-colors relative
                                                ${isActive ? colors.bg : 'bg-transparent hover:bg-slate-200'}
                                            `}
                                        >
                                            {/* Label */}
                                            {showLabels && (
                                                <span className={`text-[10px] sm:text-xs font-bold pointer-events-none ${isActive ? colors.text : 'text-slate-400'}`}>
                                                    1/{bar.denominator}
                                                </span>
                                            )}

                                            {/* Ruler Highlight Effect */}
                                            {match && (
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-400 animate-pulse z-20"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {bars.length === 0 && (
                     <div className="text-center py-10 text-slate-400 italic">
                         Klicka på en stav till vänster för att börja.
                     </div>
                )}
            </div>
        </div>
    </div>
  );
};