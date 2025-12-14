import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';

interface HundredChartWidgetProps {
  isTransparent?: boolean;
}

type Mode = 'PAINT' | 'HIDE' | 'MASK';
type MaskShape = 'NONE' | 'SQUARE' | 'CROSS' | 'T_SHAPE' | 'L_SHAPE';

interface CellData {
    color: string | null;
    hidden: boolean;
}

const COLORS = [
    { bg: 'bg-red-200', border: 'border-red-300', hex: '#fecaca' },
    { bg: 'bg-orange-200', border: 'border-orange-300', hex: '#fed7aa' },
    { bg: 'bg-yellow-200', border: 'border-yellow-300', hex: '#fef08a' },
    { bg: 'bg-green-200', border: 'border-green-300', hex: '#bbf7d0' },
    { bg: 'bg-blue-200', border: 'border-blue-300', hex: '#bfdbfe' },
    { bg: 'bg-purple-200', border: 'border-purple-300', hex: '#e9d5ff' },
];

export const HundredChartWidget: React.FC<HundredChartWidgetProps> = ({ isTransparent }) => {
  const [mode, setMode] = useState<Mode>('PAINT');
  
  // Data State
  const [cells, setCells] = useState<CellData[]>(new Array(100).fill({ color: null, hidden: false }));
  
  // Paint State
  const [activeColor, setActiveColor] = useState<number>(4); // Default Blue

  // Mask State
  const [activeMask, setActiveMask] = useState<MaskShape>('SQUARE');
  const [maskAnchor, setMaskAnchor] = useState<number>(12); // Index of top-left or center of mask

  // --- ACTIONS ---

  const handleCellClick = (index: number) => {
      if (mode === 'PAINT') {
          setCells(prev => {
              const newCells = [...prev];
              const currentColor = COLORS[activeColor].bg;
              // Toggle color if same, else set new
              if (newCells[index].color === currentColor) {
                  newCells[index] = { ...newCells[index], color: null };
              } else {
                  newCells[index] = { ...newCells[index], color: currentColor };
              }
              return newCells;
          });
      } else if (mode === 'HIDE') {
          setCells(prev => {
              const newCells = [...prev];
              newCells[index] = { ...newCells[index], hidden: !newCells[index].hidden };
              return newCells;
          });
      } else if (mode === 'MASK') {
          setMaskAnchor(index);
      }
  };

  // --- PAINT UTILS ---
  const clearColors = () => setCells(prev => prev.map(c => ({ ...c, color: null })));
  
  const paintPattern = (type: 'ODD' | 'EVEN' | 'FIVE' | 'TEN') => {
      setCells(prev => prev.map((c, i) => {
          const num = i + 1;
          let match = false;
          if (type === 'ODD') match = num % 2 !== 0;
          if (type === 'EVEN') match = num % 2 === 0;
          if (type === 'FIVE') match = num % 5 === 0;
          if (type === 'TEN') match = num % 10 === 0;
          
          return { ...c, color: match ? COLORS[activeColor].bg : null };
      }));
  };

  // --- HIDE UTILS ---
  const hideAll = () => setCells(prev => prev.map(c => ({ ...c, hidden: true })));
  const showAll = () => setCells(prev => prev.map(c => ({ ...c, hidden: false })));
  const randomReveal = () => {
      setCells(prev => {
          const next = [...prev];
          // Reveal 5 random cells
          for(let i=0; i<5; i++) {
              const r = Math.floor(Math.random() * 100);
              next[r] = { ...next[r], hidden: false };
          }
          return next;
      });
  };

  // --- MASK CALCULATION ---
  const getMaskIndices = (anchor: number, shape: MaskShape): number[] => {
      const row = Math.floor(anchor / 10);
      const col = anchor % 10;
      const indices: number[] = [];

      const add = (rOffset: number, cOffset: number) => {
          const r = row + rOffset;
          const c = col + cOffset;
          if (r >= 0 && r < 10 && c >= 0 && c < 10) {
              indices.push(r * 10 + c);
          }
      };

      if (shape === 'SQUARE') {
          // 2x2 Square
          add(0,0); add(0,1);
          add(1,0); add(1,1);
      } else if (shape === 'CROSS') {
          // Plus sign
          add(0,1); // Top
          add(1,0); add(1,1); add(1,2); // Middle
          add(2,1); // Bottom
      } else if (shape === 'T_SHAPE') {
          add(0,0); add(0,1); add(0,2); // Top bar
          add(1,1); // Stem
          add(2,1);
      } else if (shape === 'L_SHAPE') {
          add(0,0); 
          add(1,0); 
          add(2,0); add(2,1); // Bottom
      }

      return indices;
  };

  const maskedIndices = useMemo(() => {
      if (mode !== 'MASK') return [];
      return getMaskIndices(maskAnchor, activeMask);
  }, [mode, activeMask, maskAnchor]);

  const maskSum = maskedIndices.reduce((sum, idx) => sum + (idx + 1), 0);

  return (
    <div className="w-full max-w-[500px] flex flex-col gap-3">
        
        {/* TOP TAB BAR */}
        <div className="flex bg-slate-100 p-1 rounded-xl mx-auto border border-slate-200 mb-1">
            <button onClick={() => setMode('PAINT')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'PAINT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Icons.Bead size={14} /> <span className="hidden sm:inline">Måla</span>
            </button>
            <button onClick={() => setMode('HIDE')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'HIDE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Icons.Minimize size={14} /> <span className="hidden sm:inline">Gömma</span>
            </button>
            <button onClick={() => setMode('MASK')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'MASK' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Icons.Grid size={14} /> <span className="hidden sm:inline">Mask</span>
            </button>
        </div>

        {/* CONTROLS BAR (Context sensitive) */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 min-h-[52px] flex flex-wrap items-center justify-between gap-2">
            
            {/* PAINT CONTROLS */}
            {mode === 'PAINT' && (
                <>
                    <div className="flex gap-1.5">
                        {COLORS.map((c, i) => (
                            <button 
                                key={i}
                                onClick={() => setActiveColor(i)}
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-transform ${activeColor === i ? 'scale-110 border-slate-600' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c.hex }}
                            />
                        ))}
                        <div className="w-[1px] h-6 bg-slate-300 mx-1"></div>
                        <button onClick={clearColors} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded" title="Rensa färger"><Icons.Trash size={16}/></button>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => paintPattern('ODD')} className="px-2 py-1 text-[10px] font-bold bg-white border rounded hover:bg-slate-100 text-slate-600">Udda</button>
                        <button onClick={() => paintPattern('EVEN')} className="px-2 py-1 text-[10px] font-bold bg-white border rounded hover:bg-slate-100 text-slate-600">Jämna</button>
                        <button onClick={() => paintPattern('FIVE')} className="px-2 py-1 text-[10px] font-bold bg-white border rounded hover:bg-slate-100 text-slate-600">5-hopp</button>
                    </div>
                </>
            )}

            {/* HIDE CONTROLS */}
            {mode === 'HIDE' && (
                <div className="flex w-full justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">Detektiven</span>
                    <div className="flex gap-2 w-full justify-center sm:w-auto">
                        <button onClick={hideAll} className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-bold shadow-sm hover:bg-slate-700">Göm Alla</button>
                        <button onClick={randomReveal} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded text-xs font-bold shadow-sm hover:bg-slate-50">Visa 5</button>
                        <button onClick={showAll} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded text-xs font-bold shadow-sm hover:bg-slate-50">Visa Alla</button>
                    </div>
                </div>
            )}

            {/* MASK CONTROLS */}
            {mode === 'MASK' && (
                <div className="flex w-full flex-wrap justify-between items-center px-1 gap-2">
                    <div className="flex gap-1">
                        <button onClick={() => setActiveMask('SQUARE')} className={`px-2 py-1 text-[10px] font-bold border rounded ${activeMask==='SQUARE' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white'}`}>Kvadrat</button>
                        <button onClick={() => setActiveMask('CROSS')} className={`px-2 py-1 text-[10px] font-bold border rounded ${activeMask==='CROSS' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white'}`}>Kors</button>
                        <button onClick={() => setActiveMask('L_SHAPE')} className={`px-2 py-1 text-[10px] font-bold border rounded ${activeMask==='L_SHAPE' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white'}`}>L-Form</button>
                        <button onClick={() => setActiveMask('T_SHAPE')} className={`px-2 py-1 text-[10px] font-bold border rounded ${activeMask==='T_SHAPE' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white'}`}>T-Form</button>
                    </div>
                    <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800 font-bold text-xs flex items-center gap-2">
                        <span>Summa:</span>
                        <span className="text-lg">{maskSum}</span>
                    </div>
                </div>
            )}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1 bg-slate-200 p-1 sm:p-2 rounded-xl shadow-inner select-none">
            {cells.map((cell, i) => {
                const num = i + 1;
                const isMasked = mode === 'MASK' && maskedIndices.includes(i);
                
                // Base styles
                let cellClasses = "aspect-square flex items-center justify-center rounded-sm sm:rounded text-xs sm:text-sm font-bold border transition-all duration-150 cursor-pointer";
                
                // Color logic
                if (cell.color && !cell.hidden) {
                    cellClasses += ` ${cell.color} text-slate-800 border-transparent`;
                } else if (cell.hidden) {
                    cellClasses += ` bg-slate-800 border-slate-900 text-transparent hover:bg-slate-700`;
                } else {
                    cellClasses += ` bg-white text-slate-700 border-slate-300 hover:bg-slate-50`;
                }

                // Mask logic (Overlays)
                if (isMasked) {
                    cellClasses += " ring-2 sm:ring-4 ring-blue-500 z-10 scale-105 shadow-lg";
                } else if (mode === 'MASK') {
                    cellClasses += " opacity-50"; // Dim others
                }

                return (
                    <div 
                        key={i}
                        onClick={() => handleCellClick(i)}
                        className={cellClasses}
                    >
                        <span className={cell.hidden ? 'opacity-0' : 'opacity-100'}>{num}</span>
                    </div>
                );
            })}
        </div>
        
        {/* Footer Info */}
        <div className="text-center text-[10px] text-slate-400">
            {mode === 'PAINT' && "Klicka för att måla. Klicka igen för att sudda."}
            {mode === 'HIDE' && "Klicka på en ruta för att gömma eller visa talet."}
            {mode === 'MASK' && "Klicka på rutan där du vill placera masken."}
        </div>
    </div>
  );
};