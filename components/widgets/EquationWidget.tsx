
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icons } from '../icons';

type Side = 'VL' | 'HL';
type Representation = 'BLOCKS' | 'MATCHSTICKS';

interface EquationState {
  vlX: number;
  vlConst: number;
  hlX: number;
  hlConst: number;
}

interface HistoryStep {
    action: string;
    state: EquationState;
}

interface EquationWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

const parseSide = (str: string): { x: number, c: number } | null => {
    const clean = str.replace(/\s+/g, '').toLowerCase().replace(/−/g, '-');
    if (!clean || clean === '0') return { x: 0, c: 0 };
    
    // Split into terms using regex to keep signs
    const terms = clean.split(/(?=[+-])/);
    let x = 0;
    let c = 0;
    
    for (let term of terms) {
        if (!term || term === '+') continue;
        if (term.includes('x')) {
            const coefStr = term.replace('x', '');
            if (coefStr === '' || coefStr === '+') x += 1;
            else if (coefStr === '-') x -= 1;
            else {
                const val = parseInt(coefStr);
                if (isNaN(val)) return null;
                x += val;
            }
        } else {
            const val = parseInt(term);
            if (isNaN(val)) return null;
            c += val;
        }
    }
    return { x, c };
};

const formatEquationSide = (x: number, c: number) => {
    if (x === 0 && c === 0) return "0";
    let parts = [];
    if (x !== 0) parts.push(x === 1 ? "x" : x === -1 ? "-x" : `${x}x`);
    if (c !== 0) {
        const sign = c > 0 ? (parts.length > 0 ? " + " : "") : (parts.length > 0 ? " - " : "-");
        parts.push(`${sign}${Math.abs(c)}`);
    }
    return parts.join("");
};

export const EquationWidget: React.FC<EquationWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [mode, setMode] = useState<Representation>('MATCHSTICKS');
  const [hiddenX, setHiddenX] = useState(5);
  const [state, setState] = useState<EquationState>({ vlX: 1, vlConst: 2, hlX: 0, hlConst: 7 });
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [bothSidesMode, setBothSidesMode] = useState(false);
  
  // Local input states for manual editing
  const [inputVL, setInputVL] = useState(formatEquationSide(1, 2));
  const [inputHL, setInputHL] = useState(formatEquationSide(0, 7));
  const isInternalChange = useRef(false);

  const vlMass = state.vlX * hiddenX + state.vlConst;
  const hlMass = state.hlX * hiddenX + state.hlConst;
  const isBalanced = vlMass === hlMass;

  const isSolved = useMemo(() => {
    if (!isBalanced) return false;
    const xIsolatedLeft = state.vlX === 1 && state.hlX === 0 && state.vlConst === 0;
    const xIsolatedRight = state.hlX === 1 && state.vlX === 0 && state.hlConst === 0;
    return xIsolatedLeft || xIsolatedRight;
  }, [state, isBalanced]);

  // Update text fields when state changes from buttons
  useEffect(() => {
    if (!isInternalChange.current) {
        setInputVL(formatEquationSide(state.vlX, state.vlConst));
        setInputHL(formatEquationSide(state.hlX, state.hlConst));
    }
    isInternalChange.current = false;
  }, [state]);

  const handleInputChange = (side: Side, val: string) => {
    if (side === 'VL') setInputVL(val);
    else setInputHL(val);

    const parsed = parseSide(val);
    if (parsed) {
        isInternalChange.current = true;
        setState(prev => ({
            ...prev,
            [side === 'VL' ? 'vlX' : 'hlX']: parsed.x,
            [side === 'VL' ? 'vlConst' : 'hlConst']: parsed.c
        }));
    }
  };

  const pushHistory = (action: string, newState: EquationState) => {
      setHistory(prev => [{ action, state: { ...state } }, ...prev].slice(0, 8));
      setState(newState);
  };

  const undo = () => {
      if (history.length === 0) return;
      const last = history[0];
      setState(last.state);
      setHistory(prev => prev.slice(1));
  };

  const reset = (level: number = 1) => {
    const newX = Math.floor(Math.random() * 5) + 3;
    setHiddenX(newX);
    setHistory([]);
    let newState: EquationState;
    if (level === 1) {
        const a = Math.floor(Math.random() * 5) + 1;
        newState = { vlX: 1, vlConst: a, hlX: 0, hlConst: newX + a };
    } else if (level === 2) {
        const a = 2;
        newState = { vlX: a, vlConst: 0, hlX: 0, hlConst: newX * a };
    } else {
        const a = 2;
        const b = Math.floor(Math.random() * 3) + 1;
        newState = { vlX: a, vlConst: b, hlX: a - 1, hlConst: newX + b };
    }
    setState(newState);
  };

  const manipulate = (side: Side | 'BOTH', type: 'X' | 'CONST', value: number) => {
      const newState = { ...state };
      let actionLabel = "";
      const updateSide = (s: Side) => {
          if (type === 'X') {
              if (s === 'VL') newState.vlX = Math.max(0, newState.vlX + value);
              else newState.hlX = Math.max(0, newState.hlX + value);
          } else {
              if (s === 'VL') newState.vlConst = Math.max(0, newState.vlConst + value);
              else newState.hlConst = Math.max(0, newState.hlConst + value);
          }
      };
      if (side === 'BOTH' || bothSidesMode) {
          updateSide('VL'); updateSide('HL');
          actionLabel = `Båda ${value > 0 ? '+' : '−'}${Math.abs(value)}${type === 'X' ? 'x' : ''}`;
      } else {
          updateSide(side);
          actionLabel = `${side} ${value > 0 ? '+' : '−'}${Math.abs(value)}${type === 'X' ? 'x' : ''}`;
      }
      pushHistory(actionLabel, newState);
  };

  return (
    <div className="w-full h-full flex flex-row bg-white overflow-hidden select-none">
      
      {/* LEFT: SCALE & EQUATION (MAIN AREA) */}
      <div className="flex-1 relative flex flex-col items-center justify-between p-4 bg-slate-50/20 overflow-visible min-w-0">
          <div className="w-full flex justify-between items-start">
               <div className={`px-3 py-1 rounded-lg border font-black uppercase text-[9px] shadow-sm transition-all duration-500 ${isBalanced ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-100 border-rose-200 text-rose-500'}`}>
                   {isBalanced ? 'Jämvikt' : 'Obalans'}
               </div>
               {isSolved && (
                   <div className="bg-amber-100 border border-amber-400 text-amber-700 px-3 py-1 rounded-xl shadow-lg animate-bounce flex items-center gap-1.5">
                       <span className="text-sm font-black font-mono leading-none">X = {hiddenX}</span>
                       <Icons.Sparkles className="text-amber-500" size={12} />
                   </div>
               )}
          </div>

          {/* Scale Visualization */}
          <div className="w-full max-w-[550px] relative mt-32 mb-10">
              <div 
                className="w-full h-3 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full relative transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) flex shadow-lg z-30"
                style={{ transform: `rotate(${Math.max(-15, Math.min(15, (vlMass - hlMass) * 1.5))}deg)` }}
              >
                  <ScalePan side="VL" mass={vlMass} otherMass={hlMass} x={state.vlX} c={state.vlConst} mode={mode} onObjectClick={(t) => manipulate('VL', t, -1)} />
                  <ScalePan side="HL" mass={hlMass} otherMass={vlMass} x={state.hlX} c={state.hlConst} mode={mode} onObjectClick={(t) => manipulate('HL', t, -1)} />
              </div>
              <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-5 h-48 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-x border-slate-400/20 -z-10 rounded-t-full" />
              <div className="absolute top-[190px] left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-400 rounded-full shadow-md -z-10" />
          </div>

          {/* Editable Equation Display */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg border-2 transition-all duration-500 mb-2 ${isSolved ? 'bg-amber-50 border-amber-400 scale-105' : isBalanced ? 'bg-white border-emerald-400' : 'bg-white border-slate-200'}`}>
              <input 
                type="text"
                value={inputVL}
                onChange={(e) => handleInputChange('VL', e.target.value)}
                className={`w-32 sm:w-40 text-center bg-transparent border-none outline-none font-mono text-2xl font-black ${isBalanced ? 'text-blue-600' : 'text-slate-500'}`}
                placeholder="Vänster"
              />
              <div className={`text-3xl font-black ${isBalanced ? 'text-emerald-500' : 'text-rose-300'}`}>{isBalanced ? '=' : '≠'}</div>
              <input 
                type="text"
                value={inputHL}
                onChange={(e) => handleInputChange('HL', e.target.value)}
                className={`w-32 sm:w-40 text-center bg-transparent border-none outline-none font-mono text-2xl font-black ${isBalanced ? 'text-blue-600' : 'text-slate-500'}`}
                placeholder="Höger"
              />
          </div>
      </div>

      {/* RIGHT: CONTROL SIDEBAR */}
      <div className="w-32 sm:w-40 shrink-0 bg-slate-100 border-l border-slate-200 flex flex-col h-full min-h-0 overflow-y-auto">
          
          <div className="p-2 border-b border-slate-200 flex flex-col gap-1.5 bg-white">
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  <button onClick={() => setMode('BLOCKS')} className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase transition-all ${mode === 'BLOCKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Block</button>
                  <button onClick={() => setMode('MATCHSTICKS')} className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase transition-all ${mode === 'MATCHSTICKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Askar</button>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                  {[1, 2, 3].map(lvl => (
                      <button key={lvl} onClick={() => reset(lvl)} className="py-1 bg-slate-50 border border-slate-200 rounded text-[8px] font-black text-slate-500 hover:border-blue-400">Lv {lvl}</button>
                  ))}
              </div>
          </div>

          <div className="p-2 bg-slate-900 text-white flex flex-col gap-2 flex-1">
              <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Matte-steg</span>
                  <button 
                    onClick={() => setBothSidesMode(!bothSidesMode)}
                    className={`p-1 rounded transition-all ${bothSidesMode ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' : 'bg-slate-800 text-slate-500'}`}
                  >
                      <Icons.Zap size={10} />
                  </button>
              </div>

              <div className={`flex flex-col gap-0.5 ${bothSidesMode ? 'opacity-20 pointer-events-none' : ''}`}>
                  <span className="text-[7px] font-bold text-slate-500 uppercase px-1">Vänster</span>
                  <div className="grid grid-cols-2 gap-0.5">
                      <ActionBtn label="+X" onClick={() => manipulate('VL', 'X', 1)} color="blue" />
                      <ActionBtn label="+1" onClick={() => manipulate('VL', 'CONST', 1)} color="emerald" />
                      <ActionBtn label="-X" onClick={() => manipulate('VL', 'X', -1)} color="slate" />
                      <ActionBtn label="-1" onClick={() => manipulate('VL', 'CONST', -1)} color="slate" />
                  </div>
              </div>

              <div className="flex flex-col gap-0.5 py-1.5 border-y border-slate-800">
                  <span className="text-[7px] font-bold text-blue-400 uppercase text-center">Båda sidor</span>
                  <div className="grid grid-cols-2 gap-0.5">
                      <ActionBtn label="+X" onClick={() => manipulate('BOTH', 'X', 1)} color="blue" />
                      <ActionBtn label="+1" onClick={() => manipulate('BOTH', 'CONST', 1)} color="emerald" />
                      <ActionBtn label="-X" onClick={() => manipulate('BOTH', 'X', -1)} color="red" />
                      <ActionBtn label="-1" onClick={() => manipulate('BOTH', 'CONST', -1)} color="red" />
                  </div>
              </div>

              <div className={`flex flex-col gap-0.5 ${bothSidesMode ? 'opacity-20 pointer-events-none' : ''}`}>
                  <span className="text-[7px] font-bold text-slate-500 uppercase px-1">Höger</span>
                  <div className="grid grid-cols-2 gap-0.5">
                      <ActionBtn label="+X" onClick={() => manipulate('HL', 'X', 1)} color="blue" />
                      <ActionBtn label="+1" onClick={() => manipulate('HL', 'CONST', 1)} color="emerald" />
                      <ActionBtn label="-X" onClick={() => manipulate('HL', 'X', -1)} color="slate" />
                      <ActionBtn label="-1" onClick={() => manipulate('HL', 'CONST', -1) } color="slate" />
                  </div>
              </div>

              <div className="mt-auto flex flex-col gap-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-black text-slate-600 uppercase">Historik</span>
                    <div className="flex gap-1">
                        <button onClick={undo} disabled={history.length === 0} className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-20 bg-slate-800 rounded">
                            <Icons.Reset size={10} className="-scale-x-100" />
                        </button>
                        <button onClick={() => reset(1)} className="p-1 text-slate-400 hover:text-red-500 bg-slate-800 rounded">
                            <Icons.Trash size={10} />
                        </button>
                    </div>
                  </div>
                  <div className="max-h-[80px] overflow-y-auto space-y-0.5 scrollbar-thin">
                    {history.map((step, i) => (
                        <div key={i} className="text-[7px] font-mono bg-slate-800 p-1 rounded border border-slate-700 text-slate-400 truncate">
                            {step.action}
                        </div>
                    ))}
                  </div>
              </div>
          </div>
      </div>

      <style>{`
        .scale-item:hover { transform: scale(1.1) translateY(-2px); z-index: 50; }
        .scale-item:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
};

const ActionBtn = ({ label, onClick, color }: { label: string, onClick: () => void, color: 'blue' | 'emerald' | 'red' | 'slate' }) => {
    const colors = {
        blue: 'bg-blue-700 hover:bg-blue-600 text-white',
        emerald: 'bg-emerald-700 hover:bg-emerald-600 text-white',
        red: 'bg-red-700 hover:bg-red-600 text-white',
        slate: 'bg-slate-800 hover:bg-slate-700 text-slate-500'
    };
    return (
        <button 
            onClick={onClick} 
            className={`rounded-md font-black text-[8px] py-1 shadow-sm active:scale-95 transition-all flex items-center justify-center border border-white/5 ${colors[color]}`}
        >
            {label}
        </button>
    );
};

const ScalePan = ({ side, mass, otherMass, x, c, mode, onObjectClick }: { side: Side, mass: number, otherMass: number, x: number, c: number, mode: Representation, onObjectClick: (t: 'X' | 'CONST') => void }) => {
    const tilt = Math.max(-15, Math.min(15, (side === 'VL' ? mass - otherMass : otherMass - mass) * 1.5));
    
    return (
        <div 
            className="absolute -top-[160px] w-[44%] h-[160px] flex flex-col justify-end items-center origin-top transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) z-40"
            style={{ [side === 'VL' ? 'left' : 'right']: '12px', transform: `rotate(${-tilt}deg)` }}
        >
            <div className="flex-1 flex flex-wrap justify-center content-end gap-1 p-2 w-full max-h-[140px] overflow-visible pb-1.5">
                {Array.from({ length: Math.abs(x) }).map((_, i) => (
                    <div key={`x-${i}`} onClick={() => onObjectClick('X')} className="scale-item cursor-pointer transition-all duration-300">
                        {mode === 'BLOCKS' ? (
                            <div className="w-8 h-8 bg-blue-500 border-b-2 border-r-2 border-blue-700 rounded-lg flex items-center justify-center text-white font-black text-sm">{x > 0 ? 'x' : '-x'}</div>
                        ) : (
                            <div className="relative w-12 h-6 bg-[#8B5E3C] border border-[#5D3A1A] rounded shadow-sm overflow-hidden">
                                <div className="absolute inset-0.5 bg-[#D2B48C] rounded-sm flex items-center justify-center">
                                    <div className="px-1 py-0 bg-blue-600 text-white font-black text-[7px] rounded-sm">{x > 0 ? 'x' : '-x'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-wrap justify-center gap-1 items-end">
                    {Array.from({ length: Math.abs(c) }).map((_, i) => (
                        <div key={`c-${i}`} onClick={() => onObjectClick('CONST')} className="scale-item cursor-pointer transition-all duration-300">
                            {mode === 'BLOCKS' ? (
                                <div className="w-5 h-5 bg-emerald-500 border-b-2 border-r-2 border-emerald-700 rounded-md shadow-md flex items-center justify-center text-white font-black text-[8px]">{c > 0 ? '1' : '-1'}</div>
                            ) : (
                                <div className="w-1.5 h-7 bg-[#F5DEB3] rounded-sm relative shadow-sm border-t-2 border-emerald-600" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full h-3 rounded-b-[40px] border-b-[6px] border-slate-400 bg-slate-200 shadow-md relative" />
        </div>
    );
};
