import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../icons';

interface ShapesWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

type ShapeMode = '2D' | '3D';
type ShapeType = 'SQUARE' | 'RECT' | 'TRIANGLE' | 'CIRCLE' | 'CUBE' | 'CYLINDER' | 'SPHERE' | 'CONE';

export const ShapesWidget: React.FC<ShapesWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [mode, setMode] = useState<ShapeMode>('2D');
  const [shape, setShape] = useState<ShapeType>('RECT');
  
  // Dimensions
  const [width, setWidth] = useState(6);  // Base / Side / Radius
  const [height, setHeight] = useState(4); // Height / Side B
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);

  const SCALE = 14; 
  const CX = 140;   
  const CY = 120;   

  // Handle shape switches
  const selectShape = (s: ShapeType) => {
      setShape(s);
      setShowAnswer(false);
      if (s === 'SQUARE' || s === 'CIRCLE' || s === 'CUBE' || s === 'SPHERE') {
          setHeight(width);
      }
  };

  useEffect(() => {
      if (shape === 'SQUARE' || shape === 'CIRCLE' || shape === 'CUBE' || shape === 'SPHERE') {
          setHeight(width);
      }
  }, [width, shape]);

  // --- DRAG LOGIC ---
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging || !svgRef.current) return;
          const CTM = svgRef.current.getScreenCTM();
          if (!CTM) return;
          const svgX = (e.clientX - CTM.e) / CTM.a;
          const svgY = (e.clientY - CTM.f) / CTM.d;
          const dx = svgX - CX;
          const dy = svgY - CY;

          let newW = width;
          let newH = height;

          if (shape === 'CIRCLE' || shape === 'SPHERE') {
              const dist = Math.sqrt(dx*dx + dy*dy);
              newW = Math.round(dist / SCALE);
          } else {
              newW = Math.round((Math.abs(dx) * 2) / SCALE);
              newH = Math.round((Math.abs(dy) * 2) / SCALE);
          }

          newW = Math.max(1, Math.min(15, newW));
          newH = Math.max(1, Math.min(14, newH));

          if (shape === 'SQUARE' || shape === 'CIRCLE' || shape === 'CUBE' || shape === 'SPHERE') {
              setWidth(newW);
              setHeight(newW);
          } else {
              setWidth(newW);
              setHeight(newH);
          }
      };

      const handleMouseUp = () => setIsDragging(false);
      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, shape, width, height]);

  const getStats = () => {
      const w = width;
      const h = height;
      let label1 = "Area";
      let label2 = "Omkrets";
      let val1: string | number = 0;
      let val2: string | number = 0;
      let unit1 = "ae";
      let unit2 = "le";

      switch(shape) {
          case 'SQUARE':
              val1 = w * w; val2 = 4 * w; break;
          case 'RECT':
              val1 = w * h; val2 = 2 * (w + h); break;
          case 'TRIANGLE':
              val1 = (w * h) / 2;
              val2 = (w + 2 * Math.sqrt(Math.pow(h, 2) + Math.pow(w/2, 2))).toFixed(1);
              break;
          case 'CIRCLE':
              val1 = (Math.PI * w * w).toFixed(1);
              val2 = (2 * Math.PI * w).toFixed(1);
              break;
          case 'CUBE':
              label1 = "Volym"; label2 = "Area"; unit1 = "ve";
              val1 = Math.pow(w, 3);
              val2 = 6 * w * w;
              break;
          case 'CYLINDER':
              label1 = "Volym"; label2 = "Mantelyta"; unit1 = "ve";
              val1 = (Math.PI * w * w * h).toFixed(1);
              val2 = (2 * Math.PI * w * h).toFixed(1);
              break;
          case 'SPHERE':
              label1 = "Volym"; label2 = "Area"; unit1 = "ve";
              val1 = ((4/3) * Math.PI * Math.pow(w, 3)).toFixed(1);
              val2 = (4 * Math.PI * w * w).toFixed(1);
              break;
          case 'CONE':
              label1 = "Volym"; label2 = "Basarea"; unit1 = "ve";
              val1 = ((1/3) * Math.PI * w * w * h).toFixed(1);
              val2 = (Math.PI * w * w).toFixed(1);
              break;
      }
      return { label1, label2, val1, val2, unit1, unit2 };
  };

  const stats = getStats();
  const pxW = width * SCALE;
  const pxH = height * SCALE;

  return (
    <div className="w-full h-full flex flex-col gap-4">
        {/* Mode Selector */}
        <div className="flex bg-slate-200 p-1 rounded-xl shrink-0">
            <button 
                onClick={() => { setMode('2D'); selectShape('RECT'); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '2D' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                2D-Figurer
            </button>
            <button 
                onClick={() => { setMode('3D'); selectShape('CUBE'); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '3D' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                3D-Kroppar (Volym)
            </button>
        </div>

        {/* Shape Buttons */}
        <div className="flex justify-center flex-wrap bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
            {mode === '2D' ? (
                <>
                    <button onClick={() => selectShape('SQUARE')} className={`p-2 rounded-lg transition-all ${shape === 'SQUARE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Kvadrat"><div className="w-4 h-4 border-2 border-current rounded-sm"></div></button>
                    <button onClick={() => selectShape('RECT')} className={`p-2 rounded-lg transition-all ${shape === 'RECT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Rektangel"><div className="w-5 h-3 border-2 border-current rounded-sm"></div></button>
                    <button onClick={() => selectShape('TRIANGLE')} className={`p-2 rounded-lg transition-all ${shape === 'TRIANGLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Triangel"><div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-current"></div></button>
                    <button onClick={() => selectShape('CIRCLE')} className={`p-2 rounded-lg transition-all ${shape === 'CIRCLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Cirkel"><div className="w-4 h-4 border-2 border-current rounded-full"></div></button>
                </>
            ) : (
                <>
                    <button onClick={() => selectShape('CUBE')} className={`p-2 rounded-lg transition-all ${shape === 'CUBE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Kub"><Icons.Cube size={18} /></button>
                    <button onClick={() => selectShape('CYLINDER')} className={`p-2 rounded-lg transition-all ${shape === 'CYLINDER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Cylinder"><div className="w-3 h-5 border-2 border-current rounded-full"></div></button>
                    <button onClick={() => selectShape('SPHERE')} className={`p-2 rounded-lg transition-all ${shape === 'SPHERE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Klot"><div className="w-4 h-4 border-2 border-current rounded-full bg-current opacity-20"></div></button>
                    <button onClick={() => selectShape('CONE')} className={`p-2 rounded-lg transition-all ${shape === 'CONE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Kon"><div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-current rounded-b-full"></div></button>
                </>
            )}
        </div>

        {/* Visual Canvas */}
        <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden min-h-[220px]">
             <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 280 240" className="overflow-visible touch-none">
                {/* 2D RENDERING */}
                {shape === 'SQUARE' && <g><rect x={CX - pxW/2} y={CY - pxW/2} width={pxW} height={pxW} fill="#bfdbfe" stroke="#3b82f6" strokeWidth="3" rx="4" />{showLabels && <text x={CX} y={CY + pxW/2 + 20} textAnchor="middle" className="text-[12px] font-bold">s = {width}</text>}</g>}
                {shape === 'RECT' && <g><rect x={CX - pxW/2} y={CY - pxH/2} width={pxW} height={pxH} fill="#fed7aa" stroke="#f97316" strokeWidth="3" rx="4" />{showLabels && <><text x={CX} y={CY + pxH/2 + 20} textAnchor="middle" className="text-[12px] font-bold">b = {width}</text><text x={CX - pxW/2 - 15} y={CY} textAnchor="middle" className="text-[12px] font-bold -rotate-90 origin-center" style={{transformBox: 'fill-box'}}>h = {height}</text></>}</g>}
                {shape === 'TRIANGLE' && <g><polygon points={`${CX},${CY - pxH/2} ${CX - pxW/2},${CY + pxH/2} ${CX + pxW/2},${CY + pxH/2}`} fill="#bbf7d0" stroke="#22c55e" strokeWidth="3" /><line x1={CX} y1={CY - pxH/2} x2={CX} y2={CY + pxH/2} stroke="#15803d" strokeWidth="1" strokeDasharray="4 4" />{showLabels && <><text x={CX} y={CY + pxH/2 + 20} textAnchor="middle" className="text-[12px] font-bold">b = {width}</text><text x={CX + 10} y={CY} className="text-[12px] font-bold">h = {height}</text></>}</g>}
                {shape === 'CIRCLE' && <g><circle cx={CX} cy={CY} r={pxW} fill="#e9d5ff" stroke="#a855f7" strokeWidth="3" /><line x1={CX} y1={CY} x2={CX + pxW} y2={CY} stroke="#6b21a8" strokeWidth="2" />{showLabels && <text x={CX + pxW/2} y={CY - 10} textAnchor="middle" className="text-[12px] font-bold">r = {width}</text>}</g>}

                {/* 3D RENDERING */}
                {shape === 'CUBE' && (
                    <g transform={`translate(${CX - pxW/2}, ${CY - pxW/2})`}>
                        <rect width={pxW} height={pxW} fill="#3b82f6" opacity="0.8" />
                        <path d={`M0,0 L15,-15 L${pxW+15},-15 L${pxW},0 Z`} fill="#60a5fa" />
                        <path d={`M${pxW},0 L${pxW+15},-15 L${pxW+15},${pxW-15} L${pxW},${pxW} Z`} fill="#2563eb" />
                        {showLabels && <text x={pxW/2} y={pxW + 20} textAnchor="middle" className="text-[12px] font-bold">s = {width}</text>}
                    </g>
                )}
                {shape === 'CYLINDER' && (
                    <g transform={`translate(${CX}, ${CY})`}>
                        <ellipse cx="0" cy={pxH/2} rx={pxW} ry={pxW/3} fill="#f97316" />
                        <rect x={-pxW} y={-pxH/2} width={pxW*2} height={pxH} fill="#fb923c" />
                        <ellipse cx="0" cy={-pxH/2} rx={pxW} ry={pxW/3} fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
                        {showLabels && <><text x={pxW + 15} y="0" className="text-[12px] font-bold">h = {height}</text><text x="0" y={-pxH/2 - pxW/3 - 10} textAnchor="middle" className="text-[12px] font-bold">r = {width}</text></>}
                    </g>
                )}
                {shape === 'SPHERE' && (
                    <g transform={`translate(${CX}, ${CY})`}>
                        <defs>
                            <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="#d8b4fe" />
                                <stop offset="100%" stopColor="#7e22ce" />
                            </radialGradient>
                        </defs>
                        <circle r={pxW} fill="url(#sphereGrad)" stroke="#6b21a8" strokeWidth="2" />
                        <ellipse cx="0" cy="0" rx={pxW} ry={pxW/3} fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                        {showLabels && <text x={pxW/2} y="-10" textAnchor="middle" className="text-[12px] font-bold" fill="white">r = {width}</text>}
                    </g>
                )}
                {shape === 'CONE' && (
                    <g transform={`translate(${CX}, ${CY})`}>
                        <ellipse cx="0" cy={pxH/2} rx={pxW} ry={pxW/3} fill="#bbf7d0" stroke="#166534" strokeWidth="2" />
                        <path d={`M${-pxW},${pxH/2} L0,${-pxH/2} L${pxW},${pxH/2} Z`} fill="#4ade80" />
                        {showLabels && <><text x={pxW + 10} y="0" className="text-[12px] font-bold">h = {height}</text><text x="0" y={pxH/2 + pxW/3 + 15} textAnchor="middle" className="text-[12px] font-bold">r = {width}</text></>}
                    </g>
                )}

                {/* RESIZE HANDLE */}
                <circle cx={CX + (shape === 'CIRCLE' || shape === 'SPHERE' ? pxW : pxW/2)} cy={CY + (shape === 'CIRCLE' || shape === 'SPHERE' ? 0 : pxH/2)} r="8" fill="#f59e0b" stroke="white" strokeWidth="2" onMouseDown={handleMouseDown} className="cursor-nwse-resize hover:scale-125 transition-transform" />
             </svg>
        </div>

        {/* Answer Box */}
        <div className="flex flex-col gap-3 shrink-0">
             <button onClick={() => setShowAnswer(!showAnswer)} className={`w-full py-2.5 border-2 rounded-xl font-bold transition-all ${showAnswer ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                {showAnswer ? 'Dölj Beräkningar' : 'Visa Beräkningar'}
            </button>
            {showAnswer && (
                <div className="flex gap-3 animate-in slide-in-from-top-2">
                    <div className="flex-1 bg-blue-100 p-2.5 rounded-lg text-center border border-blue-200">
                        <div className="text-[10px] font-bold text-blue-600 uppercase">{stats.label1}</div>
                        <div className="text-xl font-bold text-blue-900">{stats.val1} <span className="text-xs font-normal text-blue-600/70">{stats.unit1}</span></div>
                    </div>
                    <div className="flex-1 bg-emerald-100 p-2.5 rounded-lg text-center border border-emerald-200">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase">{stats.label2}</div>
                        <div className="text-xl font-bold text-emerald-900">{stats.val2} <span className="text-xs font-normal text-emerald-600/70">{stats.unit2}</span></div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};