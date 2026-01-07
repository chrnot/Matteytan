
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
  const [pixelArt, setPixelArt] = useState<boolean[]>(new Array(15).fill(false));
  const [showHint, setShowHint] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [problematicFactors, setProblematicFactors] = useState<Question[]>([]);

  // --- LOGIC ---
  const generateQuestion = useCallback(() => {
    if (selectedTables.length === 0) return;
    
    // 30% chance to repeat a problematic question if available
    if (problematicFactors.length > 0 && Math.random() < 0.3) {
      const q = problematicFactors[Math.floor(Math.random() * problematicFactors.length)];
      setCurrentQuestion(q);
    } else {
      const f1 = selectedTables[Math.floor(Math.random() * selectedTables.length)];
      const f2 = Math.floor(Math.random() * 11) + 2; // 2-12 for fun
      setCurrentQuestion({ f1, f2, answer: f1 * f2 });
    }
    
    // Reset interaction state and move to PLAYING
    setGameState('PLAYING');
    setUserAnswer('');
    setShowHint(false);
    setLastCorrect(false);
    if (mode === 'BLITZ') setTimeLeft(10);
  }, [selectedTables, problematicFactors, mode]);

  const startGame = () => {
    if (selectedTables.length === 0) return;
    setCorrectCount(0);
    setStreak(0);
    setPixelArt(new Array(15).fill(false));
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
    if (!currentQuestion) return;
    const isRight = parseInt(userAnswer) === currentQuestion.answer;

    if (isRight) {
      setLastCorrect(true);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      // Update Pixel Art
      const newPixelArt = [...pixelArt];
      const nextIdx = newPixelArt.indexOf(false);
      if (nextIdx !== -1) newPixelArt[nextIdx] = true;
      setPixelArt(newPixelArt);

      // If finished pixel art
      if (nextIdx === 14) {
        setTimeout(() => setGameState('SUMMARY'), 800);
      } else {
        setTimeout(generateQuestion, 500);
      }
    } else {
      setShake(true);
      setStreak(0);
      setProblematicFactors(prev => [...prev, currentQuestion].slice(-10));
      setWrongAnswers(prev => [...prev, currentQuestion]);
      setTimeout(() => setShake(false), 500);
      setGameState('FEEDBACK');
    }
  }, [currentQuestion, userAnswer, pixelArt, generateQuestion]);

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

  useEffect(() => {
    if (gameState === 'PLAYING' && mode === 'BLITZ') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 0) {
            checkAnswer(); // Times up = wrong answer
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

  const getHint = () => {
    if (!currentQuestion) return "";
    const {f1, f2} = currentQuestion;
    if (f2 === 9) return `Tips: Ta ${f1} · 10 och dra bort en ${f1}:a.`;
    if (f2 === 8) return `Tips: Dubbla ${f1} tre gånger.`;
    if (f2 === 4) return `Tips: Vet du vad ${f1} · 2 är? Dubbla det!`;
    if (f2 === 5) return `Tips: Hälften av ${f1} · 10.`;
    return `Tänk på arean av en rektangel med sidorna ${f1} och ${f2}.`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none font-sans">
      
      {/* 1. SETUP MODE */}
      {gameState === 'SETUP' && (
        <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-500">
           <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">MULTI-MATCHEN</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Automatisera tabellerna 1-12</p>
           </div>

           <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
              {Array.from({length: 12}).map((_, i) => {
                const num = i + 1;
                const active = selectedTables.includes(num);
                return (
                  <button 
                    key={num}
                    onClick={() => toggleTable(num)}
                    className={`h-16 rounded-2xl border-4 font-black text-xl transition-all ${active ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {num}:an
                  </button>
                );
              })}
           </div>

           <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <div className="flex-1 flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                  <button onClick={() => setMode('ZEN')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'ZEN' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Zen-Mode</button>
                  <button onClick={() => setMode('BLITZ')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'BLITZ' ? 'bg-white shadow text-rose-500' : 'text-slate-400'}`}>Blitz-Mode</button>
              </div>
              <button 
                onClick={startGame}
                disabled={selectedTables.length === 0}
                className="flex-[1.5] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                <Icons.Zap size={24} className="text-amber-300" />
                STARTA MATCHEN
              </button>
           </div>
        </div>
      )}

      {/* 2. PLAYING MODE */}
      {gameState === 'PLAYING' && currentQuestion && (
        <div className="flex-1 flex flex-col p-4 animate-in zoom-in duration-300 relative">
            {/* Background Pixel Art Tracker */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none p-10">
                <div className="grid grid-cols-5 grid-rows-3 gap-2 w-full h-full">
                    {pixelArt.map((active, i) => (
                        <div key={i} className={`rounded-xl ${active ? 'bg-blue-600' : 'bg-slate-900'}`}></div>
                    ))}
                </div>
            </div>

            {/* Top Bar: Streak & Progress */}
            <div className="flex justify-between items-center mb-4 z-10">
               <div className="flex items-center gap-2">
                   <div className={`p-2 rounded-xl transition-all duration-500 ${streak > 0 ? 'bg-orange-100 text-orange-600 animate-bounce' : 'bg-slate-100 text-slate-300'}`}>
                       <Icons.Flame size={20} fill={streak > 5 ? "currentColor" : "none"} />
                   </div>
                   <span className="font-black text-slate-700">{streak} i rad</span>
               </div>
               <div className="flex gap-1.5">
                   {pixelArt.map((active, i) => (
                       <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${active ? 'bg-emerald-500 scale-125' : 'bg-slate-200'}`} />
                   ))}
               </div>
            </div>

            {/* The Question */}
            <div className={`flex-1 flex flex-col items-center justify-center z-10 transition-transform ${shake ? 'animate-shake' : ''}`}>
               {mode === 'BLITZ' && (
                   <div className="w-48 h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                       <div className="h-full bg-rose-500 transition-all duration-100 linear" style={{ width: `${(timeLeft / 10) * 100}%` }}></div>
                   </div>
               )}
               <div className={`text-7xl sm:text-9xl font-black tabular-nums transition-all ${lastCorrect ? 'text-emerald-500 scale-110' : 'text-slate-800'}`}>
                  {currentQuestion.f1} <span className="text-blue-500">·</span> {currentQuestion.f2}
               </div>
               <div className="mt-8 h-20 flex items-center justify-center">
                  <div className={`px-10 py-4 rounded-3xl bg-slate-100 border-4 border-slate-200 text-5xl font-black min-w-[140px] text-center ${userAnswer ? 'text-slate-800' : 'text-slate-300'}`}>
                      {userAnswer || '?'}
                  </div>
               </div>
            </div>

            {/* Tänk-tricket hint button */}
            <button 
                onClick={() => setShowHint(true)}
                className="absolute top-20 right-6 p-3 bg-amber-100 text-amber-600 rounded-2xl hover:bg-amber-200 transition-all z-20 group"
                title="Tänk-tricket"
            >
                <Icons.Lightbulb size={24} className="group-hover:rotate-12 transition-transform" />
            </button>
            {showHint && (
                <div className="absolute top-36 right-6 w-48 bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] font-bold text-amber-800 shadow-lg animate-in slide-in-from-top-2 z-20">
                    {getHint()}
                </div>
            )}

            {/* Large Keypad */}
            <div className="grid grid-cols-4 gap-2 mt-4 z-10">
                {[1,2,3,4,5,6,7,8,9,0].map(n => (
                    <button 
                        key={n} 
                        onClick={() => handleKeypad(n.toString())}
                        className="h-16 sm:h-20 bg-white border-2 border-slate-200 rounded-2xl font-black text-2xl text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                    >
                        {n}
                    </button>
                ))}
                <button onClick={() => handleKeypad('C')} className="h-16 sm:h-20 bg-slate-100 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                    <Icons.Reset size={24} />
                </button>
                <button 
                    onClick={checkAnswer} 
                    disabled={!userAnswer}
                    className="h-16 sm:h-20 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50"
                >
                    KLAR
                </button>
            </div>
        </div>
      )}

      {/* 3. FEEDBACK MODE (The Area Model) */}
      {gameState === 'FEEDBACK' && currentQuestion && (
        <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-500 items-center justify-center gap-6">
            <div className="text-center">
                <h3 className="text-rose-500 font-black text-2xl uppercase tracking-tighter mb-2 italic">Nära! Vi kollar...</h3>
                <p className="text-slate-500 font-bold">{currentQuestion.f1} · {currentQuestion.f2} = <span className="text-emerald-600 text-xl">{currentQuestion.answer}</span></p>
            </div>

            {/* AREA MODEL SVG */}
            <div className="flex-1 w-full max-h-[300px] flex items-center justify-center bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200 p-4">
                <svg viewBox={`0 0 ${currentQuestion.f2 * 30 + 40} ${currentQuestion.f1 * 30 + 40}`} className="max-w-full max-h-full drop-shadow-md">
                    {Array.from({length: currentQuestion.f1}).map((_, r) => (
                        Array.from({length: currentQuestion.f2}).map((_, c) => (
                            <rect 
                                key={`${r}-${c}`}
                                x={c * 30 + 20}
                                y={r * 30 + 20}
                                width="26"
                                height="26"
                                rx="4"
                                fill={c < 5 ? '#3b82f6' : '#22c55e'}
                                className="animate-in zoom-in duration-300"
                                style={{ animationDelay: `${(r * currentQuestion.f2 + c) * 10}ms` }}
                            />
                        ))
                    ))}
                    {/* Labels */}
                    <text x="5" y={(currentQuestion.f1 * 30) / 2 + 25} textAnchor="middle" className="font-black text-sm fill-slate-400 -rotate-90 origin-center" style={{transformBox: 'fill-box'}}>{currentQuestion.f1}</text>
                    <text x={(currentQuestion.f2 * 30) / 2 + 20} y="15" textAnchor="middle" className="font-black text-sm fill-slate-400">{currentQuestion.f2}</text>
                </svg>
            </div>

            <button 
                onClick={generateQuestion}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
                FÖRSÖK IGEN
            </button>
        </div>
      )}

      {/* 4. SUMMARY MODE */}
      {gameState === 'SUMMARY' && (
        <div className="flex-1 flex flex-col p-8 items-center justify-center text-center animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white animate-bounce">
                <Icons.Trophy size={48} />
             </div>
             <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">MATCHEN KLAR!</h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-8">Bra jobbat, du har byggt färdigt bilden!</p>

             <div className="w-full grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Rätt svar</div>
                    <div className="text-3xl font-black text-emerald-600">{correctCount}</div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Missar</div>
                    <div className="text-3xl font-black text-rose-500">{wrongAnswers.length}</div>
                 </div>
             </div>

             {wrongAnswers.length > 0 && (
                 <div className="w-full mb-8 text-left bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 block">Öva extra på:</span>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(wrongAnswers.map(q => q.f1))).map(f => (
                            <span key={f} className="px-3 py-1 bg-white rounded-full font-black text-rose-600 shadow-sm">{f}:an</span>
                        ))}
                    </div>
                 </div>
             )}

             <button 
                onClick={() => setGameState('SETUP')}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-500 transition-all"
             >
                KÖR IGEN
             </button>
        </div>
      )}

      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};
