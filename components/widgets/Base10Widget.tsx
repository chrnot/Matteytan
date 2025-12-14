import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface Base10WidgetProps {
  isTransparent?: boolean;
}

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export const Base10Widget: React.FC<Base10WidgetProps> = ({ isTransparent }) => {
  const [hundreds, setHundreds] = useState<string[]>([]);
  const [tens, setTens] = useState<string[]>([]);
  const [ones, setOnes] = useState<string[]>([]);
  
  // The numeric value displayed in the input
  const totalValue = hundreds.length * 100 + tens.length * 10 + ones.length;
  const [inputValue, setInputValue] = useState(totalValue.toString());

  // Sync input value when blocks change
  useEffect(() => {
    setInputValue(totalValue.toString());
  }, [hundreds.length, tens.length, ones.length]);

  // Handle direct number input
  const handleInputChange = (val: string) => {
      setInputValue(val);
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 999) {
          const h = Math.floor(num / 100);
          const t = Math.floor((num % 100) / 10);
          const o = num % 10;

          setHundreds(Array(h).fill('').map(generateId));
          setTens(Array(t).fill('').map(generateId));
          setOnes(Array(o).fill('').map(generateId));
      } else if (val === '') {
          setHundreds([]);
          setTens([]);
          setOnes([]);
      }
  };

  // --- ACTIONS ---

  const addBlock = (type: 'ONES' | 'TENS' | 'HUNDREDS') => {
      if (type === 'ONES' && ones.length < 50) setOnes(prev => [...prev, generateId()]);
      if (type === 'TENS' && tens.length < 50) setTens(prev => [...prev, generateId()]);
      if (type === 'HUNDREDS' && hundreds.length < 9) setHundreds(prev => [...prev, generateId()]);
  };

  const removeBlock = (type: 'ONES' | 'TENS' | 'HUNDREDS', id: string) => {
      if (type === 'ONES') setOnes(prev => prev.filter(item => item !== id));
      if (type === 'TENS') setTens(prev => prev.filter(item => item !== id));
      if (type === 'HUNDREDS') setHundreds(prev => prev.filter(item => item !== id));
  };

  const clearAll = () => {
      setHundreds([]);
      setTens([]);
      setOnes([]);
  };

  // --- REGROUPING (VÄXLING) ---

  // 10 Ones -> 1 Ten (Addition / Carrying)
  const groupOnesToTen = () => {
      if (ones.length < 10) return;
      setOnes(prev => prev.slice(10)); // Remove first 10 (fifo)
      addBlock('TENS');
  };

  // 10 Tens -> 1 Hundred (Addition / Carrying)
  const groupTensToHundred = () => {
      if (tens.length < 10) return;
      setTens(prev => prev.slice(10)); // Remove first 10
      addBlock('HUNDREDS');
  };

  // 1 Ten -> 10 Ones (Subtraction / Borrowing)
  const breakTenToOnes = (id: string) => {
      setTens(prev => prev.filter(item => item !== id)); // Remove specific ten
      // Add 10 ones
      const newOnes = Array(10).fill('').map(generateId);
      setOnes(prev => [...prev, ...newOnes]);
  };

  // 1 Hundred -> 10 Tens (Subtraction / Borrowing)
  const breakHundredToTens = (id: string) => {
      setHundreds(prev => prev.filter(item => item !== id));
      const newTens = Array(10).fill('').map(generateId);
      setTens(prev => [...prev, ...newTens]);
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none max-w-5xl">
        
        {/* HEADER: INPUT & TOTAL */}
        <div className="flex justify-center items-center mb-2 gap-4">
             <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                 <span className="text-slate-400 font-bold uppercase text-xs tracking-wider hidden sm:inline">Talets värde:</span>
                 <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-3xl sm:text-5xl font-black text-slate-800 w-24 sm:w-40 text-center outline-none border-b-2 border-transparent focus:border-blue-500 bg-transparent"
                    placeholder="0"
                 />
             </div>
             <button 
                onClick={clearAll}
                className="bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 p-3 sm:p-4 rounded-xl transition-colors"
                title="Rensa allt"
             >
                 <Icons.Trash size={24} />
             </button>
        </div>

        {/* WORKSPACE MAT - Stack columns on mobile, row on tablet+ */}
        <div className="flex flex-col md:flex-row gap-4 h-[600px] md:h-[450px]">
            
            {/* --- HUNDREDS COLUMN --- */}
            <div className="flex-1 flex flex-col gap-2 min-h-[150px]">
                <div className="bg-red-100 text-red-800 p-2 rounded-t-xl text-center font-bold uppercase tracking-wider text-sm border-b-4 border-red-200">
                    Hundratal (100)
                </div>
                
                <div className="flex-1 bg-slate-50/50 border-2 border-slate-200 rounded-b-xl p-4 overflow-y-auto relative min-h-0">
                    <div className="flex flex-wrap content-start gap-2 justify-center pb-16">
                        {hundreds.map((id) => (
                            <div 
                                key={id}
                                onClick={() => breakHundredToTens(id)}
                                className="w-16 h-16 sm:w-24 sm:h-24 bg-red-500 border-2 border-red-600 shadow-md rounded-sm cursor-pointer hover:bg-red-400 hover:scale-105 transition-all grid grid-cols-10 grid-rows-10 gap-[1px] group relative overflow-hidden"
                                title="Klicka för att växla till 10 tiotal"
                            >
                                {/* Grid texture */}
                                {Array.from({length:100}).map((_, i) => <div key={i} className="bg-red-700/20 pointer-events-none"></div>)}
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none">
                                    <Icons.Minimize size={24} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => addBlock('HUNDREDS')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 sm:py-3 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <Icons.Plus size={18} /> <span className="hidden sm:inline">Lägg till</span> 100
                </button>
            </div>

            {/* --- TENS COLUMN --- */}
            <div className={`flex-1 flex flex-col gap-2 relative transition-all duration-300 min-h-[150px] ${tens.length >= 10 ? 'ring-4 ring-blue-300 rounded-xl' : ''}`}>
                <div className="bg-blue-100 text-blue-800 p-2 rounded-t-xl text-center font-bold uppercase tracking-wider text-sm border-b-4 border-blue-200 flex justify-between items-center px-4">
                    <span>Tiotal (10)</span>
                </div>

                <div className="flex-1 bg-slate-50/50 border-2 border-slate-200 rounded-b-xl p-4 overflow-y-auto relative min-h-0">
                    <div className="flex flex-wrap content-start gap-3 justify-center pb-20">
                        {tens.map((id) => (
                            <div 
                                key={id}
                                onClick={() => breakTenToOnes(id)}
                                className="w-4 h-16 sm:w-6 sm:h-24 bg-blue-500 border-2 border-blue-600 shadow-md rounded-sm cursor-pointer hover:bg-blue-400 hover:scale-105 transition-all flex flex-col gap-[1px] p-[1px] group relative"
                                title="Klicka för att växla till 10 ental"
                            >
                                {/* Segments */}
                                {Array.from({length:10}).map((_, i) => <div key={i} className="flex-1 w-full bg-blue-700/20 pointer-events-none"></div>)}

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none">
                                    <Icons.Minimize size={16} className="text-white drop-shadow-md rotate-90" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BIG REGROUP BUTTON OVERLAY */}
                    {tens.length >= 10 && (
                        <div className="absolute bottom-4 left-0 w-full flex justify-center z-10 px-4">
                            <button 
                                onClick={groupTensToHundred}
                                className="w-full py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-bold shadow-xl animate-bounce hover:bg-blue-700 flex items-center justify-center gap-2 text-xs sm:text-base"
                            >
                                <Icons.Rotate size={20} /> VÄXLA TILL 100
                            </button>
                        </div>
                    )}
                </div>

                 <button 
                    onClick={() => addBlock('TENS')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <Icons.Plus size={18} /> <span className="hidden sm:inline">Lägg till</span> 10
                </button>
            </div>

            {/* --- ONES COLUMN --- */}
            <div className={`flex-1 flex flex-col gap-2 relative transition-all duration-300 min-h-[150px] ${ones.length >= 10 ? 'ring-4 ring-green-300 rounded-xl' : ''}`}>
                <div className="bg-green-100 text-green-800 p-2 rounded-t-xl text-center font-bold uppercase tracking-wider text-sm border-b-4 border-green-200 flex justify-between items-center px-4">
                    <span>Ental (1)</span>
                </div>

                <div className="flex-1 bg-slate-50/50 border-2 border-slate-200 rounded-b-xl p-4 overflow-y-auto relative min-h-0">
                     <div className="flex flex-wrap content-start gap-2 justify-center pb-20">
                        {ones.map((id) => (
                            <div 
                                key={id}
                                onClick={(e) => {e.stopPropagation(); removeBlock('ONES', id);}}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 border-2 border-green-600 shadow-sm rounded-sm cursor-pointer hover:bg-red-500 hover:border-red-600 transition-colors flex items-center justify-center group"
                                title="Klicka för att ta bort"
                            >
                                <Icons.Close size={12} className="text-white opacity-0 group-hover:opacity-100 pointer-events-none" />
                            </div>
                        ))}
                     </div>

                    {/* BIG REGROUP BUTTON OVERLAY */}
                    {ones.length >= 10 && (
                        <div className="absolute bottom-4 left-0 w-full flex justify-center z-10 px-4">
                            <button 
                                onClick={groupOnesToTen}
                                className="w-full py-2 sm:py-3 bg-green-600 text-white rounded-lg font-bold shadow-xl animate-bounce hover:bg-green-700 flex items-center justify-center gap-2 text-xs sm:text-base"
                            >
                                <Icons.Rotate size={20} /> VÄXLA TILL 10
                            </button>
                        </div>
                    )}
                </div>

                 <button 
                    onClick={() => addBlock('ONES')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <Icons.Plus size={18} /> <span className="hidden sm:inline">Lägg till</span> 1
                </button>
            </div>
        </div>
    </div>
  );
};