import React, { useState } from 'react';
import { Icons } from '../icons';

interface PercentageWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

// Helper to simplify fractions
const gcd = (a: number, b: number): number => {
    return b ? gcd(b, a % b) : a;
};

const PercentagePanel: React.FC<{
    value: number;
    onChange: (val: number) => void;
    color: string;
    bgClass: string;
    label: string;
}> = ({ value, onChange, color, bgClass, label }) => {
    
    // Calculate simplified fraction
    const divisor = gcd(value, 100);
    const simpNum = value / divisor;
    const simpDen = 100 / divisor;
    const isSimplified = simpDen !== 100;

    return (
        <div className="flex flex-col items-center gap-3">
             <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{label}</div>
             
             {/* 10x10 Grid */}
             <div className="grid grid-cols-10 gap-1 p-2 bg-slate-100 rounded-lg border border-slate-200">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors duration-200 ${i < value ? color : 'bg-slate-200'}`}
                    ></div>
                ))}
             </div>

             {/* Slider */}
             <input 
                type="range" 
                min="0" 
                max="100" 
                value={value} 
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
             />

             {/* Stats Card */}
             <div className={`w-full p-3 rounded-xl border border-slate-200/60 flex flex-col items-center gap-1 shadow-sm ${bgClass}`}>
                 <div className="text-3xl font-bold text-slate-800">{value}%</div>
                 <div className="flex justify-between w-full px-2 text-xs font-mono font-medium text-slate-600 mt-1">
                     <span>{value}/100</span>
                     <span>{(value / 100).toFixed(2)}</span>
                 </div>
                 {isSimplified && value > 0 && (
                     <div className="text-xs text-blue-600 font-bold bg-white/50 px-2 py-0.5 rounded mt-1">
                         = {simpNum}/{simpDen}
                     </div>
                 )}
             </div>
        </div>
    );
};

export const PercentageWidget: React.FC<PercentageWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [valA, setValA] = useState(25);
  const [valB, setValB] = useState(50);

  const getOperator = () => {
      if (valA > valB) return '>';
      if (valA < valB) return '<';
      return '=';
  };

  return (
    <div className="w-full max-w-[650px] min-w-[500px]">
      <div className="flex justify-center items-start gap-4 sm:gap-8">
        
        {/* Panel A */}
        <PercentagePanel 
            label="Värde A" 
            value={valA} 
            onChange={setValA} 
            color="bg-blue-500" 
            bgClass="bg-blue-50"
        />

        {/* Comparison Operator */}
        <div className="self-center flex flex-col items-center gap-2 pt-10">
            <div className={`
                w-16 h-16 flex items-center justify-center rounded-2xl text-4xl font-black text-slate-700 shadow-md border-2 border-slate-200 bg-white
                transition-all duration-300
                ${valA === valB ? 'bg-green-50 border-green-300 text-green-600 scale-110' : ''}
            `}>
                {getOperator()}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jämför</div>
        </div>

        {/* Panel B */}
        <PercentagePanel 
            label="Värde B" 
            value={valB} 
            onChange={setValB} 
            color="bg-orange-400" 
            bgClass="bg-orange-50"
        />

      </div>
      
      {!isTransparent && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center text-xs text-slate-400 text-center px-8">
            Dra i reglagen för att fylla rutorna. Jämförelsetecknet uppdateras automatiskt.
        </div>
      )}
    </div>
  );
};