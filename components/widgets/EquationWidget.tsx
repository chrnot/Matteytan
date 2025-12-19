
import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';

type Side = 'VL' | 'HL';
type Representation = 'BLOCKS' | 'MATCHSTICKS';

interface EquationState {
  vlX: number;
  vlConst: number;
  hlX: number;
  hlConst: number;
}

export const EquationWidget: React.FC = () => {
  // --- STATE ---
  const [mode, setMode] = useState<Representation>('MATCHSTICKS');
  const [hiddenX, setHiddenX] = useState(5);
  const [state, setState] = useState<EquationState>({ vlX: 1, vlConst: 2, hlX: 0, hlConst: 7 });
  const [feedbackSide, setFeedbackSide] = useState<'VL' | 'HL' | null>(null);
  
  // Calculate Balance
  const vlMass = state.vlX * hiddenX + state.vlConst;
  const hlMass = state.hlX * hiddenX + state.hlConst;
  const isBalanced = vlMass === hlMass;

  // --- ACTIONS ---
  const reset = (level: number = 1) => {
    const newX = Math.floor(Math.random() * 5) + 3; // 3-7
    setHiddenX(newX);
    setFeedbackSide(null);
    
    if (level === 1) { // x + a = b
        const a = Math.floor(Math.random() * 5) + 1;
        setState({ vlX: 1, vlConst: a, hlX: 0, hlConst: newX + a });
    } else if (level === 2) { // ax = b
        const a = 2;
        setState({ vlX: a, vlConst: 0, hlX: 0, hlConst: newX * a });
    } else { // ax + b = cx + d
        const a = Math.floor(Math.random() * 3) + 1;
        setState({ vlX: 2, vlConst: a, hlX: 1, hlConst: newX + a });
    }
  };

  const handleObjectClick = (side: Side, type: 'X' | 'CONST') => {
      // Symmetrical subtraction logic
      const hasOnBoth = type === 'X' 
        ? (state.vlX > 0 && state.hlX > 0)
        : (state.vlConst > 0 && state.hlConst > 0);

      if (hasOnBoth) {
          setState(s => ({
              ...s,
              vlX: type === 'X' ? s.vlX - 1 : s.vlX,
              hlX: type === 'X' ? s.hlX - 1 : s.hlX,
              vlConst: type === 'CONST' ? s.vlConst - 1 : s.vlConst,
              hlConst: type === 'CONST' ? s.hlConst - 1 : s.hlConst
          }));
          setFeedbackSide(side === 'VL' ? 'HL' : 'VL');
          setTimeout(() => setFeedbackSide(null), 300);
      } else {
          // Remove from one side only
          setState(s => ({
              ...s,
              vlX: (side === 'VL' && type === 'X') ? Math.max(0, s.vlX - 1) : s.vlX,
              hlX: (side === 'HL' && type === 'X') ? Math.max(0, s.hlX - 1) : s.hlX,
              vlConst: (side === 'VL' && type === 'CONST') ? s.vlConst - 1 : s.vlConst,
              hlConst: (side === 'HL' && type === 'CONST') ? s.hlConst - 1 : s.hlConst
          }));
      }
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 select-none bg-white p-2 overflow-hidden">
      
      {/* 1. TOP CONTROLS & MODE SELECTOR */}
      <div className="shrink-0 flex flex-col gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
                <div className="flex bg-slate-200 p-1 rounded-lg shadow-inner">
                    <button 
                        onClick={() => setMode('BLOCKS')} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${mode === 'BLOCKS' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}
                    >
                        <Icons.Cube size={14} /> Standard
                    </button>
                    <button 
                        onClick={() => setMode('MATCHSTICKS')} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${mode === 'MATCHSTICKS' ? 'bg-white text-blue-600 shadow' : 'text-slate-50'}`}
                        style={mode !== 'MATCHSTICKS' ? { color: '#64748b' } : {}}
                    >
                        <Icons.Scale size={14} /> Tändstickor
                    </button>
                </div>

                <div className="flex gap-1">
                    {[1, 2, 3].map(lvl => (
                        <button key={lvl} onClick={() => reset(lvl)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
                            Nivå {lvl}
                        </button>
                    ))}
                </div>
          </div>
      </div>

      {/* 2. THE BALANCE SCALE AREA */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 min-h-[300px]">
          
          {/* Status Badge */}
          <div className="absolute top-0 right-0 z-50">
               <div className={`px-4 py-2 rounded-xl border-2 flex flex-col items-center transition-all duration-500 shadow-md ${isBalanced ? 'bg-green-50 border-green-300 text-green-600' : 'bg-red-50 border-red-200 text-red-500 animate-pulse'}`}>
                    <div className="text-[9px] font-black uppercase tracking-widest">{isBalanced ? 'Jämvikt' : 'Obalans'}</div>
                    <div className="text-xl font-black">{isBalanced ? '=' : '≠'}</div>
               </div>
          </div>

          <div className="w-full max-w-[600px] relative mt-10">
              {/* Scale Beam */}
              <div 
                className="w-full h-3 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full relative transition-transform duration-1000 ease-in-out flex shadow-xl z-30"
                style={{ transform: `rotate(${Math.max(-12, Math.min(12, (vlMass - hlMass) * 1.5))}deg)` }}
              >
                  {/* Left Pan */}
                  <div 
                    className={`absolute -top-[180px] left-2 w-[44%] h-[180px] flex flex-col justify-end items-center transition-all duration-1000 origin-top z-40 ${feedbackSide === 'VL' ? 'opacity-30 scale-95' : 'opacity-100'}`}
                    style={{ transform: `rotate(${-Math.max(-12, Math.min(12, (vlMass - hlMass) * 1.5))}deg)` }}
                  >
                      <div className="flex-1 flex flex-wrap justify-center content-end gap-2 p-3 w-full max-h-[160px] overflow-visible pb-2">
                          {Array.from({length: state.vlX}).map((_, i) => (
                              <ObjectRenderer key={`vlx-${i}`} type="X" mode={mode} onClick={() => handleObjectClick('VL', 'X')} />
                          ))}
                          <div className="w-full flex flex-wrap justify-center gap-1 items-end">
                              {Array.from({length: Math.max(0, state.vlConst)}).map((_, i) => (
                                  <ObjectRenderer key={`vlc-${i}`} type="CONST" mode={mode} onClick={() => handleObjectClick('VL', 'CONST')} />
                              ))}
                              {Array.from({length: Math.abs(Math.min(0, state.vlConst))}).map((_, i) => (
                                  <div key={`vln-${i}`} className="flex flex-col items-center">
                                      <div onClick={() => handleObjectClick('VL', 'CONST')} className="w-6 h-8 bg-rose-500 rounded-full border-2 border-rose-700 flex items-center justify-center text-[8px] text-white font-bold cursor-pointer shadow-sm hover:scale-110"> -1 </div>
                                      <div className="w-[1px] h-3 bg-slate-300"></div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="w-full h-5 rounded-b-[40px] border-b-8 border-slate-400 bg-slate-200 shadow-lg" />
                  </div>

                  {/* Right Pan */}
                  <div 
                    className={`absolute -top-[180px] right-2 w-[44%] h-[180px] flex flex-col justify-end items-center transition-all duration-1000 origin-top z-40 ${feedbackSide === 'HL' ? 'opacity-30 scale-95' : 'opacity-100'}`}
                    style={{ transform: `rotate(${-Math.max(-12, Math.min(12, (vlMass - hlMass) * 1.5))}deg)` }}
                  >
                      <div className="flex-1 flex flex-wrap justify-center content-end gap-2 p-3 w-full max-h-[160px] overflow-visible pb-2">
                          {Array.from({length: state.hlX}).map((_, i) => (
                              <ObjectRenderer key={`hlx-${i}`} type="X" mode={mode} onClick={() => handleObjectClick('HL', 'X')} />
                          ))}
                          <div className="w-full flex flex-wrap justify-center gap-1 items-end">
                              {Array.from({length: Math.max(0, state.hlConst)}).map((_, i) => (
                                  <ObjectRenderer key={`hlc-${i}`} type="CONST" mode={mode} onClick={() => handleObjectClick('HL', 'CONST')} />
                              ))}
                              {Array.from({length: Math.abs(Math.min(0, state.hlConst))}).map((_, i) => (
                                  <div key={`hln-${i}`} className="flex flex-col items-center">
                                      <div onClick={() => handleObjectClick('HL', 'CONST')} className="w-6 h-8 bg-rose-500 rounded-full border-2 border-rose-700 flex items-center justify-center text-[8px] text-white font-bold cursor-pointer shadow-sm hover:scale-110"> -1 </div>
                                      <div className="w-[1px] h-3 bg-slate-300"></div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="w-full h-5 rounded-b-[40px] border-b-8 border-slate-400 bg-slate-200 shadow-lg" />
                  </div>
              </div>

              {/* Pivot Point / Stand */}
              <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-6 h-52 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-x-2 border-slate-400/30 -z-10 rounded-t-full shadow-inner" />
              <div className="absolute top-[210px] left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-500 rounded-full shadow-lg -z-10" />
          </div>
      </div>

      {/* 3. INTERACTIVE MATH BAR */}
      <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0">
          <div className="flex flex-col items-center gap-4">
              <div className={`flex items-center gap-6 px-10 py-4 rounded-3xl shadow-xl border-4 font-mono text-3xl font-black transition-all duration-500 ${isBalanced ? 'bg-white border-blue-400' : 'bg-white/50 border-slate-200 opacity-60'}`}>
                  <div className={`${isBalanced ? 'text-blue-600' : 'text-slate-400'}`}>
                    {state.vlX > 0 ? `${state.vlX === 1 ? '' : state.vlX}x` : ''}
                    {state.vlX > 0 && state.vlConst !== 0 ? (state.vlConst > 0 ? ' + ' : ' - ') : ''}
                    {state.vlConst !== 0 ? Math.abs(state.vlConst) : (state.vlX === 0 ? '0' : '')}
                  </div>
                  <div className={`text-4xl transition-colors duration-500 ${isBalanced ? 'text-green-500' : 'text-slate-300'}`}>
                    {isBalanced ? '=' : '≠'}
                  </div>
                  <div className={`${isBalanced ? 'text-blue-600' : 'text-slate-400'}`}>
                    {state.hlX > 0 ? `${state.hlX === 1 ? '' : state.hlX}x` : ''}
                    {state.hlX > 0 && state.hlConst !== 0 ? (state.hlConst > 0 ? ' + ' : ' - ') : ''}
                    {state.hlConst !== 0 ? Math.abs(state.hlConst) : (state.hlX === 0 ? '0' : '')}
                  </div>
              </div>

              {/* Manipulation Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                  <ActionButton label="+ 1" onClick={() => setState(s => ({...s, vlConst: s.vlConst + 1, hlConst: s.hlConst + 1}))} color="amber" />
                  <ActionButton label="- 1" onClick={() => setState(s => ({...s, vlConst: s.vlConst - 1, hlConst: s.hlConst - 1}))} color="red" />
                  <ActionButton label="+ x" onClick={() => setState(s => ({...s, vlX: s.vlX + 1, hlX: s.hlX + 1}))} color="blue" />
                  <ActionButton label="- x" onClick={() => setState(s => ({...s, vlX: Math.max(0, s.vlX - 1), hlX: Math.max(0, s.hlX - 1)}))} color="blue" />
                  <ActionButton label="Rensa" onClick={() => setState({vlX: 0, vlConst: 0, hlX: 0, hlConst: 0})} color="slate" />
              </div>
          </div>
      </div>
    </div>
  );
};

/**
 * Hjälpkomponent för knappar
 */
const ActionButton = ({ label, onClick, color }: { label: string, onClick: () => void, color: string }) => {
    const colorClasses = {
        amber: 'bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white border-amber-200',
        red: 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border-red-100',
        blue: 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-100',
        slate: 'bg-slate-100 text-slate-500 hover:bg-slate-500 hover:text-white border-slate-200'
    }[color] || '';

    return (
        <button 
            onClick={onClick} 
            className={`px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase transition-all shadow-sm active:scale-90 ${colorClasses}`}
        >
            {label}
        </button>
    );
};

/**
 * Hjälpkomponent för att rita objekt (block eller tändstickor)
 */
const ObjectRenderer: React.FC<{ type: 'X' | 'CONST', mode: Representation, onClick: () => void }> = ({ type, mode, onClick }) => {
    if (mode === 'BLOCKS') {
        if (type === 'X') return (
            <div onClick={onClick} className="w-10 h-10 bg-blue-500 border-2 border-blue-700 rounded-lg flex items-center justify-center text-white font-black shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform">x</div>
        );
        return (
            <div onClick={onClick} className="w-6 h-6 bg-amber-400 border-2 border-amber-600 rounded shadow-sm flex items-center justify-center text-[8px] font-black text-amber-900 cursor-pointer hover:scale-110 active:scale-95 transition-transform">+1</div>
        );
    }

    // Matchsticks Mode
    if (type === 'X') return (
        <div onClick={onClick} className="relative w-20 h-12 bg-[#7a5230] border-2 border-[#4a2e1a] rounded-lg shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all overflow-hidden">
            <div className="absolute inset-1 bg-[#d9c5a7] border border-[#3d2917]/30 rounded-sm flex items-center justify-center shadow-inner overflow-hidden">
                <div className="w-8 h-6 bg-blue-600 rounded-full flex items-center justify-center relative border border-yellow-400">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full blur-[1px] opacity-40"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4a2e1a] opacity-50"></div>
            </div>
        </div>
    );
    return (
        <div onClick={onClick} className="w-2 h-14 bg-[#e3c49a] rounded-sm relative shadow-sm border-t-4 border-red-600 cursor-pointer hover:scale-110 active:scale-95 transition-transform flex-shrink-0" />
    );
};
