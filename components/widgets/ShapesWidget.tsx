import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../icons';

interface ShapesWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

type ShapeType = 'SQUARE' | 'RECT' | 'TRIANGLE' | 'CIRCLE';

export const ShapesWidget: React.FC<ShapesWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [shape, setShape] = useState<ShapeType>('RECT');
  
  // Dimensions (Integers)
  const [width, setWidth] = useState(6);  // Base / Side / Radius (if circle)
  const [height, setHeight] = useState(4); // Height / Side B
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [showLabels, setShowLabels] = useState(true); // Toggle dimension text on shape
  const [isDragging, setIsDragging] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Constants for rendering
  const SCALE = 14; // Pixels per unit
  const CX = 140;   // Center X of viewBox
  const CY = 120;   // Center Y of viewBox

  // Sync square/circle dimensions
  useEffect(() => {
      if (shape === 'SQUARE') setHeight(width);
      if (shape === 'CIRCLE') setHeight(width);
  }, [shape]);

  // --- DRAG LOGIC ---
  
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging || !svgRef.current) return;

          // Convert mouse screen pos to SVG coordinates
          const CTM = svgRef.current.getScreenCTM();
          if (!CTM) return;
          
          const svgX = (e.clientX - CTM.e) / CTM.a;
          const svgY = (e.clientY - CTM.f) / CTM.d;

          // Calculate distance from center
          const dx = svgX - CX;
          const dy = svgY - CY;

          // Convert back to units (and snap to integer)
          let newW = width;
          let newH = height;

          if (shape === 'CIRCLE') {
              // Radius is distance from center
              const dist = Math.sqrt(dx*dx + dy*dy);
              newW = Math.round(dist / SCALE);
          } else {
              // For Rect/Square/Triangle, we treat drag from center to bottom-right corner
              newW = Math.round((Math.abs(dx) * 2) / SCALE);
              newH = Math.round((Math.abs(dy) * 2) / SCALE);
          }

          // Constraints (Min 1 unit, Max ~18 units to fit canvas)
          newW = Math.max(1, Math.min(18, newW));
          newH = Math.max(1, Math.min(16, newH));

          if (shape === 'SQUARE') {
              const maxDim = Math.max(newW, newH);
              setWidth(maxDim);
              setHeight(maxDim);
          } else if (shape === 'CIRCLE') {
              setWidth(newW);
              setHeight(newW);
          } else {
              setWidth(newW);
              setHeight(newH);
          }
      };

      const handleMouseUp = () => {
          setIsDragging(false);
      };

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, shape, width, height]);


  const randomize = () => {
      const min = 2;
      const max = 10;
      
      const newW = Math.floor(Math.random() * (max - min + 1)) + min;
      
      if (shape === 'SQUARE' || shape === 'CIRCLE') {
          setWidth(newW);
          setHeight(newW);
      } else {
          const newH = Math.floor(Math.random() * (max - min + 1)) + min;
          setWidth(newW);
          setHeight(newH);
      }
      setShowAnswer(false);
  };

  // --- MANUAL INPUT HANDLERS ---
  const handleDimChange = (val: string, dim: 'W' | 'H') => {
      let v = parseInt(val, 10);
      if (isNaN(v)) v = 1;
      // Clamp
      v = Math.max(1, Math.min(18, v));
      
      if (dim === 'W') {
          setWidth(v);
          if (shape === 'SQUARE' || shape === 'CIRCLE') setHeight(v);
      } else {
          setHeight(v);
          if (shape === 'SQUARE' || shape === 'CIRCLE') setWidth(v);
      }
  };

  const getStats = () => {
      let area = 0;
      let perim = 0;
      const w = width;
      const h = height;

      switch(shape) {
          case 'SQUARE':
              area = w * w;
              perim = 4 * w;
              break;
          case 'RECT':
              area = w * h;
              perim = 2 * (w + h);
              break;
          case 'TRIANGLE':
              area = (w * h) / 2;
              // Isosceles triangle assumption for perimeter calculation based on w (base) and h (height)
              const side = Math.sqrt(Math.pow(h, 2) + Math.pow(w/2, 2));
              perim = w + 2 * side;
              break;
          case 'CIRCLE':
              area = Math.PI * Math.pow(w, 2);
              perim = 2 * Math.PI * w;
              break;
      }
      return { 
          area: Number.isInteger(area) ? area : area.toFixed(1), 
          perim: Number.isInteger(perim) ? perim : perim.toFixed(1) 
      };
  };

  const stats = getStats();
  
  // Render Variables
  const pxW = width * SCALE;
  const pxH = height * SCALE;

  // Calculate Handle Position
  let handleX = 0;
  let handleY = 0;

  if (shape === 'CIRCLE') {
      handleX = CX + pxW; // Right edge
      handleY = CY;
  } else {
      handleX = CX + pxW / 2; // Right edge
      handleY = CY + pxH / 2; // Bottom edge
  }


  return (
    <div className="w-full h-full flex flex-col gap-4">
        
        {/* Shape Selectors */}
        <div className="flex justify-center flex-wrap bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
            <button onClick={() => {setShape('SQUARE'); setHeight(width);}} className={`p-2 rounded-lg transition-all ${shape === 'SQUARE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Kvadrat">
                <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
            </button>
            <button onClick={() => setShape('RECT')} className={`p-2 rounded-lg transition-all ${shape === 'RECT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Rektangel">
                <div className="w-5 h-3 border-2 border-current rounded-sm"></div>
            </button>
            <button onClick={() => setShape('TRIANGLE')} className={`p-2 rounded-lg transition-all ${shape === 'TRIANGLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Triangel">
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-current"></div>
            </button>
            <button onClick={() => {setShape('CIRCLE'); setHeight(width);}} className={`p-2 rounded-lg transition-all ${shape === 'CIRCLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Cirkel">
                <div className="w-4 h-4 border-2 border-current rounded-full"></div>
            </button>
        </div>

        {/* INPUTS & VISIBILITY CONTROLS */}
        <div className="flex items-center justify-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
            {/* Width / Radius Input */}
            <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                    {shape === 'CIRCLE' ? 'Radie:' : shape === 'SQUARE' ? 'Sida:' : 'Bas:'}
                </label>
                <input 
                    type="number" 
                    value={width} 
                    onChange={(e) => handleDimChange(e.target.value, 'W')}
                    className="w-12 text-center text-sm font-bold border rounded py-1 focus:ring-2 ring-blue-200 outline-none"
                    min="1" max="18"
                />
            </div>

            {/* Height Input (Only for Rect/Triangle) */}
            {(shape === 'RECT' || shape === 'TRIANGLE') && (
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Höjd:</label>
                    <input 
                        type="number" 
                        value={height} 
                        onChange={(e) => handleDimChange(e.target.value, 'H')}
                        className="w-12 text-center text-sm font-bold border rounded py-1 focus:ring-2 ring-blue-200 outline-none"
                        min="1" max="16"
                    />
                </div>
            )}

            {/* Toggle Labels */}
            <button 
                onClick={() => setShowLabels(!showLabels)}
                className={`p-1.5 rounded-md transition-colors ${showLabels ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
                title={showLabels ? "Dölj mått på figuren" : "Visa mått på figuren"}
            >
                {showLabels ? <Icons.Book size={18} /> : <Icons.Book size={18} className="opacity-50" />}
            </button>
        </div>

        {/* Visual Canvas */}
        <div className="relative flex-1 bg-slate-50/50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden min-h-[200px] cursor-crosshair">
             <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
             
             <svg 
                ref={svgRef}
                width="100%" height="100%" 
                viewBox="0 0 280 240" 
                preserveAspectRatio="xMidYMid meet" 
                className="overflow-visible touch-none"
            >
                <defs>
                    <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
                        <path d="M6,0 L0,3 L6,6" fill="#64748b" />
                    </marker>
                    <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill="#64748b" />
                    </marker>
                </defs>

                {/* --- SHAPES --- */}

                {shape === 'SQUARE' && (
                    <g>
                        <rect x={CX - pxW/2} y={CY - pxW/2} width={pxW} height={pxW} fill="#bfdbfe" stroke="#3b82f6" strokeWidth="3" rx="4" />
                        {showLabels && <text x={CX} y={CY + pxW/2 + 20} textAnchor="middle" fill="#1e293b" fontWeight="bold">s = {width}</text>}
                    </g>
                )}
                {shape === 'RECT' && (
                    <g>
                        <rect x={CX - pxW/2} y={CY - pxH/2} width={pxW} height={pxH} fill="#fed7aa" stroke="#f97316" strokeWidth="3" rx="4" />
                        {showLabels && (
                            <>
                                <text x={CX} y={CY + pxH/2 + 20} textAnchor="middle" fill="#1e293b" fontWeight="bold">b = {width}</text>
                                <text x={CX - pxW/2 - 15} y={CY} textAnchor="middle" fill="#1e293b" fontWeight="bold" className="rotate-[-90deg]" style={{transformBox: 'fill-box', transformOrigin: 'center'}}>h = {height}</text>
                            </>
                        )}
                    </g>
                )}
                {shape === 'TRIANGLE' && (
                    <g>
                        <polygon points={`${CX},${CY - pxH/2} ${CX - pxW/2},${CY + pxH/2} ${CX + pxW/2},${CY + pxH/2}`} fill="#bbf7d0" stroke="#22c55e" strokeWidth="3" strokeLinejoin="round" />
                        <line x1={CX} y1={CY - pxH/2} x2={CX} y2={CY + pxH/2} stroke="#15803d" strokeWidth="2" strokeDasharray="4 4" />
                        {showLabels && (
                            <>
                                <text x={CX} y={CY + pxH/2 + 20} textAnchor="middle" fill="#1e293b" fontWeight="bold">b = {width}</text>
                                <text x={CX + 10} y={CY} textAnchor="start" fill="#14532d" fontWeight="bold" fontSize="12">h = {height}</text>
                            </>
                        )}
                    </g>
                )}
                {shape === 'CIRCLE' && (
                    <g>
                        <circle cx={CX} cy={CY} r={pxW} fill="#e9d5ff" stroke="#a855f7" strokeWidth="3" />
                        <line x1={CX} y1={CY} x2={CX + pxW} y2={CY} stroke="#6b21a8" strokeWidth="2" />
                         <circle cx={CX} cy={CY} r="3" fill="#6b21a8" />
                        {showLabels && <text x={CX + pxW/2} y={CY - 10} textAnchor="middle" fill="#6b21a8" fontWeight="bold">r = {width}</text>}
                    </g>
                )}

                {/* --- RESIZE HANDLE --- */}
                <g 
                    transform={`translate(${handleX}, ${handleY})`} 
                    onMouseDown={handleMouseDown}
                    className="cursor-nwse-resize hover:scale-125 transition-transform"
                    style={{ cursor: shape === 'CIRCLE' ? 'ew-resize' : 'nwse-resize' }}
                >
                    <circle r="8" fill="#f59e0b" stroke="white" strokeWidth="2" className="shadow-sm drop-shadow-md" />
                    <circle r="3" fill="white" />
                </g>

             </svg>
        </div>

        {/* Controls - Shrink */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
             <button onClick={randomize} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                <Icons.Reset size={18} /> SLUMPA MÅTT
            </button>
             <button onClick={() => setShowAnswer(!showAnswer)} className={`flex-1 py-3 border-2 rounded-xl font-bold transition-all text-sm sm:text-base ${showAnswer ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                {showAnswer ? 'Dölj Facit' : 'Visa Facit'}
            </button>
        </div>

        {/* Answer Box */}
        {showAnswer && (
            <div className="flex gap-4 animate-in slide-in-from-top-2 shrink-0">
                <div className="flex-1 bg-blue-100 p-2 rounded-lg text-center border border-blue-200">
                    <div className="text-[10px] font-bold text-blue-600 uppercase">Area</div>
                    <div className="text-lg sm:text-xl font-bold text-blue-900">{stats.area} <span className="text-sm font-normal text-blue-600/70">ae</span></div>
                </div>
                <div className="flex-1 bg-emerald-100 p-2 rounded-lg text-center border border-emerald-200">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase">Omkrets</div>
                    <div className="text-lg sm:text-xl font-bold text-emerald-900">{stats.perim} <span className="text-sm font-normal text-emerald-600/70">le</span></div>
                </div>
            </div>
        )}
    </div>
  );
};