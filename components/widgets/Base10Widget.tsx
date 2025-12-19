import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface Base10WidgetProps {
  isTransparent?: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const Base10Widget: React.FC<Base10WidgetProps> = ({ isTransparent }) => {
  const [hundreds, setHundreds] = useState<string[]>([]);
  const [tens, setTens] = useState<string[]>([]);
  const [ones, setOnes] = useState<string[]>([]);
  
  const totalValue = hundreds.length * 100 + tens.length * 10 + ones.length;
  const [inputValue, setInputValue] = useState(totalValue.toString());

  useEffect(() => {
    setInputValue(totalValue.toString());
  }, [hundreds.length, tens.length, ones.length]);

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

  const groupOnesToTen = () => {
      if (ones.length < 10) return;
      setOnes(prev => prev.slice(10));
      addBlock('TENS');
  };

  const groupTensToHundred = () => {
      if (tens.length < 10) return;
      setTens(prev => prev.slice(10));
      addBlock('HUNDREDS');
  };

  const breakTenToOnes = (id: string) => {
      setTens(prev => prev.filter(item => item !== id));
      const newOnes = Array(10).fill('').map(generateId);
      setOnes(prev => [...prev, ...newOnes]);
  };

  const breakHundredToTens = (id: string) => {
      setHundreds(prev => prev.filter(item => item !== id));
      const newTens = Array(10).fill('').map(generateId);
      setTens(prev => [...prev, ...newTens]);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 select-none">
        
        {/* HEADER: INPUT & TOTAL */}
        <div className="flex justify-center items-center mb-1 gap-4 shrink-0">
             <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 sm:gap-4">
                 <span className="text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-wider hidden sm:inline">Talets värde:</span>
                 <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-3xl sm:text-5xl font-black text-slate-800 w-24 sm:w-36 text-center outline-none border-b-2 border-transparent focus:border-blue-500 bg-transparent"
                    placeholder="0"
                 />
             </div>
             <button 
                onClick={clearAll}
                className="bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 p-2 sm:p-3 rounded-xl transition-colors"
                title="Rensa allt"
             >
                 <Icons.Trash size={20} />
             </button>
        </div>

        {/* WORKSPACE MAT */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
            
            {/* HUNDREDS COLUMN */}
            <div className="flex-1 flex flex-col gap-1 min-h-[120px]">
                <div className="bg-red-100 text-red-800 p-1.5 rounded-t-xl text-center font-bold uppercase tracking-wider text-[10px] sm:text-xs border-b-2 border-red-200">
                    Hundratal (100)
                </div>
                
                <div className="flex-1 bg-slate-50/50 border border-slate-200 rounded-b-xl p-2 sm:p-4 overflow-y-auto relative">
                    <div className="flex flex-wrap content-start gap-1 sm:gap-2 justify-center pb-4">
                        {hundreds.map((id) => (
                            <div 
                                key={id}
                                onClick={() => breakHundredToTens(id)}
                                className="w-12 h-12 sm:w-20 sm:h-20 bg-red-500 border border-red-600 shadow-sm rounded-sm cursor-pointer hover:bg-red-400 hover:scale-105 transition-all grid grid-cols-10 grid-rows-10 gap-[1px] group relative overflow-hidden"
                            >
                                {Array.from({length:100}).map((_, i) => <div key={i} className="bg-red-700/20 pointer-events-none"></div>)}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none">
                                    <Icons.Minimize size={20} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => addBlock('HUNDREDS')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                >
                    <Icons.Plus size={14} /> Lägg till 100
                </button>
            </div>

            {/* TENS COLUMN - Updated to 5 per row */}
            <div className={`flex-1 flex flex-col gap-1 min-h-[120px] transition-all duration-300 ${tens.length >= 10 ? 'ring-2 ring-blue-300 rounded-xl' : ''}`}>
                <div className="bg-blue-100 text-blue-800 p-1.5 rounded-t-xl text-center font-bold uppercase tracking-wider text-[10px] sm:text-xs border-b-2 border-blue-200">
                    Tiotal (10)
                </div>

                <div className="flex-1 bg-slate-50/50 border border-slate-200 rounded-b-xl p-2 sm:p-4 overflow-y-auto relative">
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 w-fit mx-auto pb-4">
                        {tens.map((id) => (
                            <div 
                                key={id}
                                onClick={() => breakTenToOnes(id)}
                                className="w-3 h-12 sm:w-5 sm:h-20 bg-blue-500 border border-blue-600 shadow-sm rounded-sm cursor-pointer hover:bg-blue-400 hover:scale-105 transition-all flex flex-col gap-[1px] p-[1px] group relative"
                            >
                                {Array.from({length:10}).map((_, i) => <div key={i} className="flex-1 w-full bg-blue-700/20 pointer-events-none"></div>)}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none">
                                    <Icons.Minimize size={14} className="text-white drop-shadow-md rotate-90" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {tens.length >= 10 && (
                        <div className="absolute bottom-2 left-0 w-full flex justify-center z-10 px-2">
                            <button 
                                onClick={groupTensToHundred}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg animate-pulse hover:bg-blue-700 flex items-center justify-center gap-1 text-[10px] sm:text-xs"
                            >
                                <Icons.Rotate size={14} /> VÄXLA TILL 100
                            </button>
                        </div>
                    )}
                </div>

                 <button 
                    onClick={() => addBlock('TENS')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                >
                    <Icons.Plus size={14} /> Lägg till 10
                </button>
            </div>

            {/* ONES COLUMN - Updated to 5 per row */}
            <div className={`flex-1 flex flex-col gap-1 min-h-[120px] transition-all duration-300 ${ones.length >= 10 ? 'ring-2 ring-green-300 rounded-xl' : ''}`}>
                <div className="bg-green-100 text-green-800 p-1.5 rounded-t-xl text-center font-bold uppercase tracking-wider text-[10px] sm:text-xs border-b-2 border-green-200">
                    Ental (1)
                </div>

                <div className="flex-1 bg-slate-50/50 border border-slate-200 rounded-b-xl p-2 sm:p-4 overflow-y-auto relative">
                     <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-fit mx-auto pb-4">
                        {ones.map((id) => (
                            <div 
                                key={id}
                                onClick={(e) => {e.stopPropagation(); removeBlock('ONES', id);}}
                                className="w-5 h-5 sm:w-7 sm:h-7 bg-green-500 border border-green-600 shadow-sm rounded-sm cursor-pointer hover:bg-red-500 hover:border-red-600 transition-colors flex items-center justify-center group"
                            >
                                <Icons.Close size={10} className="text-white opacity-0 group-hover:opacity-100 pointer-events-none" />
                            </div>
                        ))}
                     </div>

                    {ones.length >= 10 && (
                        <div className="absolute bottom-2 left-0 w-full flex justify-center z-10 px-2">
                            <button 
                                onClick={groupOnesToTen}
                                className="w-full py-2 bg-green-600 text-white rounded-lg font-bold shadow-lg animate-pulse hover:bg-green-700 flex items-center justify-center gap-1 text-[10px] sm:text-xs"
                            >
                                <Icons.Rotate size={14} /> VÄXLA TILL 10
                            </button>
                        </div>
                    )}
                </div>

                 <button 
                    onClick={() => addBlock('ONES')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                >
                    <Icons.Plus size={14} /> Lägg till 1
                </button>
            </div>
        </div>
    </div>
  );
};