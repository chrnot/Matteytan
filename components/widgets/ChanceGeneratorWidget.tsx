
import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

type Mode = 'DICE' | 'NUMBER' | 'COIN';

interface HistoryItem {
    type: Mode;
    value: string | number;
}

interface ChanceGeneratorWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const ChanceGeneratorWidget: React.FC<ChanceGeneratorWidgetProps> = ({ isTransparent, setTransparent }) => {
    const [mode, setMode] = useState<Mode>('DICE');
    const [result, setResult] = useState<number>(1);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [coinFlipping, setCoinFlipping] = useState(false);
    const [displayNum, setDisplayNum] = useState<number>(1);

    const addHistory = (type: Mode, value: string | number) => {
        setHistory(prev => [{ type, value }, ...prev].slice(0, 5));
    };

    // Rotation values for each dice face
    const getRotation = (val: number) => {
        switch(val) {
            case 1: return 'rotateX(0deg) rotateY(0deg)';
            case 2: return 'rotateX(90deg) rotateY(0deg)';
            case 3: return 'rotateX(0deg) rotateY(-90deg)';
            case 4: return 'rotateX(0deg) rotateY(90deg)';
            case 5: return 'rotateX(-90deg) rotateY(0deg)';
            case 6: return 'rotateX(180deg) rotateY(0deg)';
            default: return 'rotateX(0deg) rotateY(0deg)';
        }
    };

    const generate = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        if (mode === 'DICE') {
            const next = Math.floor(Math.random() * 6) + 1;
            setTimeout(() => {
                setResult(next);
                addHistory('DICE', next);
                setIsAnimating(false);
            }, 1000);
        } else if (mode === 'NUMBER') {
            let count = 0;
            const interval = setInterval(() => {
                setDisplayNum(Math.floor(Math.random() * 9) + 1);
                count++;
                if (count > 15) {
                    clearInterval(interval);
                    const final = Math.floor(Math.random() * 9) + 1;
                    setDisplayNum(final);
                    addHistory('NUMBER', final);
                    setIsAnimating(false);
                }
            }, 60);
        } else if (mode === 'COIN') {
            setCoinFlipping(true);
            const isHeads = Math.random() > 0.5;
            const finalLabel = isHeads ? 'Krona' : 'Klave';
            setTimeout(() => {
                addHistory('COIN', finalLabel);
                setResult(isHeads ? 1 : 2); 
                setIsAnimating(false);
                setCoinFlipping(false);
            }, 1000);
        }
    };

    const reset = () => {
        setResult(1);
        setHistory([]);
        setIsAnimating(false);
    };

    // Render Dice Faces helper
    const DiceFace = ({ n }: { n: number }) => {
        const dots = (num: number) => {
            const pos = [
                [], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]
            ];
            return pos[num] || [];
        };

        return (
            <div className={`dice-face face-${n} absolute w-20 h-20 bg-white border border-slate-200 rounded-xl shadow-inner flex items-center justify-center`}>
                <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-14 h-14">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                            {dots(n).includes(i) && (
                                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-sm"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-white select-none overflow-hidden">
            
            {/* Header Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mx-3 mt-3 border border-slate-200 shrink-0">
                <button 
                    onClick={() => { setMode('DICE'); setIsAnimating(false); }} 
                    className={`flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all ${mode === 'DICE' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Icons.Dice size={18} />
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Tärning</span>
                </button>
                <button 
                    onClick={() => { setMode('NUMBER'); setIsAnimating(false); }} 
                    className={`flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all ${mode === 'NUMBER' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Icons.Hash size={18} />
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Siffra</span>
                </button>
                <button 
                    onClick={() => { setMode('COIN'); setIsAnimating(false); }} 
                    className={`flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all ${mode === 'COIN' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Icons.Coins size={18} />
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Mynt</span>
                </button>
            </div>

            {/* Main Action Area */}
            <div 
                className="flex-1 flex items-center justify-center cursor-pointer group relative active:scale-95 transition-transform overflow-hidden"
                onClick={generate}
            >
                <div className="absolute inset-0 bg-slate-50/50 group-hover:bg-slate-50 transition-colors"></div>

                {/* DICE MODE - 3D CUBE */}
                {mode === 'DICE' && (
                    <div className="dice-container z-10 animate-in zoom-in duration-300">
                        <div 
                            className={`dice-cube ${isAnimating ? 'dice-rolling' : ''}`}
                            style={{ 
                                transform: isAnimating ? undefined : getRotation(result)
                            }}
                        >
                            <DiceFace n={1} />
                            <DiceFace n={6} />
                            <DiceFace n={2} />
                            <DiceFace n={5} />
                            <DiceFace n={3} />
                            <DiceFace n={4} />
                        </div>
                    </div>
                )}

                {/* NUMBER MODE */}
                {mode === 'NUMBER' && (
                    <div className="z-10 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="w-32 h-32 bg-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-white">
                            <span className="text-6xl font-black text-white drop-shadow-lg font-mono">
                                {isAnimating ? displayNum : history[0]?.type === 'NUMBER' ? history[0].value : '?'}
                            </span>
                        </div>
                    </div>
                )}

                {/* COIN MODE */}
                {mode === 'COIN' && (
                    <div className={`z-10 relative transition-all duration-1000 ${coinFlipping ? 'animate-bounce' : ''}`}>
                         <div 
                            className={`w-28 h-28 rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl flex flex-col items-center justify-center transition-transform duration-700 ${coinFlipping ? 'rotate-y-[720deg]' : ''}`}
                         >
                            <div className="absolute inset-2 rounded-full border border-amber-200/50 flex flex-col items-center justify-center">
                                {(!isAnimating && history[0]?.value === 'Krona') ? (
                                    <>
                                        <div className="text-white drop-shadow-md"><Icons.Crown size={32} /></div>
                                        <span className="text-[8px] font-black text-amber-900 mt-0.5 uppercase">Krona</span>
                                    </>
                                ) : (!isAnimating && history[0]?.value === 'Klave') ? (
                                    <>
                                        <div className="text-white drop-shadow-md"><Icons.Shuffle size={32} /></div>
                                        <span className="text-[8px] font-black text-amber-900 mt-0.5 uppercase">Klave</span>
                                    </>
                                ) : (
                                    <Icons.Coins size={32} className="text-white/40" />
                                )}
                            </div>
                         </div>
                         <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/10 rounded-full blur-md transition-all duration-1000 ${coinFlipping ? 'scale-50 opacity-20' : 'scale-100 opacity-50'}`}></div>
                    </div>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity">
                    {isAnimating ? 'Genererar...' : 'Klicka för slump'}
                </div>
            </div>

            {/* History Section */}
            <div className="px-3 pb-3 shrink-0">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Senaste</span>
                        <button onClick={reset} className="text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash size={10}/></button>
                    </div>
                    <div className="flex gap-1.5">
                        {history.length === 0 ? (
                            <span className="text-[9px] text-slate-300 italic">Ingen historik...</span>
                        ) : (
                            history.map((item, i) => (
                                <div key={i} className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg shadow-sm animate-in fade-in slide-in-from-left-2">
                                    {item.type === 'DICE' && <Icons.Dice size={10} className="text-slate-400" />}
                                    {item.type === 'NUMBER' && <Icons.Hash size={10} className="text-slate-400" />}
                                    {item.type === 'COIN' && <Icons.Coins size={10} className="text-slate-400" />}
                                    <span className="text-[10px] font-black text-slate-700">
                                        {item.value === 'Krona' ? 'K' : item.value === 'Klave' ? 'V' : item.value}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .dice-container {
                    perspective: 600px;
                    width: 80px;
                    height: 80px;
                }
                .dice-cube {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .dice-face {
                    width: 80px;
                    height: 80px;
                    backface-visibility: hidden;
                }
                .face-1 { transform: rotateY(0deg) translateZ(40px); }
                .face-6 { transform: rotateY(180deg) translateZ(40px); }
                .face-2 { transform: rotateX(-90deg) translateZ(40px); }
                .face-5 { transform: rotateX(90deg) translateZ(40px); }
                .face-3 { transform: rotateY(90deg) translateZ(40px); }
                .face-4 { transform: rotateY(-90deg) translateZ(40px); }

                .dice-rolling {
                    animation: rolling 1s linear infinite;
                }

                @keyframes rolling {
                    0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
                }
            `}</style>
        </div>
    );
};
