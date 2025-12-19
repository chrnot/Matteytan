import React, { useState, useRef } from 'react';
import { Icons } from '../icons';

interface CoordinatesWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

interface Point {
    id: number;
    x: number;
    y: number;
}

interface LineSeries {
    id: string;
    name: string;
    color: string;
    points: Point[];
}

const LINE_COLORS = [
    { name: 'Blå', hex: '#3b82f6', tailwind: 'bg-blue-500', border: 'border-blue-200', bg: 'bg-blue-50' },
    { name: 'Röd', hex: '#ef4444', tailwind: 'bg-red-500', border: 'border-red-200', bg: 'bg-red-50' },
    { name: 'Grön', hex: '#10b981', tailwind: 'bg-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50' },
    { name: 'Orange', hex: '#f59e0b', tailwind: 'bg-amber-500', border: 'border-amber-200', bg: 'bg-amber-50' },
];

export const CoordinatesWidget: React.FC<CoordinatesWidgetProps> = ({ isTransparent, setTransparent }) => {
  // State
  const [lines, setLines] = useState<LineSeries[]>([
      { id: '1', name: 'Linje A', color: '#3b82f6', points: [] }
  ]);
  const [activeLineId, setActiveLineId] = useState<string>('1');
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Configuration
  const GRID_SIZE = 20; // -10 to 10
  const CANVAS_SIZE = 360; // Pixels
  const STEP = CANVAS_SIZE / GRID_SIZE; // Pixels per unit
  const ORIGIN = CANVAS_SIZE / 2; // Middle

  // --- MATH HELPERS ---

  const toPx = (val: number, isY: boolean = false) => {
      if (isY) return ORIGIN - (val * STEP); // Invert Y for SVG
      return ORIGIN + (val * STEP);
  };

  const toCoord = (px: number, isY: boolean = false) => {
      const val = isY ? (ORIGIN - px) / STEP : (px - ORIGIN) / STEP;
      return Math.round(val); // Snap to integer
  };

  // Calculate equation and line coordinates for drawing
  const getEquationData = (points: Point[]) => {
      if (points.length < 2) return null;

      // Use last two points for the line
      const p2 = points[points.length - 1];
      const p1 = points[points.length - 2];

      // Vertical line check
      if (p2.x === p1.x) {
          return {
              x1: toPx(p1.x), y1: 0,
              x2: toPx(p1.x), y2: CANVAS_SIZE,
              equation: `x = ${p1.x}`,
              isVertical: true
          };
      }

      const k = (p2.y - p1.y) / (p2.x - p1.x);
      const m = p1.y - k * p1.x;

      // Draw infinite line across viewbox
      const startX = -10;
      const endX = 10;
      const startY = k * startX + m;
      const endY = k * endX + m;

      // Formatting
      const formatNum = (n: number) => {
          if (Number.isInteger(n)) return n.toString();
          return n.toFixed(2).replace(/\.00$/, '');
      };
      
      let eqString = `y = `;
      if (k === 0) eqString += formatNum(m);
      else if (k === 1) eqString += `x ${m >= 0 ? '+' : '-'} ${formatNum(Math.abs(m))}`;
      else if (k === -1) eqString += `-x ${m >= 0 ? '+' : '-'} ${formatNum(Math.abs(m))}`;
      else eqString += `${formatNum(k)}x ${m >= 0 ? '+' : '-'} ${formatNum(Math.abs(m))}`;

      eqString = eqString.replace(' + 0', '').replace(' - 0', '');

      return {
          x1: toPx(startX),
          y1: toPx(startY, true),
          x2: toPx(endX),
          y2: toPx(endY, true),
          equation: eqString
      };
  };

  // --- ACTIONS ---

  const handleSvgClick = (e: React.MouseEvent) => {
      if (!svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;

      const x = toCoord(clickX * scaleX, false);
      const y = toCoord(clickY * scaleY, true);

      if (x < -10 || x > 10 || y < -10 || y > 10) return;

      // Add point to ACTIVE line
      setLines(prev => prev.map(line => {
          if (line.id === activeLineId) {
              // Prevent duplicates in same line
              if (line.points.some(p => p.x === x && p.y === y)) return line;
              return { ...line, points: [...line.points, { id: Date.now(), x, y }] };
          }
          return line;
      }));
  };

  const addLine = () => {
      if (lines.length >= 4) return;
      const nextIdx = lines.length;
      const config = LINE_COLORS[nextIdx];
      const newLine: LineSeries = {
          id: Date.now().toString(),
          name: `Linje ${String.fromCharCode(65 + nextIdx)}`, // A, B, C...
          color: config.hex,
          points: []
      };
      setLines([...lines, newLine]);
      setActiveLineId(newLine.id);
  };

  const removeLine = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (lines.length <= 1) return; // Keep at least one
      
      const newLines = lines.filter(l => l.id !== id);
      setLines(newLines);
      if (activeLineId === id) {
          setActiveLineId(newLines[0].id);
      }
  };

  const clearActiveLine = () => {
      setLines(prev => prev.map(line => {
          if (line.id === activeLineId) return { ...line, points: [] };
          return line;
      }));
  };

  return (
    <div className={`transition-all ${isTransparent ? 'bg-white/90 rounded-lg p-2' : 'w-full max-w-3xl flex flex-col md:flex-row gap-4'}`}>
      
      {/* Canvas Area */}
      <div className="relative flex justify-center">
          <svg 
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
            width="100%"
            height="100%"
            className="bg-white border border-slate-300 rounded-lg shadow-sm cursor-crosshair select-none max-w-[360px] max-h-[360px]"
            onClick={handleSvgClick}
          >
              <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#1e293b" />
                  </marker>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => {
                  const pos = i * STEP;
                  const val = i - 10;
                  const isOrigin = val === 0;
                  return (
                      <React.Fragment key={i}>
                          <line x1={pos} y1={0} x2={pos} y2={CANVAS_SIZE} stroke={isOrigin ? "#1e293b" : "#e2e8f0"} strokeWidth={isOrigin ? 2 : 1} />
                          <line x1={0} y1={pos} x2={CANVAS_SIZE} y2={pos} stroke={isOrigin ? "#1e293b" : "#e2e8f0"} strokeWidth={isOrigin ? 2 : 1} />
                      </React.Fragment>
                  );
              })}

              {/* Axes Arrows */}
              <line x1={ORIGIN} y1={CANVAS_SIZE} x2={ORIGIN} y2={0} stroke="transparent" markerEnd="url(#arrow)" />
              <line x1={0} y1={ORIGIN} x2={CANVAS_SIZE} y2={ORIGIN} stroke="transparent" markerEnd="url(#arrow)" />

              {/* DRAW LINES & POINTS */}
              {lines.map(line => {
                  const eqData = getEquationData(line.points);
                  return (
                      <g key={line.id}>
                          {/* Infinite Line */}
                          {eqData && (
                              <line 
                                x1={eqData.x1} y1={eqData.y1} 
                                x2={eqData.x2} y2={eqData.y2}
                                stroke={line.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="opacity-60"
                              />
                          )}
                          
                          {/* Points */}
                          {line.points.map((p, i) => {
                              // Highlight the last two points (which define the current line)
                              const isKeyPoint = i >= line.points.length - 2; 
                              return (
                                <g key={p.id}>
                                    <circle 
                                        cx={toPx(p.x)} 
                                        cy={toPx(p.y, true)} 
                                        r={isKeyPoint ? 5 : 4} 
                                        fill={line.color} 
                                        stroke="white"
                                        strokeWidth="2"
                                        className="transition-all"
                                    />
                                    {/* Only show coords for active line points or key points to reduce clutter */}
                                    {(activeLineId === line.id || isKeyPoint) && (
                                        <text 
                                            x={toPx(p.x) + 8} 
                                            y={toPx(p.y, true) - 8} 
                                            fontSize="10" 
                                            fontWeight="bold" 
                                            fill={line.color}
                                            className="pointer-events-none drop-shadow-sm bg-white"
                                        >
                                            ({p.x}, {p.y})
                                        </text>
                                    )}
                                </g>
                              );
                          })}
                      </g>
                  );
              })}
          </svg>
      </div>

      {/* Sidebar Controls */}
      {!isTransparent && (
          <div className="flex-1 flex flex-col min-w-[200px] h-[360px]">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Icons.Graph size={18}/> Linjer
                    </h3>
                    <div className="flex gap-2">
                         <button 
                            onClick={clearActiveLine} 
                            className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            title="Rensa punkter på aktiv linje"
                        >
                            Rensa
                        </button>
                        <button 
                            onClick={addLine} 
                            disabled={lines.length >= 4}
                            className="flex items-center gap-1 text-xs bg-slate-800 text-white px-2 py-1 rounded shadow hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Icons.Plus size={12}/> Ny Linje
                        </button>
                    </div>
                </div>

                {/* Line List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {lines.map((line, idx) => {
                        const eqData = getEquationData(line.points);
                        const isActive = activeLineId === line.id;
                        const config = LINE_COLORS.find(c => c.hex === line.color) || LINE_COLORS[0];

                        return (
                            <div 
                                key={line.id} 
                                onClick={() => setActiveLineId(line.id)}
                                className={`
                                    relative p-3 rounded-lg border transition-all cursor-pointer group
                                    ${isActive ? `bg-white ${config.border} shadow-sm ring-1 ring-blue-100` : 'bg-slate-100 border-transparent opacity-80 hover:opacity-100'}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-3 h-3 rounded-full ${config.tailwind}`}></div>
                                        <span className={`font-bold text-sm ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                                            {line.name}
                                        </span>
                                        {isActive && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-bold">Aktiv</span>}
                                    </div>
                                    
                                    {lines.length > 1 && (
                                        <button 
                                            onClick={(e) => removeLine(line.id, e)} 
                                            className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Icons.Close size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Stats Area */}
                                <div className="flex justify-between items-end mt-1">
                                    <div className="text-xs text-slate-500">
                                        {line.points.length} punkter
                                    </div>
                                    {eqData ? (
                                        <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${config.bg} text-slate-700`}>
                                            {eqData.equation}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-400 italic">
                                            Sätt ut 2 punkter...
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
      )}
    </div>
  );
};