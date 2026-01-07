
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icons } from '../icons';

interface MultiMatchWidgetProps {
  isTransparent?: boolean;
}

type GameState = 'SETUP' | 'PLAYING' | 'FEEDBACK' | 'SUMMARY';

interface Question {
  f1: number;
  f2: number;
  answer: number;
}

// Pixel Art definition (4x4 grid - 16 questions per round)
const PIXEL_ART_TEMPLATES = [
  [0,1,1,0, 1,1,1,1, 1,1,1,1, 0,1,1,0], // Heart
  [1,0,0,1, 0,1,1,0, 0,1,1,0, 1,0,0,1], // X / Sparkle
  [0,1,1,0, 1,0,0,1, 1,1,1,1, 1,0,0,1], // Letter A-ish / Star
  [1,1,1,1, 1,0,0,1, 1,0,0,1, 1,1,1,1], // Square/Box
];

export const MultiMatchWidget: React.FC<MultiMatchWidgetProps> = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>('SETUP');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [mode, setMode] = useState<'ZEN' | 'BLITZ'>('ZEN');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const [pixelsFilled, setPixelsFilled] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [problematicFactors, setProblematicFactors] = useState<Question[]>([]);
  const [activeTemplate] = useState(() => PIXEL_ART_TEMPLATES[Math.floor(Math.random() * PIXEL_ART_TEMPLATES.length)]);

  const TARGET_PIXELS = 16; // En runda är 16 frågor

  // --- LOGIC ---
  const generateQuestion = useCallback(() => {
    if (selectedTables.length === 0) return;
    
    // 40% chans att repetera ett problematiskt tal
    if (problematicFactors.length > 0 && Math.random() < 0.4) {
      const q = problematicFactors[Math.floor(Math.random() * problematicFactors.length)];
      setCurrentQuestion({ ...q });
    } else {
      const f1 = selectedTables[Math.floor(Math.random() * selectedTables.length)];
      const f2 = Math.floor(Math.random() * 11) + 2; 
      setCurrentQuestion({ f1, f2, answer: f1 * f2 });
    }
    
    setGameState('PLAYING');
    setUserAnswer('');
    setShowHint(false);
    if (mode === 'BLITZ') setTimeLeft(10);
  }, [selectedTables, problematicFactors, mode]);

  const startGame = () => {
    if (selectedTables.length === 0) return;
    setCorrectCount(0);
    setStreak(0);
    setPixelsFilled(0);
    setWrongAnswers([]);
    setGameState('PLAYING');
    generateQuestion();
  };

  const handleKeypad = (val: string) => {
    if (gameState !== 'PLAYING') return;
    if (val === 'C') setUserAnswer('');
    else if (userAnswer.length < 3) setUserAnswer(prev => prev + val);
  };

  const checkAnswer = useCallback(() => {
    if (!currentQuestion || !userAnswer) return;
    const isRight = parseInt(userAnswer) === currentQuestion.answer;

    if (isRight) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      const nextPixels = pixelsFilled + 1;
      setPixelsFilled(nextPixels);

      if (nextPixels >= TARGET_PIXELS) {
        setTimeout(() => setGameState('SUMMARY'), 1000);
      } else {
        setTimeout(generateQuestion, 400);
      }
    } else {
      setShake(true);
      setStreak(0);
      // Spara för sammanfattning och repetition
      setProblematicFactors(prev => [...prev, currentQuestion].slice(-5));
      setWrongAnswers(prev => [...prev, currentQuestion]);
      setTimeout(() => {
          setShake(false);
          setGameState('FEEDBACK');
      }, 400);
    }
  }, [currentQuestion, userAnswer, pixelsFilled, generateQuestion]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'PLAYING') {
        if (e.key >= '0' && e.key <= '9') handleKeypad(e.key);
        if (e.key === 'Backspace') handleKeypad('C');
        if (e.key === 'Enter') checkAnswer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, checkAnswer]);

  // Blitz Timer
  useEffect(() => {
    if (gameState === 'PLAYING' && mode === 'BLITZ') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 0) {
            checkAnswer(); 
            return 0;
          }
          return t - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState, mode, checkAnswer]);

  const toggleTable = (num: number) => {
    setSelectedTables(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  // Streak visuals
  const getStreakColor = () => {
    if (streak >= 15) return 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-125';
    if (streak >= 10) return 'text-orange-500 scale-110';
    if (streak >= 5) return 'text-blue-500';
    return 'text-slate-300';
  };

  const getHint = () => {
    if (!currentQuestion) return "";
    const {f1, f2} = currentQuestion;
    if (f2 === 9) return `Strategi: Ta ${f1} · 10 och dra bort en ${f1}:a.`;
    if (f2 === 8) return `Strategi: Dubbla ${f1} tre gånger!`;
    if (f2 === 5) return `Strategi: Hälften av ${f1} · 10.`;
    return `Tänk på arean: ${f1} rader med ${f2} i varje rad.`;
  };

  return (
    <div className={`w-full h-full flex flex-col bg-white overflow-hidden select-none font-sans transition-all duration-500 ${streak >= 10 ? 'ring-8 ring-orange-100 ring-inset' : ''}`}>
      
      {/* 1. SETUP MODE */}
      {gameState === 'SETUP' && (
        <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-500">
           <div className="text-center mb-6">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">MULTI-MATCHEN</h2>
              <div className="flex justify-center gap-2 mt-2">
                 <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-widest">Träna</span>
                 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase tracking-widest">Automatisera</span>
              </div>
           </div>

           <div className="flex-1 grid grid-cols-4 gap-2 mb-6">
              {Array.from({length: 12}).map((_, i) => {
                const num = i + 1;
                const active = selectedTables.includes(num);
                return (
                  <button 
                    key={num}
                    onClick={() => toggleTable(num)}
                    className={`h-14 rounded-2xl border-4 font-black text-lg transition-all ${active ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {num}
                  </button>
                );
              })}
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                  <button onClick={() => setMode('ZEN')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'ZEN' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Zen (Ingen tid)</button>
                  <button onClick={() => setMode('BLITZ')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'BLITZ' ? 'bg-white shadow text-rose-500' : 'text-slate-400'}`}>Blitz (10 sek)</button>
              </div>
              <button 
                onClick={startGame}
                disabled={selectedTables.length === 0}
                className="py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                <Icons.Zap size={24} className="text-amber-300" />
                STARTA RUNDAN
              </button>
           </div>
        </div>
      )}

      {/* 2. PLAYING MODE */}
      {gameState === 'PLAYING' && currentQuestion && (
        <div className={`flex-1 flex flex-col p-4 animate-in zoom-in duration-300 relative transition-transform ${shake ? 'animate-shake' : ''}`}>
            
            {/* TOP BAR */}
            <div className="flex justify-between items-center z-10 mb-2">
               {/* Streak Area */}
               <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
                   <div className={`transition-all duration-500 ${getStreakColor()}`}>
                       <Icons.Flame size={24} fill={streak >= 5 ? "currentColor" : "none"} />
                   </div>
                   <span className="font-black text-slate-700 tabular-nums">{streak} i rad</span>
               </div>
               
               {/* Mini-Map Pixel Progress (Moved from background) */}
               <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm group">
                   <div className="flex flex-col items-end">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bygget</span>
                       <span className="text-[10px] font-black text-blue-600">{pixelsFilled}/16</span>
                   </div>
                   <div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-8 h-8 p-0.5 bg-slate-50 rounded border border-slate-200">
                       {activeTemplate.map((isPart, i) => (
                           <div 
                             key={i} 
                             className={`rounded-[1px] transition-all duration-300 ${i < pixelsFilled ? (isPart ? 'bg-blue-500' : 'bg-slate-300') : 'bg-slate-100'}`}
                           ></div>
                       ))}
                   </div>
               </div>
            </div>

            {/* QUESTION STAGE - Now clean and high contrast */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
               {mode === 'BLITZ' && (
                   <div className="w-48 h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden shadow-inner">
                       <div className="h-full bg-rose-500 transition-all duration-100 linear" style={{ width: `${(timeLeft / 10) * 100}%` }}></div>
                   </div>
               )}
               
               <div className="flex flex-col items-center gap-2">
                  <div className="text-7xl sm:text-8xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                     <span>{currentQuestion.f1}</span>
                     <span className="text-blue-500 text-5xl">·</span>
                     <span>{currentQuestion.f2}</span>
                  </div>
                  <div className="h-20 flex items-center">
                    <div className="text-5xl font-black text-blue-600 bg-blue-50 px-8 py-3 rounded-3xl border-4 border-blue-100 min-w-[140px] text-center shadow-inner">
                        {userAnswer || '?'}
                    </div>
                  </div>
               </div>

               <button 
                  onClick={() => setShowHint(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-amber-50 text-amber-500 rounded-2xl border border-amber-100 shadow-sm hover:scale-110 transition-all"
               >
                  <Icons.Lightbulb size={24} />
               </button>
               {showHint && (
                  <div className="absolute right-0 top-[60%] w-48 bg-amber-900 text-white p-3 rounded-2xl text-[10px] font-bold shadow-2xl animate-in slide-in-from-right-4 z-50">
                      {getHint()}
                  </div>
               )}
            </div>

            {/* BIG NUMPAD (Fitts's Law) */}
            <div className="grid grid-cols-3 gap-3 z-10 mt-4 max-w-[400px] mx-auto w-full">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button 
                        key={n} 
                        onClick={() => handleKeypad(n.toString())}
                        className="h-16 bg-white border-2 border-slate-200 rounded-2xl font-black text-2xl text-slate-700 hover:bg-slate-50 hover:border-blue-300 active:scale-95 transition-all shadow-sm"
                    >
                        {n}
                    </button>
                ))}
                <button onClick={() => handleKeypad('C')} className="h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                    <Icons.Reset size={24} />
                </button>
                <button onClick={() => handleKeypad('0')} className="h-16 bg-white border-2 border-slate-200 rounded-2xl font-black text-2xl text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
                    0
                </button>
                <button 
                    onClick={checkAnswer} 
                    disabled={!userAnswer}
                    className="h-16 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
                >
                    OK
                </button>
            </div>
        </div>
      )}

      {/* 3. FEEDBACK MODE (Area Model) */}
      {gameState === 'FEEDBACK' && currentQuestion && (
        <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-700 items-center justify-center gap-6">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full font-black text-xs uppercase tracking-widest mb-4 border border-rose-100">
                    <Icons.X size={14} /> Vi kollar arean
                </div>
                <div className="text-4xl font-black text-slate-800">
                   {currentQuestion.f1} · {currentQuestion.f2} = <span className="text-emerald-600">{currentQuestion.answer}</span>
                </div>
            </div>

            <div className="flex-1 w-full max-h-[320px] flex items-center justify-center bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 p-8 shadow-inner overflow-hidden">
                <svg viewBox={`0 0 ${currentQuestion.f2 * 30 + 20} ${currentQuestion.f1 * 30 + 20}`} className="max-w-full max-h-full drop-shadow-xl overflow-visible">
                    {Array.from({length: currentQuestion.f1}).map((_, r) => (
                        Array.from({length: currentQuestion.f2}).map((_, c) => (
                            <rect 
                                key={`${r}-${c}`}
                                x={c * 30 + 10}
                                y={r * 30 + 10}
                                width="26"
                                height="26"
                                rx="6"
                                fill={c % 2 === 0 ? '#3b82f6' : '#60a5fa'}
                                className="animate-in zoom-in duration-500 fill-mode-both"
                                style={{ animationDelay: `${(r * currentQuestion.f2 + c) * 15}ms` }}
                            />
                        ))
                    ))}
                    {/* Labels */}
                    <text x="-15" y={(currentQuestion.f1 * 30) / 2 + 15} textAnchor="middle" className="font-black text-lg fill-slate-400 -rotate-90 origin-center" style={{transformBox: 'fill-box'}}>{currentQuestion.f1}</text>
                    <text x={(currentQuestion.f2 * 30) / 2 + 10} y="-10" textAnchor="middle" className="font-black text-lg fill-slate-400">{currentQuestion.f2}</text>
                </svg>
            </div>

            <button 
                onClick={generateQuestion}
                className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
            >
                FÖRSÖK IGEN
                <Icons.Plus size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
        </div>
      )}

      {/* 4. SUMMARY MODE */}
      {gameState === 'SUMMARY' && (
        <div className="flex-1 flex flex-col p-8 items-center justify-center text-center animate-in zoom-in duration-500 overflow-y-auto">
             <div className="relative mb-6">
                <div className="w-28 h-28 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white animate-bounce">
                    <Icons.Trophy size={56} />
                </div>
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 border-white">
                    16
                </div>
             </div>

             <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">BILDEN ÄR KLAR!</h2>
             
             {/* Show the finished picture large as a reward */}
             <div className="grid grid-cols-4 grid-rows-4 gap-1.5 w-32 h-32 mx-auto mb-6 p-2 bg-slate-50 rounded-2xl shadow-inner border border-slate-200">
                 {activeTemplate.map((isPart, i) => (
                     <div 
                         key={i} 
                         className={`rounded-sm transition-all duration-1000 ${isPart ? 'bg-blue-500 scale-100' : 'bg-slate-200 scale-90'}`}
                         style={{ transitionDelay: `${i * 30}ms` }}
                     ></div>
                 ))}
             </div>

             <div className="w-full grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-emerald-50 p-4 rounded-3xl border-2 border-emerald-100">
                    <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Rätt svar</div>
                    <div className="text-4xl font-black text-emerald-600">{correctCount}</div>
                 </div>
                 <div className="bg-rose-50 p-4 rounded-3xl border-2 border-rose-100">
                    <div className="text-[10px] font-black text-rose-400 uppercase mb-1">Missar</div>
                    <div className="text-4xl font-black text-rose-500">{wrongAnswers.length}</div>
                 </div>
             </div>

             {/* Pedagogisk Sammanfattning */}
             <div className="w-full bg-slate-50 p-6 rounded-[2rem] border border-slate-200 text-left mb-8">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Icons.Book size={14} /> Analys för lärare/elev
                 </h4>
                 
                 {wrongAnswers.length === 0 ? (
                    <p className="text-slate-600 font-bold text-sm leading-relaxed">
                        Strålande! Tabellerna sitter som ett rinnande vatten. Du visar fullständig säkerhet i de valda talområdena.
                    </p>
                 ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-slate-500 text-[11px] font-medium mb-2">Fokusera lite extra på dessa tabeller nästa gång:</p>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(wrongAnswers.map(q => q.f1))).map(f => (
                                    <span key={f} className="px-3 py-1 bg-white border border-rose-200 rounded-full font-black text-rose-600 shadow-sm text-xs">{f}:ans tabell</span>
                                ))}
                            </div>
                        </div>
                        <p className="text-slate-400 text-[10px] italic leading-tight">
                            Tips: Använd "Area-modellen" för att se mönstret i {Array.from(new Set(wrongAnswers.map(q => q.f1))).join(', ')}-ans tabell.
                        </p>
                    </div>
                 )}
             </div>

             <button 
                onClick={() => setGameState('SETUP')}
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
             >
                KÖR EN RUNDA TILL
             </button>
        </div>
      )}

      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};
