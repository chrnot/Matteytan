
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icons } from '../icons';

type Side = 'VL' | 'HL';
type Representation = 'BLOCKS' | 'MATCHSTICKS';
type WidgetTab = 'SCALE' | 'AGENT';
type AgentSubMode = 'MANUAL' | 'AUTO';

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

interface Clue {
    id: string;
    text: string;
    type: 'POSITIVE' | 'NEGATIVE';
}

interface EquationWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

// --- HELPERS FOR SCALE ---
const parseSide = (str: string): { x: number, c: number } | null => {
    const clean = str.replace(/\s+/g, '').toLowerCase().replace(/−/g, '-');
    if (!clean || clean === '0') return { x: 0, c: 0 };
    const terms = clean.split(/(?=[+-])/);
    let x = 0; let c = 0;
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
  const [activeTab, setActiveTab] = useState<WidgetTab>('SCALE');
  
  // --- SCALE STATE ---
  const [mode, setMode] = useState<Representation>('MATCHSTICKS');
  const [hiddenX, setHiddenX] = useState(5);
  const [state, setState] = useState<EquationState>({ vlX: 1, vlConst: 2, hlX: 0, hlConst: 7 });
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [bothSidesMode, setBothSidesMode] = useState(false);
  const [inputVL, setInputVL] = useState(formatEquationSide(1, 2));
  const [inputHL, setInputHL] = useState(formatEquationSide(0, 7));
  const isInternalChange = useRef(false);

  // --- AGENT STATE ---
  const [agentSubMode, setAgentSubMode] = useState<AgentSubMode>('MANUAL');
  const [secretX, setSecretX] = useState<number | ''>('');
  const [isXSet, setIsXSet] = useState(false);
  const [clues, setClues] = useState<Clue[]>([]);
  const [eliminatedNumbers, setEliminatedNumbers] = useState<Set<number>>(new Set());
  const [isRevealed, setIsRevealed] = useState(false);
  const [newClueType, setNewClueType] = useState<string>('>');
  const [newClueVal, setNewClueVal] = useState<string>('');

  // --- SCALE LOGIC ---
  const vlMass = state.vlX * hiddenX + state.vlConst;
  const hlMass = state.hlX * hiddenX + state.hlConst;
  const isBalanced = vlMass === hlMass;
  const isSolved = useMemo(() => {
    if (!isBalanced) return false;
    return (state.vlX === 1 && state.hlX === 0 && state.vlConst === 0) || (state.hlX === 1 && state.vlX === 0 && state.hlConst === 0);
  }, [state, isBalanced]);

  useEffect(() => {
    if (!isInternalChange.current) {
        setInputVL(formatEquationSide(state.vlX, state.vlConst));
        setInputHL(formatEquationSide(state.hlX, state.hlConst));
    }
    isInternalChange.current = false;
  }, [state]);

  const handleInputChange = (side: Side, val: string) => {
    if (side === 'VL') setInputVL(val); else setInputHL(val);
    const parsed = parseSide(val);
    if (parsed) {
        isInternalChange.current = true;
        setState(prev => ({ ...prev, [side === 'VL' ? 'vlX' : 'hlX']: parsed.x, [side === 'VL' ? 'vlConst' : 'hlConst']: parsed.c }));
    }
  };

  const manipulate = (side: Side | 'BOTH', type: 'X' | 'CONST', value: number) => {
      const newState = { ...state };
      const updateSide = (s: Side) => {
          if (type === 'X') {
              if (s === 'VL') newState.vlX = Math.max(0, newState.vlX + value);
              else newState.hlX = Math.max(0, newState.hlX + value);
          } else {
              if (s === 'VL') newState.vlConst = Math.max(0, newState.vlConst + value);
              else newState.hlConst = Math.max(0, newState.hlConst + value);
          }
      };
      let actionLabel = "";
      if (side === 'BOTH' || bothSidesMode) {
          updateSide('VL'); updateSide('HL');
          actionLabel = `Båda ${value > 0 ? '+' : '−'}${Math.abs(value)}${type === 'X' ? 'x' : ''}`;
      } else {
          updateSide(side);
          actionLabel = `${side} ${value > 0 ? '+' : '−'}${Math.abs(value)}${type === 'X' ? 'x' : ''}`;
      }
      setHistory(prev => [{ action: actionLabel, state: { ...state } }, ...prev].slice(0, 8));
      setState(newState);
  };

  const resetScale = (level: number = 1) => {
    const newX = Math.floor(Math.random() * 5) + 3;
    setHiddenX(newX); setHistory([]);
    let newState: EquationState;
    if (level === 1) newState = { vlX: 1, vlConst: 2, hlX: 0, hlConst: newX + 2 };
    else if (level === 2) newState = { vlX: 2, vlConst: 0, hlX: 0, hlConst: newX * 2 };
    else newState = { vlX: 2, vlConst: 3, hlX: 1, hlConst: newX + 3 };
    setState(newState);
  };

  // --- AGENT LOGIC ---
  const addClue = (isYes: boolean) => {
      let text = "";
      const val = parseInt(newClueVal);
      
      if (newClueType === 'odd') text = isYes ? "x är ett udda tal" : "x är ett jämnt tal";
      else if (newClueType === 'even') text = isYes ? "x är ett jämnt tal" : "x är ett udda tal";
      else if (newClueType === 'div') {
          if (isNaN(val)) return;
          text = isYes ? `x är delbart med ${val}` : `x är INTE delbart med ${val}`;
      } else {
          if (isNaN(val)) return;
          if (isYes) text = `x ${newClueType} ${val}`;
          else {
              if (newClueType === '>') text = `x ≤ ${val}`;
              else if (newClueType === '<') text = `x ≥ ${val}`;
              else if (newClueType === '=') text = `x ≠ ${val}`;
          }
      }
      
      if (text) {
          setClues(prev => [...prev, { id: Date.now().toString(), text, type: isYes ? 'POSITIVE' : 'NEGATIVE' }]);
          setNewClueVal('');
      }
  };

  const isPrime = (n: number) => {
      if (n <= 1) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
      return true;
  };

  const generateAutoClue = () => {
    if (typeof secretX !== 'number') return;
    const x = secretX;
    const potentialClues: string[] = [];
    
    // Bas-ledtrådar
    potentialClues.push(x % 2 === 0 ? "x är ett jämnt tal" : "x är ett udda tal");
    
    // Storlek
    if (x > 10) {
        const lower = Math.floor((x - 1) / 10) * 10;
        const upper = lower + 10;
        potentialClues.push(`x ligger mellan ${lower} och ${upper}`);
    }

    // Delbarhet
    [3, 4, 5, 10].forEach(d => {
        if (x % d === 0) potentialClues.push(`x är delbart med ${d}`);
    });

    // Specialiteter
    if (isPrime(x)) potentialClues.push("x är ett primtal");
    if (Math.sqrt(x) % 1 === 0) potentialClues.push("x är ett kvadratiskt tal");
    
    // Tiokompisar
    if (x < 10) potentialClues.push(`x:s tiokompis är ${10 - x}`);

    // Filtrera bort befintliga och slumpa en ny
    const unused = potentialClues.filter(c => !clues.some(existing => existing.text === c));
    if (unused.length > 0) {
        const selected = unused[Math.floor(Math.random() * unused.length)];
        setClues(prev => [...prev, { id: Date.now().toString(), text: selected, type: 'POSITIVE' }]);
    } else {
        // Fallback: Ge en intervall-ledtråd om allt annat är slut
        const offset = Math.floor(Math.random() * 5) + 1;
        setClues(prev => [...prev, { id: Date.now().toString(), text: `x är ${x > 50 ? 'större än' : 'mindre än'} ${x > 50 ? x - offset : x + offset}`, type: 'POSITIVE' }]);
    }
  };

  const startAutoGame = () => {
      const randX = Math.floor(Math.random() * 100) + 1;
      setSecretX(randX);
      setIsXSet(true);
      setClues([]);
      setEliminatedNumbers(new Set());
      setIsRevealed(false);
      // Första ledtråden direkt
      setTimeout(() => {
          setClues([{ id: 'start', text: randX > 50 ? "x är större än 50" : "x är 50 eller mindre", type: 'POSITIVE' }]);
      }, 100);
  };

  const toggleElimination = (num: number) => {
      setEliminatedNumbers(prev => {
          const next = new Set(prev);
          if (next.has(num)) next.delete(num);
          else next.add(num);
          return next;
      });
  };

  const resetAgentGame = () => {
      setSecretX(''); setIsXSet(false); setClues([]); setEliminatedNumbers(new Set()); setIsRevealed(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none">
      {/* GLOBAL TAB NAVIGATION */}
      <div className="flex bg-slate-100 p-1 shrink-0 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('SCALE')}
            className={`flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'SCALE' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Icons.Scale size={16} /> Ekvationsvågen
          </button>
          <button 
            onClick={() => setActiveTab('AGENT')}
            className={`flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'AGENT' ? 'bg-white shadow text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Icons.Hash size={16} /> Agenten x
          </button>
      </div>

      {activeTab === 'SCALE' ? (
        /* SCALE VIEW (Oförändrad) */
        <div className="flex-1 flex flex-row overflow-hidden animate-in fade-in duration-300">
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
                <div className="w-full max-w-[550px] relative mt-32 mb-10">
                    <div className="w-full h-3 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full relative transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) flex shadow-lg z-30" style={{ transform: `rotate(${Math.max(-15, Math.min(15, (vlMass - hlMass) * 1.5))}deg)` }}>
                        <ScalePan side="VL" mass={vlMass} otherMass={hlMass} x={state.vlX} c={state.vlConst} mode={mode} onObjectClick={(t) => manipulate('VL', t, -1)} />
                        <ScalePan side="HL" mass={hlMass} otherMass={vlMass} x={state.hlX} c={state.hlConst} mode={mode} onObjectClick={(t) => manipulate('HL', t, -1)} />
                    </div>
                    <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-5 h-48 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-x border-slate-400/20 -z-10 rounded-t-full" />
                    <div className="absolute top-[190px] left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-400 rounded-full shadow-md -z-10" />
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg border-2 transition-all duration-500 mb-2 ${isSolved ? 'bg-amber-50 border-amber-400 scale-105' : isBalanced ? 'bg-white border-emerald-400' : 'bg-white border-slate-200'}`}>
                    <input type="text" value={inputVL} onChange={(e) => handleInputChange('VL', e.target.value)} className={`w-32 sm:w-40 text-center bg-transparent border-none outline-none font-mono text-2xl font-black ${isBalanced ? 'text-blue-600' : 'text-slate-500'}`} placeholder="Vänster" />
                    <div className={`text-3xl font-black ${isBalanced ? 'text-emerald-500' : 'text-rose-300'}`}>{isBalanced ? '=' : '≠'}</div>
                    <input type="text" value={inputHL} onChange={(e) => handleInputChange('HL', e.target.value)} className={`w-32 sm:w-40 text-center bg-transparent border-none outline-none font-mono text-2xl font-black ${isBalanced ? 'text-blue-600' : 'text-slate-500'}`} placeholder="Höger" />
                </div>
            </div>
            <div className="w-32 sm:w-40 shrink-0 bg-slate-100 border-l border-slate-200 flex flex-col h-full min-h-0 overflow-y-auto">
                <div className="p-2 border-b border-slate-200 flex flex-col gap-1.5 bg-white">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                        <button onClick={() => setMode('BLOCKS')} className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase transition-all ${mode === 'BLOCKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Block</button>
                        <button onClick={() => setMode('MATCHSTICKS')} className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase transition-all ${mode === 'MATCHSTICKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Askar</button>
                    </div>
                    <div className="grid grid-cols-3 gap-0.5">
                        {[1, 2, 3].map(lvl => (
                            <button key={lvl} onClick={() => resetScale(lvl)} className="py-1 bg-slate-50 border border-slate-200 rounded text-[8px] font-black text-slate-500 hover:border-blue-400">Lv {lvl}</button>
                        ))}
                    </div>
                </div>
                <div className="p-2 bg-slate-900 text-white flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-center mb-0.5"><span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Matte-steg</span><button onClick={() => setBothSidesMode(!bothSidesMode)} className={`p-1 rounded transition-all ${bothSidesMode ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' : 'bg-slate-800 text-slate-500'}`}><Icons.Zap size={10} /></button></div>
                    <div className={`flex flex-col gap-0.5 ${bothSidesMode ? 'opacity-20 pointer-events-none' : ''}`}><span className="text-[7px] font-bold text-slate-500 uppercase px-1">Vänster</span><div className="grid grid-cols-2 gap-0.5"><ActionBtn label="+X" onClick={() => manipulate('VL', 'X', 1)} color="blue" /><ActionBtn label="+1" onClick={() => manipulate('VL', 'CONST', 1)} color="emerald" /><ActionBtn label="-X" onClick={() => manipulate('VL', 'X', -1)} color="slate" /><ActionBtn label="-1" onClick={() => manipulate('VL', 'CONST', -1)} color="slate" /></div></div>
                    <div className="flex flex-col gap-0.5 py-1.5 border-y border-slate-800"><span className="text-[7px] font-bold text-blue-400 uppercase text-center">Båda sidor</span><div className="grid grid-cols-2 gap-0.5"><ActionBtn label="+X" onClick={() => manipulate('BOTH', 'X', 1)} color="blue" /><ActionBtn label="+1" onClick={() => manipulate('BOTH', 'CONST', 1)} color="emerald" /><ActionBtn label="-X" onClick={() => manipulate('BOTH', 'X', -1)} color="red" /><ActionBtn label="-1" onClick={() => manipulate('BOTH', 'CONST', -1)} color="red" /></div></div>
                    <div className={`flex flex-col gap-0.5 ${bothSidesMode ? 'opacity-20 pointer-events-none' : ''}`}><span className="text-[7px] font-bold text-slate-500 uppercase px-1">Höger</span><div className="grid grid-cols-2 gap-0.5"><ActionBtn label="+X" onClick={() => manipulate('HL', 'X', 1)} color="blue" /><ActionBtn label="+1" onClick={() => manipulate('HL', 'CONST', 1)} color="emerald" /><ActionBtn label="-X" onClick={() => manipulate('HL', 'X', -1)} color="slate" /><ActionBtn label="-1" onClick={() => manipulate('HL', 'CONST', -1) } color="slate" /></div></div>
                    <div className="mt-auto flex flex-col gap-1.5 pt-2 border-t border-slate-800"><div className="flex justify-between items-center"><span className="text-[7px] font-black text-slate-600 uppercase">Historik</span><div className="flex gap-1"><button onClick={() => setHistory(history.slice(1))} disabled={history.length === 0} className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-20 bg-slate-800 rounded"><Icons.Reset size={10} className="-scale-x-100" /></button><button onClick={() => resetScale(1)} className="p-1 text-slate-400 hover:text-red-500 bg-slate-800 rounded"><Icons.Trash size={10} /></button></div></div><div className="max-h-[80px] overflow-y-auto space-y-0.5 scrollbar-thin">{history.map((step, i) => (<div key={i} className="text-[7px] font-mono bg-slate-800 p-1 rounded border border-slate-700 text-slate-400 truncate">{step.action}</div>))}</div></div>
                </div>
            </div>
        </div>
      ) : (
        /* AGENT X VIEW */
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
            
            {/* AGENT MODE SELECTOR */}
            {!isXSet && (
                <div className="flex p-4 gap-4 justify-center bg-white border-b shrink-0 z-20">
                    <button 
                        onClick={() => setAgentSubMode('MANUAL')}
                        className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${agentSubMode === 'MANUAL' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        <Icons.Book size={18} /> VÄN-MATCH
                    </button>
                    <button 
                        onClick={() => setAgentSubMode('AUTO')}
                        className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${agentSubMode === 'AUTO' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        <Icons.Math size={18} /> DATOR-UTMANING
                    </button>
                </div>
            )}

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                {/* SIDEBAR (LEFT) - AGENT WORKSPACE */}
                <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-white shadow-sm shrink-0 z-10">
                    {!isXSet ? (
                        <div className="p-8 flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-indigo-900 text-amber-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3 border-4 border-indigo-950">
                                {agentSubMode === 'MANUAL' ? <Icons.Crown size={40} /> : <Icons.Hash size={40} />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">
                                {agentSubMode === 'MANUAL' ? 'Förbered Uppdraget' : 'Datorn slumpar ett tal'}
                            </h3>
                            <p className="text-sm text-slate-400 mb-8 font-medium italic">
                                {agentSubMode === 'MANUAL' ? 'Välj ett tal mellan 1 och 100 som deckarna ska gissa.' : 'Är du redo att lösa datorns hemliga tal?'}
                            </p>
                            
                            {agentSubMode === 'MANUAL' ? (
                                <div className="flex flex-col gap-4 w-full px-6">
                                    <input 
                                        type="number" 
                                        value={secretX} 
                                        onChange={e => setSecretX(parseInt(e.target.value) || '')}
                                        className="w-full p-5 text-5xl font-black text-center border-4 border-indigo-100 focus:border-indigo-600 bg-slate-50 rounded-[2rem] outline-none transition-all"
                                        placeholder="?"
                                        min="1" max="100"
                                    />
                                    <button 
                                        onClick={() => secretX !== '' && setIsXSet(true)}
                                        className="w-full py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-950 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Icons.Zap className="text-amber-400" /> STARTA JAKTEN
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={startAutoGame}
                                    className="w-full py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-950 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Icons.Shuffle className="text-amber-400" /> SLUMPA & STARTA
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Status Header */}
                            <div className="p-6 bg-indigo-950 text-white shadow-lg shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Icons.Tools size={80} /></div>
                                <div className="flex justify-between items-center mb-2 relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Ledtrådar</span>
                                    <div className="flex items-center gap-2 bg-indigo-900 px-2 py-0.5 rounded-full border border-indigo-800">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{agentSubMode === 'MANUAL' ? 'Vän-Match' : 'Dator-Utmaning'}</span>
                                    </div>
                                </div>
                                <div className="text-4xl font-black font-mono tracking-tighter flex items-center gap-4">
                                    <span className="text-indigo-400">x =</span>
                                    <span>{isRevealed ? secretX : '??'}</span>
                                </div>
                            </div>

                            {/* Clue List */}
                            <div className="flex-1 p-5 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50/50">
                                {clues.map((clue, idx) => (
                                    <div key={clue.id} className="group p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all animate-in slide-in-from-left-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Bevis #{idx+1}</span>
                                            <Icons.Plus size={10} className="text-slate-200 rotate-45" />
                                        </div>
                                        <span className="font-mono text-lg font-black text-slate-700 italic leading-tight">"{clue.text}"</span>
                                    </div>
                                ))}
                                {clues.length === 0 && (
                                    <div className="text-center py-20 opacity-20 px-6">
                                        <Icons.Book size={48} className="mx-auto mb-3" />
                                        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Agenten väntar på din fråga...</p>
                                    </div>
                                )}
                            </div>

                            {/* Clue Generation Tools */}
                            <div className="p-5 border-t bg-white space-y-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                                {agentSubMode === 'MANUAL' ? (
                                    <>
                                        <div className="flex gap-1.5">
                                            <select 
                                                value={newClueType} 
                                                onChange={e => setNewClueType(e.target.value)}
                                                className="flex-1 p-2.5 text-xs font-black rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-indigo-200 transition-all appearance-none"
                                            >
                                                <option value=">">x &gt;</option>
                                                <option value="<">x &lt;</option>
                                                <option value="=">x =</option>
                                                <option value="odd">Udda</option>
                                                <option value="even">Jämnt</option>
                                                <option value="div">Delbart med</option>
                                            </select>
                                            {!['odd', 'even'].includes(newClueType) && (
                                                <input 
                                                    type="number" 
                                                    value={newClueVal} 
                                                    onChange={e => setNewClueVal(e.target.value)}
                                                    className="w-20 p-2.5 text-sm font-black border-2 border-slate-100 rounded-xl text-center bg-slate-50 focus:border-indigo-200 outline-none"
                                                    placeholder="n"
                                                />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => addClue(true)}
                                                className="py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2"
                                            >
                                                <Icons.Plus size={14} strokeWidth={4} /> JA
                                            </button>
                                            <button 
                                                onClick={() => addClue(false)}
                                                className="py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase hover:bg-rose-700 shadow-md flex items-center justify-center gap-2"
                                            >
                                                <Icons.X size={14} strokeWidth={4} /> NEJ
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button 
                                        onClick={generateAutoClue}
                                        disabled={isRevealed}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Icons.Plus size={18} /> HÄMTA LEDTRÅD
                                    </button>
                                )}

                                <button 
                                    onClick={() => setIsRevealed(true)}
                                    className="w-full py-4 bg-amber-400 text-amber-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <Icons.Hash size={16} /> AVSLÖJA x
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MAIN GRID (RIGHT) - DETECTIVE WORKSPACE */}
                <div className="flex-1 p-6 bg-white overflow-hidden flex flex-col gap-6">
                    <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-[2rem] border border-indigo-100/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Icons.More size={24} className="rotate-90" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Misstänkta Tal</h4>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Stryk över tal som inte stämmer</p>
                            </div>
                        </div>
                        <button onClick={resetAgentGame} className="p-3 bg-white text-slate-300 hover:text-red-500 hover:shadow-md rounded-2xl transition-all border border-slate-100 active:scale-90"><Icons.Reset size={20}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pb-10">
                            {Array.from({length: 100}).map((_, i) => {
                                const n = i + 1;
                                const isEliminated = eliminatedNumbers.has(n);
                                const isMatch = isRevealed && n === secretX;
                                return (
                                    <button 
                                        key={n}
                                        onClick={() => toggleElimination(n)}
                                        className={`
                                            aspect-square rounded-xl font-mono font-black text-sm transition-all border-2
                                            ${isMatch ? 'bg-amber-400 border-amber-600 text-indigo-950 scale-125 shadow-2xl z-20 animate-bounce ring-4 ring-amber-100' : 
                                              isEliminated ? 'bg-slate-50 border-slate-100 text-slate-200 line-through opacity-20 grayscale scale-90' : 
                                              'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-lg hover:scale-105'}
                                        `}
                                    >
                                        {n}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Visual Feedback Footer */}
                    <div className="shrink-0 p-5 bg-indigo-950 rounded-[2.5rem] flex items-center justify-between shadow-2xl border-4 border-indigo-900">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-amber-400 shadow-inner">
                                <Icons.Lightbulb size={24} fill="currentColor" className="opacity-50" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Kvar på listan</span>
                                <span className="text-2xl font-black text-white tabular-nums">{100 - eliminatedNumbers.size} <span className="text-[10px] font-bold opacity-30 uppercase">st</span></span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-indigo-800 mx-2" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest text-right">Samlade bevis</span>
                            <div className="flex items-center gap-2">
                                 <Icons.Zap size={14} className="text-amber-400" />
                                 <span className="text-2xl font-black text-white tabular-nums">{clues.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CASE SOLVED OVERLAY */}
                {isRevealed && (
                    <div className="absolute inset-0 z-[200] bg-indigo-950/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-700">
                        <div className="w-24 h-24 bg-amber-400 text-indigo-950 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                            <Icons.Trophy size={48} />
                        </div>
                        <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">Agenten Avslöjad!</h2>
                        <p className="text-amber-400 text-xl font-bold italic mb-10">"Det hemliga talet x var {secretX}."</p>
                        
                        <div className="grid grid-cols-2 gap-6 w-full max-w-sm mb-12 text-white">
                            <div className="bg-indigo-900/50 p-6 rounded-3xl border border-indigo-800">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Ledtrådar</div>
                                <div className="text-4xl font-black">{clues.length}</div>
                            </div>
                            <div className="bg-indigo-900/50 p-6 rounded-3xl border border-indigo-800">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-4xl font-black">{100 - eliminatedNumbers.size === 1 ? 'Exakt' : 'Fler kvar'}</div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={resetAgentGame}
                            className="px-10 py-5 bg-white text-indigo-900 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Icons.Reset size={20} /> NYTT UPPDRAG
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      <style>{`
        .scale-item:hover { transform: scale(1.1) translateY(-2px); z-index: 50; }
        .scale-item:active { transform: scale(0.95); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
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
        <button onClick={onClick} className={`rounded-md font-black text-[8px] py-1 shadow-sm active:scale-95 transition-all flex items-center justify-center border border-white/5 ${colors[color]}`}>
            {label}
        </button>
    );
};

const ScalePan = ({ side, mass, otherMass, x, c, mode, onObjectClick }: { side: Side, mass: number, otherMass: number, x: number, c: number, mode: Representation, onObjectClick: (t: 'X' | 'CONST') => void }) => {
    const tilt = Math.max(-15, Math.min(15, (side === 'VL' ? mass - otherMass : otherMass - mass) * 1.5));
    return (
        <div className="absolute -top-[160px] w-[44%] h-[160px] flex flex-col justify-end items-center origin-top transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) z-40" style={{ [side === 'VL' ? 'left' : 'right']: '12px', transform: `rotate(${-tilt}deg)` }}>
            <div className="flex-1 flex flex-wrap justify-center content-end gap-1 p-2 w-full max-h-[140px] overflow-visible pb-1.5">
                {Array.from({ length: Math.abs(x) }).map((_, i) => (
                    <div key={`x-${i}`} onClick={() => onObjectClick('X')} className="scale-item cursor-pointer transition-all duration-300">
                        {mode === 'BLOCKS' ? (
                            <div className="w-8 h-8 bg-blue-500 border-b-2 border-r-2 border-blue-700 rounded-lg flex items-center justify-center text-white font-black text-sm">{x > 0 ? 'x' : '-x'}</div>
                        ) : (
                            <div className="relative w-12 h-6 bg-[#8B5E3C] border border-[#5D3A1A] rounded shadow-sm overflow-hidden"><div className="absolute inset-0.5 bg-[#D2B48C] rounded-sm flex items-center justify-center"><div className="px-1 py-0 bg-blue-600 text-white font-black text-[7px] rounded-sm">{x > 0 ? 'x' : '-x'}</div></div></div>
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
