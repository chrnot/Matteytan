
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
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
    color: string;
}

export const NumberLineWidget: React.FC<NumberLineWidgetProps> = ({ isTransparent, setTransparent }) => {
  // Start centered around 0 with a comfortable initial range
  const [range, setRange] = useState({ min: -25, max: 25 });
  const [scale, setScale] = useState(1); 
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [markerPos, setMarkerPos] = useState(0);
  const [snapToInteger, setSnapToInteger] = useState(true);
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const baseWidthPerUnit = 60; 
  const widthPerUnit = baseWidthPerUnit * scale; 
  const totalUnits = range.max - range.min;
  const totalWidth = totalUnits * widthPerUnit + 200; // Padding
  const LINE_Y = 140; 

  // Hjälpfunktion för att få intern SVG-koordinat från mus-event
  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    
    // Transformera skärmpixel till SVG-koordinat med hänsyn till allt (scroll, zoom, CSS)
    const transformedPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return transformedPt;
  }, []);

  const getX = useCallback((val: number) => {
    return (val - range.min) * widthPerUnit + 100;
  }, [range.min, widthPerUnit]);

  const getValFromX = useCallback((svgX: number) => {
    const val = (svgX - 100) / widthPerUnit + range.min;
    return snapToInteger ? Math.round(val) : Math.round(val * 10) / 10;
  }, [range.min, widthPerUnit, snapToInteger]);

  // Centrera nollan direkt vid start
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
            const targetX = getX(0);
            const containerWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollLeft = targetX - containerWidth / 2;
        }
    }, 50); // Liten delay för att säkerställa att layouten är klar
    return () => clearTimeout(timer);
  }, []); 

  const addJump = (to: number) => {
    if (to === markerPos) return;
    
    const diff = to - markerPos;
    const isPositive = diff > 0;
    const label = isPositive ? `+${snapToInteger ? diff : diff.toFixed(1)}` : `${snapToInteger ? diff : diff.toFixed(1)}`;
    
    const newJump: Jump = {
        start: markerPos,
        end: to,
        label,
        id: Date.now(),
        color: isPositive ? '#10b981' : '#ef4444'
    };

    setJumps(prev => [...prev, newJump]);
    setMarkerPos(to);

    // Expandera intervallet om vi rör oss mot kanterna
    if (to > range.max - 3) setRange(r => ({ ...r, max: Math.ceil(to + 15) }));
    if (to < range.min + 3) setRange(r => ({ ...r, min: Math.floor(to - 15) }));
  };

  const handleLineClick = (e: React.MouseEvent) => {
    const pt = getSVGPoint(e.clientX, e.clientY);
    const val = getValFromX(pt.x);
    addJump(val);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pt = getSVGPoint(e.clientX, e.clientY);
    setHoverVal(getValFromX(pt.x));
  };

  const undoLastJump = () => {
    if (jumps.length === 0) {
        setMarkerPos(0);
        return;
    }
    const newJumps = [...jumps];
    const last = newJumps.pop();
    setJumps(newJumps);
    setMarkerPos(last ? last.start : 0);
  };

  const equation = jumps.length > 0 
    ? jumps[0].start + " " + jumps.map(j => (j.label.startsWith('+') ? "+ " + j.label.substring(1) : "- " + j.label.substring(1))).join(" ") + " = " + markerPos
    : markerPos.toString();

  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-hidden bg-white select-none">
      
      {/* 1. Header & Equation Bar */}
      <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0 shadow-sm">
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-1.5 rounded-xl border-2 border-blue-100 shadow-sm">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block leading-none mb-1">Position</span>
                    <span className="text-2xl font-black text-slate-800 tabular-nums">{markerPos}</span>
                </div>
                {jumps.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-white shadow-lg animate-in slide-in-from-left-4">
                        <Icons.Math size={18} className="opacity-70" />
                        <span className="text-sm font-black font-mono">{equation}</span>
                    </div>
                )}
            </div>
            
            <div className="flex gap-1.5">
                <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm" title="Zooma ut"><Icons.Minimize size={18} /></button>
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm" title="Zooma in"><Icons.Plus size={18} /></button>
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                <button onClick={undoLastJump} disabled={jumps.length === 0} className="p-2 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50 disabled:opacity-30 shadow-sm" title="Ångra"><Icons.Reset size={18} /></button>
                <button onClick={() => { setJumps([]); setMarkerPos(0); }} className="p-2 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 shadow-sm" title="Rensa"><Icons.Trash size={18} /></button>
            </div>
        </div>

        <div className="flex items-center gap-4 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${snapToInteger ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <input type="checkbox" checked={snapToInteger} onChange={e => setSnapToInteger(e.target.checked)} className="sr-only" />
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${snapToInteger ? 'left-6' : 'left-1'}`}></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Hela tal</span>
            </label>
        </div>
      </div>

      {/* 2. Number Line Visualization */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto border-2 border-slate-100 rounded-2xl bg-slate-50/20 relative select-none scrollbar-thin w-full min-h-0"
      >
        <svg 
            ref={svgRef}
            width={totalWidth} 
            height="100%" 
            viewBox={`0 0 ${totalWidth} 260`} 
            className="cursor-crosshair block"
            onClick={handleLineClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverVal(null)}
        >
          {/* Transparent klickbar bakgrund */}
          <rect x="0" y="0" width={totalWidth} height="260" fill="transparent" />

          {/* Tallinjen */}
          <line x1="0" y1={LINE_Y} x2={totalWidth} y2={LINE_Y} stroke="#334155" strokeWidth="3" strokeLinecap="round" className="pointer-events-none" />
          
          {/* Graderingar & Siffror */}
          {Array.from({ length: totalUnits + 1 }).map((_, i) => {
            const val = range.min + i;
            const x = getX(val);
            const isZero = val === 0;
            const isMajor = val % 5 === 0;
            const shouldShowLabel = scale < 0.6 ? isMajor : true;

            return (
              <g key={val} className="pointer-events-none">
                <line 
                    x1={x} y1={LINE_Y - (isMajor ? 12 : 6)} x2={x} y2={LINE_Y + (isMajor ? 12 : 6)} 
                    stroke={isZero ? "#000" : (isMajor ? "#475569" : "#cbd5e1")} 
                    strokeWidth={isZero ? 4 : (isMajor ? 2 : 1)} 
                />
                {shouldShowLabel && (
                    <text x={x} y={LINE_Y + 36} textAnchor="middle" fontSize={isZero ? 18 : (isMajor ? 14 : 12)} fill={isZero ? '#000' : (isMajor ? '#334155' : '#94a3b8')} fontWeight={isZero || isMajor ? '900' : 'bold'} className="font-mono">
                        {val}
                    </text>
                )}
              </g>
            );
          })}

          {/* Hover-indikator (Hjälper användaren att se exakt klick) */}
          {hoverVal !== null && (
              <g transform={`translate(${getX(hoverVal)}, ${LINE_Y})`} className="pointer-events-none">
                <circle r="8" fill="#3b82f6" opacity="0.2" className="animate-pulse" />
                <line y1="-10" y2="10" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
              </g>
          )}

          {/* Båghopp */}
          {jumps.map((jump, index) => {
            const x1 = getX(jump.start);
            const x2 = getX(jump.end);
            const midX = (x1 + x2) / 2;
            const diff = Math.abs(jump.end - jump.start);
            const height = Math.min(diff * 12 * scale, 120) + (index % 3) * 10;

            return (
              <g key={jump.id} className="pointer-events-none animate-in fade-in duration-300">
                <path d={`M ${x1} ${LINE_Y} Q ${midX} ${LINE_Y - height} ${x2} ${LINE_Y}`} fill="none" stroke={jump.color} strokeWidth="3.5" strokeDasharray={scale < 0.8 ? "none" : "8,5"} strokeLinecap="round" />
                <g transform={`translate(${midX}, ${LINE_Y - (height / 2) - 15})`}>
                    <rect x="-18" y="-10" width="36" height="20" rx="6" fill="white" stroke={jump.color} strokeWidth="2" />
                    <text textAnchor="middle" y="4" fontSize="11" fill={jump.color} fontWeight="900" className="font-mono">{jump.label}</text>
                </g>
              </g>
            );
          })}

          {/* Aktuell Markör (Pucken) */}
          <g transform={`translate(${getX(markerPos)}, ${LINE_Y})`} className="transition-transform duration-500 ease-out pointer-events-none">
             <circle r="12" fill="#3b82f6" stroke="white" strokeWidth="3" className="shadow-lg" />
             <circle r="18" fill="rgba(59, 130, 246, 0.2)" className="animate-pulse" />
          </g>
        </svg>
      </div>
      
      {/* 3. Footer */}
      <div className="px-4 py-2 bg-slate-100/50 rounded-xl flex justify-between items-center shrink-0">
          <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black text-slate-500 uppercase">Addition</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-black text-slate-500 uppercase">Subtraktion</span></div>
          </div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Klicka på tallinjen för att hoppa</span>
      </div>
    </div>
  );
};
