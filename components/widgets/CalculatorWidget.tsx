import React, { useState } from 'react';
import { Icons } from '../icons';

interface CalculatorWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const CalculatorWidget: React.FC<CalculatorWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleClick = (val: string) => {
    // If we have a result and type an operator, continue with result
    // If we have a result and type a number, start new
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

  const calculate = () => {
    try {
      if (!input) return;
      
      // Replace visual operators with JS operators
      // Handle implicit multiplication for parens like "5(2)" -> "5*(2)" is tricky, 
      // keeping it simple: user must type operators.
      const expression = input
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      // Safety check: allow only numbers and operators
      if (/[^0-9+\-*/().\s]/.test(expression)) {
          setResult('Fel');
          return;
      }

      // eslint-disable-next-line no-new-func
      const res = new Function('"use strict";return (' + expression + ')')();
      
      // Handle division by zero or other infinities
      if (!isFinite(res) || isNaN(res)) {
          setResult('Fel');
          return;
      }

      // Handle precision issues loosely (e.g. 0.1 + 0.2)
      const formatted = Math.round(res * 10000000000) / 10000000000;
      setResult(formatted.toString());
    } catch (e) {
      setResult('Fel');
    }
  };

  const buttons = [
    { label: 'C', action: clear, cls: 'text-red-500 bg-red-50 hover:bg-red-100 font-bold' },
    { label: '(', action: () => handleClick('('), cls: 'bg-slate-100 text-slate-600' },
    { label: ')', action: () => handleClick(')'), cls: 'bg-slate-100 text-slate-600' },
    { label: '÷', action: () => handleClick('÷'), cls: 'bg-blue-50 text-blue-600 font-medium text-xl' },
    
    { label: '7', action: () => handleClick('7') },
    { label: '8', action: () => handleClick('8') },
    { label: '9', action: () => handleClick('9') },
    { label: '×', action: () => handleClick('×'), cls: 'bg-blue-50 text-blue-600 font-medium text-xl' },
    
    { label: '4', action: () => handleClick('4') },
    { label: '5', action: () => handleClick('5') },
    { label: '6', action: () => handleClick('6') },
    { label: '-', action: () => handleClick('-'), cls: 'bg-blue-50 text-blue-600 font-medium text-xl' },
    
    { label: '1', action: () => handleClick('1') },
    { label: '2', action: () => handleClick('2') },
    { label: '3', action: () => handleClick('3') },
    { label: '+', action: () => handleClick('+'), cls: 'bg-blue-50 text-blue-600 font-medium text-xl' },
    
    { label: '0', action: () => handleClick('0') },
    { label: '.', action: () => handleClick('.') },
    { label: '⌫', action: backspace, cls: 'text-slate-500 bg-slate-100' },
    { label: '=', action: calculate, cls: 'bg-blue-600 text-white hover:bg-blue-700 font-bold text-xl' },
  ];

  return (
    <div className="w-[280px]">
      {/* Display */}
      <div className="bg-slate-800 p-4 rounded-xl mb-4 text-right shadow-inner border border-slate-700">
        <div className="text-slate-400 text-xs h-5 overflow-hidden font-mono tracking-wider">{input || '0'}</div>
        <div className="text-white text-3xl font-mono font-bold h-10 overflow-hidden tracking-wide">{result || (input ? '' : '')}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`
              h-12 rounded-lg text-lg transition-all shadow-sm border border-slate-200/50 active:scale-95
              ${btn.cls || 'bg-white hover:bg-slate-50 text-slate-700 font-medium'}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};