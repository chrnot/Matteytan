import React, { useState } from 'react';
import { Icons } from '../icons';

interface NumberLineWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const NumberLineWidget: React.FC<NumberLineWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [range, setRange] = useState({ min: -10, max: 20 });
  const [scale, setScale] = useState(1); // Zoom scale
  const [jumps, setJumps] = useState<{ start: number; end: number; id: number }[]>([]);
  const [stepSize, setStepSize] = useState(1);

  const totalUnits = range.max - range.min;
  const baseWidthPerUnit = 40; 
  const widthPerUnit = baseWidthPerUnit * scale; // Scaled width
  const totalWidth = totalUnits * widthPerUnit + 100;
  
  // Adjusted vertical positions to fit stacked arcs
  // Increased to allow more stacking
  const LINE_Y = 220; 

  const addJump = (direction: 'left' | 'right') => {
    const lastPos = jumps.length > 0 ? jumps[jumps.length - 1].end : 0;
    const change = direction === 'right' ? stepSize : -stepSize;
    const newJump = { start: lastPos, end: lastPos + change, id: Date.now() };
    setJumps([...jumps, newJump]);
  };

  const clearJumps = () => setJumps([]);

  const getX = (val: number) => {
    return (val - range.min) * widthPerUnit + 50;
  };

  return (
    <div className="w-[750px] flex flex-col gap-2">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
        
        {/* Range Controls */}
        <div className="flex items-center gap-2 border-r pr-4 border-slate-300">
            <span className="text-xs text-slate-500 font-bold">Intervall:</span>
            <input 
                type="number" 
                value={range.min} 
                onChange={e => setRange(p => ({...p, min: Number(e.target.value)}))}
                className="w-10 border rounded px-1 text-sm text-center"
            />
            <span className="text-slate-400">-</span>
            <input 
                type="number" 
                value={range.max} 
                onChange={e => setRange(p => ({...p, max: Number(e.target.value)}))}
                className="w-10 border rounded px-1 text-sm text-center"
            />
        </div>

        {/* Zoom Control */}
        <div className="flex items-center gap-2 border-r pr-4 border-slate-300">
             <span className="text-xs text-slate-500 font-bold">Zoom:</span>
             <input 
                type="range" 
                min="0.5" 
                max="2.5" 
                step="0.1" 
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-20 accent-blue-600"
             />
        </div>

        {/* Jump Controls */}
        <div className="flex items-center gap-2">
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Steg:</span>
                <input 
                    type="number" 
                    min="1" 
                    value={stepSize} 
                    onChange={(e) => setStepSize(Math.max(1, Number(e.target.value)))}
                    className="w-12 border rounded px-1 text-sm font-bold text-center"
                />
            </div>

            <div className="flex gap-1 h-full items-end">
                <button onClick={() => addJump('left')} className="flex items-center gap-1 text-xs bg-white border shadow-sm px-3 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium">
                    <Icons.Minimize size={12} /> Hoppa Vänster
                </button>
                <button onClick={() => addJump('right')} className="flex items-center gap-1 text-xs bg-white border shadow-sm px-3 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium">
                    <Icons.Plus size={12} /> Hoppa Höger
                </button>
            </div>
            
             <button onClick={clearJumps} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded hover:bg-red-100 ml-2 h-full self-end">
                <Icons.Trash size={14} />
            </button>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="overflow-x-auto pb-4 border rounded-xl bg-white relative h-[300px] select-none shadow-inner scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <svg width={Math.max(totalWidth, 730)} height="100%">
          {/* Main Line */}
          <line x1="0" y1={LINE_Y} x2={Math.max(totalWidth, 730)} y2={LINE_Y} stroke="#334155" strokeWidth="2" />
          
          {/* Ticks & Numbers */}
          {Array.from({ length: totalUnits + 1 }).map((_, i) => {
            const val = range.min + i;
            const x = getX(val);
            const isZero = val === 0;
            return (
              <g key={val}>
                <line 
                    x1={x} y1={LINE_Y - 10} x2={x} y2={LINE_Y + 10} 
                    stroke={isZero ? "#000" : "#64748b"} 
                    strokeWidth={isZero ? 3 : 1} 
                />
                <text 
                    x={x} y={LINE_Y + 30} 
                    textAnchor="middle" 
                    fontSize={isZero ? 14 : 12} 
                    fill={isZero ? '#000' : '#64748b'} 
                    fontWeight={isZero ? 'bold' : 'normal'}
                >
                  {val}
                </text>
                {/* Minor Ticks */}
                {scale > 1.2 && (
                    <>
                        <line x1={x + widthPerUnit * 0.5} y1={LINE_Y - 5} x2={x + widthPerUnit * 0.5} y2={LINE_Y + 5} stroke="#cbd5e1" strokeWidth="1" />
                    </>
                )}
              </g>
            );
          })}

          {/* Jumps */}
          {jumps.map((jump, index) => {
            const x1 = getX(jump.start);
            const x2 = getX(jump.end);
            const midX = (x1 + x2) / 2;
            const direction = jump.end > jump.start ? 1 : -1;
            
            // Stack Height Calculation
            // We check how many *previous* jumps cover the exact same interval (ignoring direction)
            // This ensures +5 and -5 on the same spot stack on top of each other.
            
            const currentMin = Math.min(jump.start, jump.end);
            const currentMax = Math.max(jump.start, jump.end);
            
            const overlapCount = jumps.filter((j, idx) => {
                if (idx >= index) return false;
                const otherMin = Math.min(j.start, j.end);
                const otherMax = Math.max(j.start, j.end);
                return currentMin === otherMin && currentMax === otherMax;
            }).length;

            // Base height logic + Stacking offset
            const baseHeight = Math.min(Math.abs(x2 - x1) * 0.5, 80);
            const height = baseHeight + (overlapCount * 30); // Add 30px for each overlap

            return (
              <g key={jump.id}>
                <path 
                    d={`M ${x1} ${LINE_Y} Q ${midX} ${LINE_Y - height * 2} ${x2} ${LINE_Y}`} 
                    fill="none" 
                    stroke={direction > 0 ? "#10b981" : "#ef4444"} 
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd={`url(#arrowhead-${direction > 0 ? 'green' : 'red'})`}
                    className="drop-shadow-sm"
                />
                {/* Label Background for readability */}
                <rect 
                    x={midX - 12} 
                    y={LINE_Y - height - 14} 
                    width="24" 
                    height="16" 
                    fill="white" 
                    opacity="0.8" 
                    rx="4"
                />
                <text 
                    x={midX} y={LINE_Y - height - 2} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fill={direction > 0 ? "#10b981" : "#ef4444"} 
                    fontWeight="bold"
                >
                    {direction > 0 ? '+' : ''}{jump.end - jump.start}
                </text>
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
    </div>
  );
};