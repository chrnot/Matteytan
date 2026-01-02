
import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

type Mode = 'DICE' | 'NUMBER' | 'COIN';
type NumberRange = 9 | 99 | 999;

interface HistoryItem {
    type: Mode;
    value: string | number;
    detail?: string;
}

interface ChanceGeneratorWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const ChanceGeneratorWidget: React.FC<ChanceGeneratorWidgetProps> = ({ isTransparent, setTransparent }) => {
    const [mode, setMode] = useState<Mode>('DICE');
    const [numRange, setNumRange] = useState<NumberRange>(9);
    
    const [result, setResult] = useState<number>(1);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayNum, setDisplayNum] = useState<number>(1);
    const [coinSide, setCoinSide] = useState<'KRONA' | 'KLAVE'>('KRONA');

    const addHistory = (type: Mode, value: string | number, detail?: string) => {
        setHistory(prev => [{ type, value, detail }, ...prev].slice(0, 10));
    };

    const generate = (e?: React.MouseEvent) => {
        if (isAnimating) return;
        if (e) e.stopPropagation();
        
        setIsAnimating(true);

        if (mode === 'DICE') {
            const finalResult = Math.floor(Math.random() * 6) + 1;
            setTimeout(() => {
                setResult(finalResult);
                addHistory('DICE', finalResult, 'T6');
                setIsAnimating(false);
            }, 1200);
        } else if (mode === 'NUMBER') {
            let count = 0;
            const interval = setInterval(() => {
                setDisplayNum(Math.floor(Math.random() * numRange) + 1);
                count++;
                if (count > 15) {
                    clearInterval(interval);
                    const final = Math.floor(Math.random() * numRange) + 1;
                    setDisplayNum(final);
                    addHistory('NUMBER', final, `1-${numRange}`);
                    setIsAnimating(false);
                }
            }, 60);
        } else if (mode === 'COIN') {
            const isHeads = Math.random() > 0.5;
            const finalLabel = isHeads ? 'Krona' : 'Klave';
            setTimeout(() => {
                setCoinSide(isHeads ? 'KRONA' : 'KLAVE');
                addHistory('COIN', finalLabel);
                setIsAnimating(false);
            }, 1000);
        }
    };

    const reset = () => {
        setHistory([]);
        setIsAnimating(false);
    };

    const DiceFace6 = ({ n }: { n: number }) => {
        const dots = (num: number) => {
            const pos = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
            return pos[num] || [];
        };
        return (
            <div className={`dice-face face-${n} absolute w-20 h-20 bg-white border border-slate-200 rounded-xl shadow-inner flex items-center justify-center`}>
                <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-14 h-14 pointer-events-none">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                            {dots(n).includes(i) && <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-sm"></div>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-white select-none overflow-hidden font-sans">
            
            {/* 1. Header: Mode Switcher */}
            <div className="p-3 pb-0">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 shadow-sm">
                    <button 
                        onClick={() => { setMode('DICE'); setIsAnimating(false); }} 
                        className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${mode === 'DICE' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Icons.Dice size={18} />
                        <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Tärning</span>
                    </button>
                    <button 
                        onClick={() => { setMode('NUMBER'); setIsAnimating(false); }} 
                        className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${mode === 'NUMBER' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Icons.Hash size={18} />
                        <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Siffra</span>
                    </button>
                    <button 
                        onClick={() => { setMode('COIN'); setIsAnimating(false); }} 
                        className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${mode === 'COIN' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Icons.Coins size={18} />
                        <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Mynt</span>
                    </button>
                </div>
            </div>

            {/* 2. Sub-controls (Range selector) */}
            <div className="h-10 flex items-center justify-center shrink-0 px-3">
                {mode === 'NUMBER' ? (
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full border border-slate-200 animate-in fade-in zoom-in duration-300">
                        {[9, 99, 999].map((r) => (
                            <button 
                                key={r} 
                                onClick={() => { setNumRange(r as NumberRange); setIsAnimating(false); }} 
                                className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all ${numRange === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                1-{r}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-px bg-slate-50"></div>
                )}
            </div>

            {/* 3. Main Stage: Interaction Area */}
            <div 
                className="flex-1 min-h-0 flex flex-col items-center justify-center cursor-pointer group relative mx-3 rounded-3xl border-2 border-dashed border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition-all duration-300" 
                onClick={() => generate()}
            >
                <div className="flex-1 flex items-center justify-center w-full">
                    {mode === 'DICE' && (
                        <div className="relative group/dice scale-110">
                            <div 
                                className={`dice-container transition-transform duration-300 ${isAnimating ? 'scale-110' : 'group-hover/dice:scale-105'}`} 
                                style={{ perspective: '600px' }}
                            >
                                <div className={`dice-cube ${isAnimating ? 'dice-rolling' : ''}`} style={{ transform: isAnimating ? undefined : getRotation6(result) }}>
                                    <DiceFace6 n={1} /><DiceFace6 n={6} /><DiceFace6 n={2} /><DiceFace6 n={5} /><DiceFace6 n={3} /><DiceFace6 n={4} />
                                </div>
                            </div>
                            <div className={`mx-auto w-12 h-2 bg-slate-900/10 rounded-[100%] blur-sm transition-all duration-300 mt-8 ${isAnimating ? 'opacity-20 scale-150' : 'opacity-40 scale-100'}`}></div>
                        </div>
                    )}

                    {mode === 'NUMBER' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] shadow-xl flex items-center justify-center border-4 border-blue-600 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600/10"></div>
                                <span className={`text-6xl font-black font-mono transition-all ${isAnimating ? 'text-blue-500 scale-110 blur-[1px]' : 'text-slate-800'}`}>
                                    {isAnimating ? displayNum : (history.find(h => h.type === 'NUMBER')?.value ?? '?')}
                                </span>
                            </div>
                        </div>
                    )}

                    {mode === 'COIN' && (
                        <div className={`relative transition-all ${isAnimating ? 'animate-coin-flip' : 'group-hover:scale-105'}`}>
                            <div className={`w-32 h-32 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-300 to-amber-600 shadow-2xl flex flex-col items-center justify-center transition-all duration-500 ${isAnimating ? 'rotate-y-[1800deg]' : ''}`}>
                                <div className="text-white drop-shadow-md">
                                    {(coinSide === 'KRONA' && !isAnimating) ? <Icons.Crown size={64} /> : 
                                     (coinSide === 'KLAVE' && !isAnimating) ? <Icons.Shuffle size={64} /> : 
                                     <Icons.Coins size={64} className="opacity-30" />}
                                </div>
                            </div>
                            <div className={`mx-auto w-16 h-2 bg-amber-900/20 rounded-[100%] blur-sm transition-all duration-300 mt-6 ${isAnimating ? 'opacity-10 scale-150 blur-md' : 'opacity-40 scale-100'}`}></div>
                        </div>
                    )}
                </div>

                {/* Instruction Label */}
                <div className="pb-6 w-full flex justify-center shrink-0">
                    <div className={`px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm transition-all ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 animate-pulse'}`}>
                        {isAnimating ? 'Genererar...' : 'Klicka för slump'}
                    </div>
                </div>
            </div>

            {/* 4. Footer: History Section */}
            <div className="p-4 pt-2 shrink-0 bg-white">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-inner">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Icons.Book size={12} className="opacity-50" />
                            Historik
                        </span>
                        <button 
                            onClick={reset} 
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            title="Rensa"
                        >
                            <Icons.Trash size={14}/>
                        </button>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar min-h-[44px]">
                        {history.length === 0 ? (
                            <div className="w-full text-center text-[10px] text-slate-300 italic py-2">Inga resultat ännu...</div>
                        ) : (
                            history.map((item, i) => (
                                <div key={i} className="flex flex-col items-center shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                                        <div className="text-blue-500 opacity-60">
                                            {item.type === 'DICE' && <Icons.Dice size={12} />}
                                            {item.type === 'NUMBER' && <Icons.Hash size={12} />}
                                            {item.type === 'COIN' && <Icons.Coins size={12} />}
                                        </div>
                                        <span className="text-sm font-black text-slate-700 whitespace-nowrap">
                                            {item.value === 'Krona' ? 'K' : item.value === 'Klave' ? 'V' : item.value}
                                        </span>
                                    </div>
                                    <span className="text-[7px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{item.detail || item.type}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Bottom Status Bar */}
                <div className="mt-2 text-center">
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest opacity-60">
                        Resultaten sparas så länge widgeten är öppen
                    </p>
                </div>
            </div>

            <style>{`
                .dice-container { width: 80px; height: 80px; }
                .dice-cube {
                    width: 100%; height: 100%; position: relative; transform-style: preserve-3d;
                    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .dice-face { width: 80px; height: 80px; backface-visibility: hidden; }
                .face-1 { transform: rotateY(0deg) translateZ(40px); }
                .face-6 { transform: rotateY(180deg) translateZ(40px); }
                .face-2 { transform: rotateX(-90deg) translateZ(40px); }
                .face-5 { transform: rotateX(90deg) translateZ(40px); }
                .face-3 { transform: rotateY(90deg) translateZ(40px); }
                .face-4 { transform: rotateY(-90deg) translateZ(40px); }
                .dice-rolling { animation: rolling 0.6s linear infinite; }
                @keyframes rolling {
                    0% { transform: rotateX(0deg) rotateY(0deg) translateY(0); }
                    25% { transform: rotateX(90deg) rotateY(45deg) translateY(-20px); }
                    50% { transform: rotateX(180deg) rotateY(90deg) translateY(0); }
                    75% { transform: rotateX(270deg) rotateY(135deg) translateY(-10px); }
                    100% { transform: rotateX(360deg) rotateY(180deg) translateY(0); }
                }
                @keyframes coin-flip {
                    0% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-60px) scale(1.2); }
                    100% { transform: translateY(0) scale(1); }
                }
                .animate-coin-flip {
                    animation: coin-flip 1s ease-in-out;
                }
            `}</style>
        </div>
    );
};

function getRotation6(val: number) {
    switch(val) {
        case 1: return 'rotateX(0deg) rotateY(0deg)';
        case 2: return 'rotateX(90deg) rotateY(0deg)';
        case 3: return 'rotateX(0deg) rotateY(-90deg)';
        case 4: return 'rotateX(0deg) rotateY(90deg)';
        case 5: return 'rotateX(-90deg) rotateY(0deg)';
        case 6: return 'rotateX(180deg) rotateY(0deg)';
        default: return 'rotateX(0deg) rotateY(0deg)';
    }
}
