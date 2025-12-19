
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../icons';

interface NumberLineWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

interface Jump {
    start: number;
    end: number;
    label: string;
    id: number;
}

export const NumberLineWidget: React.FC<NumberLineWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [range, setRange] = useState({ min: -10, max: 20 });
  const [scale, setScale] = useState(1); 
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [stepSize, setStepSize] = useState(1);
  const [expression, setExpression] = useState('');
  const [error, setError] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalUnits = range.max - range.min;
  const baseWidthPerUnit = 40; 
  const widthPerUnit = baseWidthPerUnit * scale; 
  const totalWidth = totalUnits * widthPerUnit + 100;
  
  const LINE_Y = 160; 

  // Helper to get X coordinate based on number value
  const getX = (val: number) => {
    return (val - range.min) * widthPerUnit + 50;
  };

  // Center the view on 0 when component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
        const zeroX = getX(0);
        const containerWidth = scrollContainerRef.current.clientWidth;
        // Small timeout to ensure layout is ready
        setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft = zeroX - containerWidth / 2;
            }
        }, 50);
    }
  }, []);

  const addManualJump = (direction: 'left' | 'right') => {
    const lastPos = jumps.length > 0 ? jumps[jumps.length - 1].end : 0;
    const change = direction === 'right' ? stepSize : -stepSize;
    const newJump: Jump = { 
        start: lastPos, 
        end: lastPos + change, 
        label: direction === 'right' ? `+${stepSize}` : `-${stepSize}`,
        id: Date.now() 
    };
    setJumps([...jumps, newJump]);
    
    // Auto-expand range if jump goes out of bounds
    if (newJump.end > range.max) setRange(r => ({ ...r, max: Math.ceil(newJump.end + 5) }));
    if (newJump.end < range.min) setRange(r => ({ ...r, min: Math.floor(newJump.end - 5) }));
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!expression.trim()) return;

    try {
        let cleanExpr = expression.replace(/\s+/g, '');
        
        // Match numbers and operators
        const regex = /(-?\d+)|([\+\-])/g;
        const matches = cleanExpr.match(regex);
        
        if (!matches) throw new Error("Ogiltigt uttryck");

        const newJumps: Jump[] = [];
        let currentPos = 0;
        
        let i = 0;
        let firstVal = parseInt(matches[0], 10);
        
        // Handle if first token is a sign
        if (isNaN(firstVal)) {
            const sign = matches[0];
            const val = parseInt(matches[1], 10);
            firstVal = sign === '-' ? -val : val;
            i = 2;
        } else {
            i = 1;
        }

        if (firstVal !== 0) {
            newJumps.push({
                start: 0,
                end: firstVal,
                label: firstVal > 0 ? `+${firstVal}` : firstVal.toString(),
                id: Date.now()
            });
            currentPos = firstVal;
        }

        for (; i < matches.length; i += 2) {
            const operator = matches[i];
            const nextValToken = matches[i + 1];
            if (!nextValToken) break;

            const val = parseInt(nextValToken, 10);
            let jumpVal = (operator === '-') ? -val : val;
            
            const nextPos = currentPos + jumpVal;
            newJumps.push({
                start: currentPos,
                end: nextPos,
                label: `${operator}${val}`,
                id: Date.now() + i
            });
            currentPos = nextPos;
        }

        setJumps(newJumps);
        
        const allCoords = [0, ...newJumps.map(j => j.end), ...newJumps.map(j => j.start)];
        const minCoord = Math.min(...allCoords);
        const maxCoord = Math.max(...allCoords);
        
        setRange({
            min: Math.min(range.min, Math.floor(minCoord - 5)),
            max: Math.max(range.max, Math.ceil(maxCoord + 5))
        });

    } catch (err) {
        setError("Kunde inte tolka. Skriv t.ex: 5 + 3 - 2");
    }
  };

  const clearJumps = () => {
    setJumps([]);
    setExpression('');
    setError('');
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-hidden bg-white">
      
      {/* Expression & Controls */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 sm:p-3 rounded-xl border border-slate-200 shrink-0">
        
        <form onSubmit={handleEvaluate} className="flex gap-2 w-full">
            <div className="relative flex-1">
                <input 
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="Skriv uttryck: 10 - 3 + 5"
                    className={`w-full bg-white border ${error ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'} rounded-lg px-3 py-1.5 font-mono font-bold text-slate-700 text-sm outline-none focus:border-blue-500 transition-all`}
                />
                {error && <div className="absolute -bottom-5 left-1 text-[9px] font-bold text-red-500">{error}</div>}
            </div>
            <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-blue-700 text-xs transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
                Visa Hopp
            </button>
        </form>

        <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Steg:</span>
                    <input 
                        type="number" 
                        min="1" 
                        value={stepSize} 
                        onChange={(e) => setStepSize(Math.max(1, Number(e.target.value)))}
                        className="w-10 border rounded px-1 text-xs font-bold text-center h-7"
                    />
                </div>
                <div className="flex gap-1">
                    <button onClick={() => addManualJump('left')} className="p-1.5 bg-white border rounded hover:bg-slate-50 text-slate-600 shadow-sm">
                        <Icons.Minimize size={14} />
                    </button>
                    <button onClick={() => addManualJump('right')} className="p-1.5 bg-white border rounded hover:bg-slate-50 text-slate-600 shadow-sm">
                        <Icons.Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 border-r pr-2 border-slate-200">
                    <input 
                        type="number" 
                        value={range.min} 
                        onChange={e => setRange(p => ({...p, min: Number(e.target.value)}))}
                        className="w-12 border rounded px-1 text-xs text-center h-7 font-bold text-slate-500"
                    />
                    <span className="text-slate-300">...</span>
                    <input 
                        type="number" 
                        value={range.max} 
                        onChange={e => setRange(p => ({...p, max: Number(e.target.value)}))}
                        className="w-12 border rounded px-1 text-xs text-center h-7 font-bold text-slate-500"
                    />
                </div>
                <button onClick={clearJumps} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Rensa">
                    <Icons.Trash size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Number Line Visualizer */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto border-2 border-slate-100 rounded-xl bg-slate-50/30 relative select-none scrollbar-thin w-full min-h-0"
      >
        <svg 
            width={Math.max(totalWidth, 800)} 
            height="100%" 
            viewBox={`0 0 ${Math.max(totalWidth, 800)} 280`} 
            preserveAspectRatio="xMinYMid meet" 
            className="min-h-[250px]"
        >
          {/* Main Axis Line */}
          <line x1="0" y1={LINE_Y} x2={Math.max(totalWidth, 800)} y2={LINE_Y} stroke="#334155" strokeWidth="2.5" />
          
          {/* Ticks & Labels */}
          {Array.from({ length: totalUnits + 1 }).map((_, i) => {
            const val = range.min + i;
            const x = getX(val);
            const isZero = val === 0;
            const isMajor = val % 5 === 0;
            
            return (
              <g key={val}>
                <line 
                    x1={x} y1={LINE_Y - (isMajor ? 12 : 8)} x2={x} y2={LINE_Y + (isMajor ? 12 : 8)} 
                    stroke={isZero ? "#000" : (isMajor ? "#475569" : "#cbd5e1")} 
                    strokeWidth={isZero ? 3 : (isMajor ? 2 : 1)} 
                />
                {(isMajor || isZero || Math.abs(val) < 5) && (
                    <text 
                        x={x} y={LINE_Y + 32} 
                        textAnchor="middle" 
                        fontSize={isZero ? 16 : 12} 
                        fill={isZero ? '#000' : '#64748b'} 
                        fontWeight={isZero || isMajor ? '800' : 'bold'}
                        className="font-mono"
                    >
                    {val}
                    </text>
                )}
              </g>
            );
          })}

          {/* Jump Paths - DASHED STYLE */}
          {jumps.map((jump, index) => {
            const x1 = getX(jump.start);
            const x2 = getX(jump.end);
            const midX = (x1 + x2) / 2;
            const diff = jump.end - jump.start;
            const isPositive = diff > 0;
            
            const baseHeight = Math.min(Math.abs(x2 - x1) * 0.5, 80);
            const heightMultiplier = 1 + (index % 3) * 0.2;
            const height = baseHeight * heightMultiplier;

            return (
              <g key={jump.id} className="animate-in fade-in zoom-in duration-500">
                <path 
                    d={`M ${x1} ${LINE_Y} Q ${midX} ${LINE_Y - height} ${x2} ${LINE_Y}`} 
                    fill="none" 
                    stroke={isPositive ? "#10b981" : "#ef4444"} 
                    strokeWidth="3"
                    strokeDasharray="6,4"
                    strokeLinecap="round"
                    markerEnd={`url(#arrowhead-${isPositive ? 'green' : 'red'})`}
                    className="transition-all"
                />
                <g transform={`translate(${midX}, ${LINE_Y - (height / 2) - 20})`}>
                    <rect 
                        x="-20" y="-10" width="40" height="20" rx="6" 
                        fill="white" stroke={isPositive ? "#10b981" : "#ef4444"} strokeWidth="1.5"
                        className="shadow-sm"
                    />
                    <text 
                        textAnchor="middle" 
                        y="4"
                        fontSize="12" 
                        fill={isPositive ? "#065f46" : "#991b1b"} 
                        fontWeight="black"
                        className="font-mono"
                    >
                        {jump.label}
                    </text>
                </g>
              </g>
            );
          })}

          <defs>
            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
             <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>
        </svg>
      </div>
      
      <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center shrink-0">
          Tallinjen startar alltid på 0 • Dra i linjen för att se fler tal
      </div>
    </div>
  );
};
