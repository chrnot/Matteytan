import React, { useState, useMemo, useRef } from 'react';
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

export const CoordinatesWidget: React.FC<CoordinatesWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Configuration
  const GRID_SIZE = 20; // -10 to 10
  const CANVAS_SIZE = 360; // Pixels
  const STEP = CANVAS_SIZE / GRID_SIZE; // Pixels per unit
  const ORIGIN = CANVAS_SIZE / 2; // Middle

  // Convert Graph Coord to Pixel Coord
  const toPx = (val: number, isY: boolean = false) => {
      if (isY) return ORIGIN - (val * STEP); // Invert Y for SVG
      return ORIGIN + (val * STEP);
  };

  // Convert Pixel Coord to Graph Coord (with snapping)
  const toCoord = (px: number, isY: boolean = false) => {
      const val = isY ? (ORIGIN - px) / STEP : (px - ORIGIN) / STEP;
      return Math.round(val); // Snap to integer
  };

  const handleSvgClick = (e: React.MouseEvent) => {
      if (!svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Scale coords in case SVG is resized via CSS
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;

      const x = toCoord(clickX * scaleX, false);
      const y = toCoord(clickY * scaleY, true);

      // Prevent duplicates
      if (points.some(p => p.x === x && p.y === y)) return;

      // Limit range to visible grid (-10 to 10)
      if (x < -10 || x > 10 || y < -10 || y > 10) return;

      const newPoint = { id: Date.now(), x, y };
      setPoints(prev => [...prev, newPoint]);
  };

  const removePoint = (id: number) => {
      setPoints(points.filter(p => p.id !== id));
  };

  const clearAll = () => setPoints([]);

  // Line Calculation (based on last 2 points)
  const lineData = useMemo(() => {
      if (points.length < 2) return null;
      
      // Get last two points
      const p2 = points[points.length - 1];
      const p1 = points[points.length - 2];

      // Check for vertical line
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

      // Calculate start and end pixels for drawing the infinite line across the viewbox
      const startX = -10;
      const endX = 10;
      const startY = k * startX + m;
      const endY = k * endX + m;

      // Formatting k and m
      const formatNum = (n: number) => {
          if (Number.isInteger(n)) return n.toString();
          return n.toFixed(2).replace(/\.00$/, '');
      };
      
      let eqString = `y = `;
      if (k === 0) eqString += formatNum(m);
      else if (k === 1) eqString += `x ${m >= 0 ? '+' : '-'} ${formatNum(Math.abs(m))}`;
      else if (k === -1) eqString += `-x ${m >= 0 ? '+' : '-'} ${formatNum(Math.abs(m))}`;
      else eqString += `${formatNum(k)}x ${m >= 0 ? '+' : '-'} ${formatNum(Math.abs(m))}`;

      // Clean up " + 0"
      eqString = eqString.replace(' + 0', '').replace(' - 0', '');

      return {
          x1: toPx(startX),
          y1: toPx(startY, true),
          x2: toPx(endX),
          y2: toPx(endY, true),
          equation: eqString,
          k, m
      };
  }, [points]);

  return (
    <div className={`transition-all ${isTransparent ? 'bg-white/90 rounded-lg p-2' : 'w-full max-w-3xl flex flex-col md:flex-row gap-4'}`}>
      
      {/* Canvas Area */}
      <div className="relative flex justify-center">
          <svg 
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
            width="100%"
            height="100%"
            className="bg-white border border-slate-300 rounded shadow-sm cursor-crosshair select-none max-w-[360px] max-h-[360px]"
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
                          {/* Vertical */}
                          <line 
                            x1={pos} y1={0} x2={pos} y2={CANVAS_SIZE} 
                            stroke={isOrigin ? "#1e293b" : "#e2e8f0"} 
                            strokeWidth={isOrigin ? 2 : 1}
                          />
                          {/* Horizontal */}
                          <line 
                            x1={0} y1={pos} x2={CANVAS_SIZE} y2={pos} 
                            stroke={isOrigin ? "#1e293b" : "#e2e8f0"} 
                            strokeWidth={isOrigin ? 2 : 1}
                          />
                      </React.Fragment>
                  );
              })}

              {/* Arrows for Axes */}
              <line x1={ORIGIN} y1={CANVAS_SIZE} x2={ORIGIN} y2={0} stroke="transparent" markerEnd="url(#arrow)" />
              <line x1={0} y1={ORIGIN} x2={CANVAS_SIZE} y2={ORIGIN} stroke="transparent" markerEnd="url(#arrow)" />

              {/* Calculated Line */}
              {lineData && (
                  <line 
                    x1={lineData.x1} y1={lineData.y1} 
                    x2={lineData.x2} y2={lineData.y2}
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
              )}

              {/* Plotted Points */}
              {points.map((p, i) => {
                  const isLastTwo = i >= points.length - 2 && points.length >= 2;
                  return (
                    <g key={p.id}>
                        <circle 
                            cx={toPx(p.x)} 
                            cy={toPx(p.y, true)} 
                            r={6} 
                            fill={isLastTwo ? "#f59e0b" : "#3b82f6"} 
                            stroke="white"
                            strokeWidth="2"
                            className="transition-all hover:r-8"
                        />
                        <text 
                            x={toPx(p.x) + 8} 
                            y={toPx(p.y, true) - 8} 
                            fontSize="10" 
                            fontWeight="bold" 
                            fill="#475569"
                            className="pointer-events-none"
                        >
                            ({p.x}, {p.y})
                        </text>
                    </g>
                  );
              })}
          </svg>

          {/* Equation Badge (Overlaid) */}
          {lineData && (
             <div className="absolute top-2 left-2 bg-amber-100 border border-amber-300 text-amber-800 px-3 py-1.5 rounded-lg shadow-sm">
                 <span className="text-xs font-bold uppercase block text-amber-600/70">Linjens ekvation</span>
                 <span className="font-mono text-lg font-bold tracking-wider">{lineData.equation}</span>
             </div>
          )}
      </div>

      {/* Sidebar Controls */}
      {!isTransparent && (
          <div className="flex-1 flex flex-col min-w-[200px]">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Icons.Graph size={18}/> Punkter
                    </h3>
                    <button onClick={clearAll} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                        Rensa
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[150px] md:max-h-[250px] scrollbar-thin">
                    {points.length === 0 && (
                        <div className="text-center text-slate-400 text-sm mt-4 italic">
                            Klicka i rutnätet för att sätta ut punkter.
                        </div>
                    )}
                    {[...points].reverse().map((p, i) => {
                         const originalIndex = points.length - 1 - i;
                         const isLinePoint = points.length >= 2 && originalIndex >= points.length - 2;

                         return (
                            <div key={p.id} className={`flex justify-between items-center p-2 rounded border ${isLinePoint ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isLinePoint ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                    <span className="font-mono font-semibold text-slate-700">({p.x}, {p.y})</span>
                                </div>
                                <button onClick={() => removePoint(p.id)} className="text-slate-400 hover:text-red-500">
                                    <Icons.Close size={14} />
                                </button>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
                    <p>Två punkter skapar automatiskt en linje.</p>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};