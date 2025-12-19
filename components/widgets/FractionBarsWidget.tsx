import React, { useState, useRef } from 'react';
import { Icons } from '../icons';

interface FractionBarsWidgetProps {
  isTransparent?: boolean;
}

interface FractionBar {
  id: string;
  denominator: number;
  activeCount: number;
}

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
  
  const [customNum, setCustomNum] = useState(3);
  const [customDen, setCustomDen] = useState(7);
  const [showLabels, setShowLabels] = useState(true);
  const [rulerX, setRulerX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addBar = (den: number, num?: number) => {
      const newBar: FractionBar = {
          id: Date.now().toString() + Math.random(),
          denominator: den,
          activeCount: num !== undefined ? num : den 
      };
      setBars(prev => [...prev, newBar]);
  };

  const removeBar = (id: string) => {
      setBars(prev => prev.filter(b => b.id !== id));
  };

  const toggleSegment = (barId: string, segmentIndex: number) => {
      setBars(prev => prev.map(bar => {
          if (bar.id !== barId) return bar;
          const clickedNum = segmentIndex + 1;
          if (clickedNum === bar.activeCount) {
              return { ...bar, activeCount: clickedNum - 1 };
          } else {
              return { ...bar, activeCount: clickedNum };
          }
      }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setRulerX(pct);
  };

  const handleMouseLeave = () => setRulerX(null);

  const isMatch = (num: number, den: number) => {
      if (rulerX === null) return false;
      const barPct = (num / den) * 100;
      return Math.abs(barPct - rulerX) < 1.5; 
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 bg-white select-none">
        
        {/* SIDEBAR / TOPBAR */}
        <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-3 p-2 sm:p-4 bg-slate-50 border-b lg:border-r border-slate-200 overflow-x-auto lg:overflow-y-auto shrink-0">
            
            <div className="flex-1 lg:flex-none flex flex-row lg:flex-col gap-2 min-w-[140px]">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Hämta stav</h3>
                <div className="grid grid-cols-5 lg:grid-cols-2 gap-1.5 flex-1">
                    {PRESETS.map(den => {
                        const colors = getBarColor(den);
                        return (
                            <button
                                key={den}
                                onClick={() => addBar(den)}
                                className={`h-8 sm:h-10 rounded-md font-bold text-[10px] sm:text-xs shadow-sm hover:scale-105 transition-all ${colors.bg} ${colors.text} border-b-2 ${colors.border}`}
                            >
                                1/{den}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="hidden lg:block border-slate-200 border-b"></div>

            <div className="flex-1 lg:flex-none flex flex-row lg:flex-col gap-2 items-center lg:items-stretch min-w-[140px]">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Egen stav</h3>
                <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200 h-8 sm:h-10">
                    <input type="number" min="0" max={customDen} value={customNum} onChange={e => setCustomNum(Number(e.target.value))} className="w-6 text-center font-bold text-[10px] text-slate-700 outline-none" />
                    <span className="text-slate-300">/</span>
                    <input type="number" min="1" max="50" value={customDen} onChange={e => setCustomDen(Number(e.target.value))} className="w-6 text-center font-bold text-[10px] text-slate-700 outline-none" />
                </div>
                <button onClick={() => addBar(customDen, customNum)} className="px-3 py-1 lg:py-2 bg-slate-800 text-white rounded-lg font-bold text-[10px] hover:bg-slate-700 transition-all h-8 sm:h-auto">Skapa</button>
            </div>

            <button onClick={() => setShowLabels(!showLabels)} className={`px-3 py-1 lg:py-2 rounded-lg font-bold text-[10px] border transition-all flex items-center justify-center gap-1 whitespace-nowrap h-8 sm:h-auto ${showLabels ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                 <Icons.Book size={12} /> {showLabels ? 'Dölj mått' : 'Visa mått'}
            </button>
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 flex flex-col gap-3 p-2 sm:p-4 min-h-0">
            <div className="w-full h-8 sm:h-10 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center relative shrink-0">
                <span className="font-bold text-red-800 text-sm sm:text-base">1 (Helhet)</span>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-300"></div>
            </div>

            <div 
                ref={containerRef}
                className="flex-1 relative flex flex-col gap-2 overflow-y-auto pr-1 pb-4"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {rulerX !== null && (
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-50 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                        style={{ left: `${rulerX}%` }}
                    >
                        <div className="absolute -top-5 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Linjal</div>
                    </div>
                )}

                {bars.map((bar, index) => {
                    const colors = getBarColor(bar.denominator);
                    return (
                        <div key={bar.id} className="relative w-full h-10 sm:h-12 flex items-center group">
                            <div className="flex-1 h-full flex rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5 bg-slate-100">
                                {Array.from({ length: bar.denominator }).map((_, i) => {
                                    const isActive = i < bar.activeCount;
                                    const match = isMatch(i + 1, bar.denominator);
                                    return (
                                        <div 
                                            key={i}
                                            onClick={() => toggleSegment(bar.id, i)}
                                            className={`flex-1 h-full border-r last:border-r-0 border-white/40 flex items-center justify-center cursor-pointer transition-colors relative ${isActive ? colors.bg : 'bg-transparent hover:bg-slate-200'}`}
                                        >
                                            {showLabels && <span className={`text-[8px] sm:text-[10px] font-bold pointer-events-none ${isActive ? colors.text : 'text-slate-400'}`}>1/{bar.denominator}</span>}
                                            {match && <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-400 animate-pulse z-20"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => removeBar(bar.id)} className="ml-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash size={14}/></button>
                        </div>
                    );
                })}

                {bars.length === 0 && <div className="text-center py-10 text-slate-300 text-sm italic">Välj stavar ovanför.</div>}
            </div>
        </div>
    </div>
  );
};