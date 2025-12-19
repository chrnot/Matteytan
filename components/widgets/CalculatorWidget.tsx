import React, { useState } from 'react';
import { Icons } from '../icons';

interface CalculatorWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const CalculatorWidget: React.FC<CalculatorWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState(false);

  const handleClick = (val: string) => {
    if (result && !['+', '-', '×', '÷'].includes(val)) {
        setResult('');
        setInput(val);
    } else if (result && ['+', '-', '×', '÷'].includes(val)) {
        setInput(result + val);
        setResult('');
    } else {
        setInput(prev => prev + val);
    }
  };

  const clear = () => {
    setInput('');
    setResult('');
  };

  const backspace = () => {
    if (result) {
        clear();
    } else {
        setInput(prev => prev.slice(0, -1));
    }
  };

  const calculate = (expr?: string) => {
    try {
      const target = expr || input;
      if (!target) return;
      
      const expression = target
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      if (/[^0-9+\-*/().\s]/.test(expression)) {
          setResult('Fel');
          return;
      }

      const res = new Function('"use strict";return (' + expression + ')')();
      
      if (!isFinite(res) || isNaN(res)) {
          setResult('Fel');
          return;
      }

      const formatted = Math.round(res * 10000000000) / 10000000000;
      setResult(formatted.toString());
      return formatted;
    } catch (e) {
      setResult('Fel');
      return null;
    }
  };

  const handleSqrt = () => {
      const current = result || calculate();
      if (current !== null && current !== undefined) {
          const res = Math.sqrt(Number(current));
          setResult(res.toString());
          setInput(`√(${current})`);
      }
  };

  const handleSquare = () => {
      const current = result || calculate();
      if (current !== null && current !== undefined) {
          const res = Math.pow(Number(current), 2);
          setResult(res.toString());
          setInput(`(${current})²`);
      }
  };

  const handleMemory = (type: 'MC' | 'MR' | 'M+' | 'M-') => {
      const current = Number(result || calculate() || 0);
      
      switch(type) {
          case 'MC':
              setMemory(0);
              setHasMemory(false);
              break;
          case 'MR':
              if (hasMemory) {
                  setInput(prev => prev + memory.toString());
                  setResult('');
              }
              break;
          case 'M+':
              setMemory(prev => prev + current);
              setHasMemory(true);
              break;
          case 'M-':
              setMemory(prev => prev - current);
              setHasMemory(true);
              break;
      }
  };

  return (
    <div className="w-full max-w-[340px] mx-auto select-none h-full flex flex-col">
      {/* Modern Glass Display */}
      <div className="bg-slate-900 p-4 rounded-2xl mb-4 text-right shadow-2xl border border-slate-800 relative overflow-hidden shrink-0">
        <div className="absolute top-2 left-3 flex gap-1">
            {hasMemory && <span className="text-[10px] font-black text-indigo-400 bg-indigo-900/50 px-1.5 py-0.5 rounded border border-indigo-500/30 animate-pulse">M</span>}
        </div>
        <div className="text-slate-500 text-xs h-5 overflow-hidden font-mono tracking-wider mb-1">
            {input || '0'}
        </div>
        <div className="text-white text-4xl font-mono font-bold h-12 overflow-hidden tracking-tight truncate">
            {result || (input ? '' : '0')}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        
        {/* Memory Row */}
        <button onClick={() => handleMemory('MC')} className="h-10 sm:h-12 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">MC</button>
        <button onClick={() => handleMemory('MR')} className="h-10 sm:h-12 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">MR</button>
        <button onClick={() => handleMemory('M+')} className="h-10 sm:h-12 rounded-xl text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all">M+</button>
        <button onClick={() => handleMemory('M-')} className="h-10 sm:h-12 rounded-xl text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all">M-</button>

        {/* Function Row */}
        <button onClick={clear} className="h-12 sm:h-14 rounded-xl text-lg font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all">C</button>
        <button onClick={handleSqrt} className="h-12 sm:h-14 rounded-xl text-lg font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">√</button>
        <button onClick={handleSquare} className="h-12 sm:h-14 rounded-xl text-lg font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">x²</button>
        <button onClick={() => handleClick('÷')} className="h-12 sm:h-14 rounded-xl text-2xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">÷</button>

        {/* Numbers & Basic Ops */}
        <button onClick={() => handleClick('7')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">7</button>
        <button onClick={() => handleClick('8')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">8</button>
        <button onClick={() => handleClick('9')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">9</button>
        <button onClick={() => handleClick('×')} className="h-14 sm:h-16 rounded-xl text-2xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">×</button>

        <button onClick={() => handleClick('4')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">4</button>
        <button onClick={() => handleClick('5')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">5</button>
        <button onClick={() => handleClick('6')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">6</button>
        <button onClick={() => handleClick('-')} className="h-14 sm:h-16 rounded-xl text-2xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">−</button>

        <button onClick={() => handleClick('1')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">1</button>
        <button onClick={() => handleClick('2')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">2</button>
        <button onClick={() => handleClick('3')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">3</button>
        <button onClick={() => handleClick('+')} className="h-14 sm:h-16 rounded-xl text-2xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">+</button>

        <button onClick={() => handleClick('0')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">0</button>
        <button onClick={() => handleClick('.')} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50 shadow-sm transition-all">,</button>
        <button onClick={backspace} className="h-14 sm:h-16 rounded-xl text-xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center">
            <Icons.Close size={20} />
        </button>
        <button onClick={() => calculate()} className="h-14 sm:h-16 rounded-xl text-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">=</button>

      </div>
      
      <div className="mt-4 pb-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-4 shrink-0">
          Vetenskaplig räknare
      </div>
    </div>
  );
};