import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface NumberHouseWidgetProps {
  isTransparent?: boolean;
}

export const NumberHouseWidget: React.FC<NumberHouseWidgetProps> = ({ isTransparent }) => {
  const [whole, setWhole] = useState(10);
  const [partA, setPartA] = useState(5);
  const [showDots, setShowDots] = useState(false);
  // Initialize with one part hidden randomly
  const [hiddenA, setHiddenA] = useState(() => Math.random() > 0.5);
  const [hiddenB, setHiddenB] = useState(() => !hiddenA);
  const [animate, setAnimate] = useState(false);

  const partB = Math.max(0, whole - partA); // Ensure never negative visually

  const randomize = () => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);
      const newA = Math.floor(Math.random() * (whole + 1));
      setPartA(newA);
      
      // Automatically hide one part for the game mode
      const hideFirst = Math.random() > 0.5;
      setHiddenA(hideFirst);
      setHiddenB(!hideFirst);
  };

  useEffect(() => {
      // Ensure logic holds if whole changes
      if (partA > whole) setPartA(whole);
  }, [whole, partA]);

  const DotGrid = ({ count, color }: { count: number, color: string }) => {
      // Improved scaling logic for better visibility
      let dotSize = 'w-3 h-3';
      let gap = 'gap-1';

      if (count <= 5) {
          dotSize = 'w-8 h-8 sm:w-10 sm:h-10'; // Large
          gap = 'gap-3';
      } else if (count <= 15) {
          dotSize = 'w-5 h-5 sm:w-6 sm:h-6'; // Medium
          gap = 'gap-2';
      } else if (count <= 25) {
          dotSize = 'w-3 h-3 sm:w-4 sm:h-4'; // Small
          gap = 'gap-1.5';
      }

      return (
        <div className={`flex flex-wrap justify-center content-center ${gap} w-full h-full p-4 overflow-hidden`}>
            {Array.from({length: count}).map((_, i) => (
                <div key={i} className={`${dotSize} rounded-full shadow-sm ${color} border border-black/10 transition-all duration-300`}></div>
            ))}
        </div>
      );
  };

  return (
    <div className="w-[350px] flex flex-col gap-4">
        
        {/* Controls */}
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Taket (Hela):</span>
                <input 
                    type="number" 
                    min="1" max="99" 
                    value={whole} 
                    onChange={e => setWhole(Math.max(1, Number(e.target.value)))}
                    className="w-14 text-center font-bold border rounded px-1 py-0.5 bg-white focus:ring-2 ring-blue-200 outline-none transition-shadow"
                />
            </div>
            <button 
                onClick={() => setShowDots(!showDots)} 
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all shadow-sm ${showDots ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
            >
                {showDots ? 'Visa Siffror' : 'Visa Prickar'}
            </button>
        </div>

        {/* The House */}
        <div className="relative w-full aspect-[3/4] max-h-[400px]">
            {/* Roof */}
            <div className="absolute top-0 w-full h-[35%] bg-red-500 rounded-t-full shadow-lg z-10 flex items-center justify-center text-white relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-600/20"></div>
                 <div className="text-7xl font-black drop-shadow-md select-none">{whole}</div>
            </div>

            {/* Base */}
            <div className="absolute bottom-0 w-[90%] left-[5%] h-[70%] bg-amber-50 border-x-4 border-b-4 border-slate-300 shadow-xl flex gap-2 p-3">
                
                {/* Window A */}
                <div className="flex-1 bg-white border-4 border-blue-200 rounded-lg relative overflow-hidden shadow-inner group">
                    <div 
                        className={`absolute inset-0 z-20 bg-slate-700 flex items-center justify-center transition-transform duration-500 cursor-pointer ${hiddenA ? 'translate-y-0' : '-translate-y-full'}`}
                        onClick={() => setHiddenA(false)}
                    >
                         <div className="flex flex-col items-center gap-2">
                             <Icons.Cube size={32} className="text-slate-500 opacity-50"/>
                             <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">?</span>
                         </div>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center select-none">
                        {showDots ? (
                            <DotGrid count={partA} color="bg-blue-500" />
                        ) : (
                            <span className={`text-6xl font-bold text-blue-600 ${animate ? 'scale-110' : ''} transition-transform`}>{partA}</span>
                        )}
                    </div>
                    
                    {/* Hide Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setHiddenA(true); }}
                        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 transition-opacity"
                        title="Göm"
                    >
                        <Icons.Minimize size={14}/>
                    </button>
                </div>

                {/* Divider */}
                <div className="w-1.5 h-full bg-slate-200 rounded-full"></div>

                {/* Window B */}
                <div className="flex-1 bg-white border-4 border-green-200 rounded-lg relative overflow-hidden shadow-inner group">
                    <div 
                        className={`absolute inset-0 z-20 bg-slate-700 flex items-center justify-center transition-transform duration-500 cursor-pointer ${hiddenB ? 'translate-y-0' : '-translate-y-full'}`}
                        onClick={() => setHiddenB(false)}
                    >
                        <div className="flex flex-col items-center gap-2">
                             <Icons.Cube size={32} className="text-slate-500 opacity-50"/>
                             <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">?</span>
                         </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center select-none">
                        {showDots ? (
                            <DotGrid count={partB} color="bg-green-500" />
                        ) : (
                             <span className={`text-6xl font-bold text-green-600 ${animate ? 'scale-110' : ''} transition-transform`}>{partB}</span>
                        )}
                    </div>

                    {/* Hide Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setHiddenB(true); }}
                        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 transition-opacity"
                        title="Göm"
                    >
                        <Icons.Minimize size={14}/>
                    </button>
                </div>
            </div>

            {/* Random Button */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                <button 
                    onClick={randomize} 
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-black text-lg shadow-xl hover:bg-blue-500 active:scale-95 transition-all border-4 border-white hover:border-blue-100"
                >
                    <Icons.Reset size={20} className={animate ? 'animate-spin' : ''} /> 
                    NYTT TAL
                </button>
            </div>
        </div>
    </div>
  );
};