import React, { useState } from 'react';
import { Icons } from '../icons';

type ShapeType = 'CIRCLE' | 'RECT';

interface FractionState {
  num: number;
  den: number;
}

interface FractionWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

const FractionDisplay: React.FC<{ 
    label: string; 
    state: FractionState; 
    shape: ShapeType;
    onChange: (s: FractionState) => void; 
    color: string;
    bg: string;
}> = ({ label, state, shape, onChange, color, bg }) => {
    
    // Helper to calculate SVG path for a slice
    const getSlicePath = (index: number, total: number) => {
        if (total === 1) return ""; 

        const startAngle = (index / total) * 360;
        const endAngle = ((index + 1) / total) * 360;

        const center = 50;
        const radius = 48;
        const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);

        const x1 = center + radius * Math.cos(toRad(startAngle));
        const y1 = center + radius * Math.sin(toRad(startAngle));
        
        const x2 = center + radius * Math.cos(toRad(endAngle));
        const y2 = center + radius * Math.sin(toRad(endAngle));

        return `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    };

    return (
        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm w-full sm:w-44">
            
            {/* Visualizer */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex items-center justify-center transition-all duration-300">
                {shape === 'CIRCLE' ? (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                        <circle cx="50" cy="50" r="48" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                        
                        {state.den === 1 ? (
                            <circle 
                                cx="50" cy="50" r="48" 
                                fill={state.num >= 1 ? color : '#f1f5f9'} 
                                stroke="#cbd5e1" 
                                strokeWidth="2" 
                            />
                        ) : (
                            Array.from({ length: state.den }).map((_, i) => (
                                <path
                                    key={i}
                                    d={getSlicePath(i, state.den)}
                                    fill={i < state.num ? color : '#f1f5f9'}
                                    stroke="white" 
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                    className="transition-colors duration-300"
                                />
                            ))
                        )}
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                ) : (
                    <div className="w-16 h-24 sm:w-20 sm:h-32 flex flex-col border-2 border-slate-400 rounded-lg overflow-hidden bg-slate-100 shadow-sm">
                         {Array.from({ length: state.den }).map((_, i) => {
                             const isActive = i < state.num;
                             return (
                                 <div 
                                    key={i} 
                                    className="flex-1 w-full border-b-2 border-white last:border-0 transition-colors duration-300 relative"
                                    style={{ backgroundColor: isActive ? color : '#f1f5f9' }}
                                 >
                                 </div>
                             )
                         })}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col w-full gap-2">
                 {/* Numerator */}
                 <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => onChange({...state, num: Math.max(0, state.num - 1)})} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-slate-500 active:scale-95 transition-transform"
                    >
                        <Icons.Minimize size={14}/>
                    </button>
                    <span className="font-bold text-lg text-slate-700">{state.num}</span>
                    <button 
                        onClick={() => onChange({...state, num: Math.min(state.den, state.num + 1)})} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-slate-500 active:scale-95 transition-transform"
                    >
                        <Icons.Plus size={14}/>
                    </button>
                 </div>
                 
                 <div className="h-[2px] w-full bg-slate-300 rounded-full"></div>
                 
                 {/* Denominator */}
                 <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => {
                            const newDen = Math.max(1, state.den - 1);
                            const newNum = Math.min(state.num, newDen);
                            onChange({ num: newNum, den: newDen });
                        }} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-slate-500 active:scale-95 transition-transform"
                    >
                        <Icons.Minimize size={14}/>
                    </button>
                    <span className="font-bold text-lg text-slate-700">{state.den}</span>
                    <button 
                        onClick={() => onChange({...state, den: Math.min(24, state.den + 1)})} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-slate-500 active:scale-95 transition-transform"
                    >
                        <Icons.Plus size={14}/>
                    </button>
                 </div>
            </div>
        </div>
    );
}

export const FractionWidget: React.FC<FractionWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [fracA, setFracA] = useState<FractionState>({ num: 1, den: 2 });
  const [fracB, setFracB] = useState<FractionState>({ num: 2, den: 4 });
  const [shape, setShape] = useState<ShapeType>('CIRCLE');

  return (
    <div className="w-full max-w-[500px]">
      <div className="flex justify-center mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
                onClick={() => setShape('CIRCLE')} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${shape === 'CIRCLE' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Icons.Fraction size={16} /> Pizza
            </button>
            <button 
                onClick={() => setShape('RECT')} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${shape === 'RECT' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <div className="w-4 h-4 border-2 border-current rounded-sm"></div> Choklad
            </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
        <FractionDisplay 
            label="Bråk A" 
            state={fracA} 
            shape={shape} 
            onChange={setFracA} 
            color="#3b82f6" 
            bg="#dbeafe"
        />
        
        <div className="self-center flex flex-col items-center gap-4 pt-0 sm:pt-10">
            <div className={`
                w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold border-4 shadow-sm transition-all duration-500
                ${fracA.num / fracA.den === fracB.num / fracB.den ? 'bg-green-100 border-green-200 text-green-600 scale-110' : 'bg-white border-slate-200 text-slate-400'}
            `}>
                {fracA.num / fracA.den === fracB.num / fracB.den ? '=' : (fracA.num / fracA.den > fracB.num / fracB.den ? '>' : '<')}
            </div>
        </div>

        <FractionDisplay 
            label="Bråk B" 
            state={fracB} 
            shape={shape} 
            onChange={setFracB} 
            color="#10b981" 
            bg="#d1fae5"
        />
      </div>
    </div>
  );
};