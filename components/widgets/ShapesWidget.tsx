import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface ShapesWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

type ShapeType = 'SQUARE' | 'RECT' | 'TRIANGLE' | 'CIRCLE';

export const ShapesWidget: React.FC<ShapesWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [shape, setShape] = useState<ShapeType>('RECT');
  
  // Dimensions
  const [width, setWidth] = useState(5);  // Base / Side / Radius (if circle)
  const [height, setHeight] = useState(3); // Height / Side B
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [animate, setAnimate] = useState(false);

  const randomize = () => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);
      
      const min = 2;
      const max = 12;
      
      setWidth(Math.floor(Math.random() * (max - min + 1)) + min);
      setHeight(Math.floor(Math.random() * (max - min + 1)) + min);
      setShowAnswer(false);
  };

  useEffect(() => {
      if (shape === 'SQUARE') setHeight(width);
      if (shape === 'CIRCLE') setHeight(width);
  }, [shape, width]);

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
  const SCALE = 14;
  const pxW = width * SCALE;
  const pxH = height * SCALE;
  const cX = 140; 
  const cY = 120;

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

        {/* Visual Canvas - using flex-1 to fill available space */}
        <div className="relative flex-1 bg-slate-50/50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden min-h-[200px]">
             <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
             
             <svg width="100%" height="100%" viewBox="0 0 280 240" preserveAspectRatio="xMidYMid meet" className={`overflow-visible transition-all duration-500 ease-out ${animate ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                <defs>
                    <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
                        <path d="M6,0 L0,3 L6,6" fill="#64748b" />
                    </marker>
                    <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill="#64748b" />
                    </marker>
                </defs>

                {shape === 'SQUARE' && (
                    <g>
                        <rect x={cX - pxW/2} y={cY - pxW/2} width={pxW} height={pxW} fill="#bfdbfe" stroke="#3b82f6" strokeWidth="3" rx="4" />
                        <text x={cX} y={cY + pxW/2 + 20} textAnchor="middle" fill="#1e293b" fontWeight="bold">s = {width}</text>
                    </g>
                )}
                {shape === 'RECT' && (
                    <g>
                        <rect x={cX - pxW/2} y={cY - pxH/2} width={pxW} height={pxH} fill="#fed7aa" stroke="#f97316" strokeWidth="3" rx="4" />
                        <text x={cX} y={cY + pxH/2 + 20} textAnchor="middle" fill="#1e293b" fontWeight="bold">b = {width}</text>
                        <text x={cX - pxW/2 - 15} y={cY} textAnchor="middle" fill="#1e293b" fontWeight="bold" className="rotate-[-90deg]" style={{transformBox: 'fill-box', transformOrigin: 'center'}}>h = {height}</text>
                    </g>
                )}
                {shape === 'TRIANGLE' && (
                    <g>
                        <polygon points={`${cX},${cY - pxH/2} ${cX - pxW/2},${cY + pxH/2} ${cX + pxW/2},${cY + pxH/2}`} fill="#bbf7d0" stroke="#22c55e" strokeWidth="3" strokeLinejoin="round" />
                        <line x1={cX} y1={cY - pxH/2} x2={cX} y2={cY + pxH/2} stroke="#15803d" strokeWidth="2" strokeDasharray="4 4" />
                        <text x={cX} y={cY + pxH/2 + 20} textAnchor="middle" fill="#1e293b" fontWeight="bold">b = {width}</text>
                        <text x={cX + 10} y={cY} textAnchor="start" fill="#14532d" fontWeight="bold" fontSize="12">h = {height}</text>
                    </g>
                )}
                {shape === 'CIRCLE' && (
                    <g>
                        <circle cx={cX} cy={cY} r={pxW} fill="#e9d5ff" stroke="#a855f7" strokeWidth="3" />
                        <line x1={cX} y1={cY} x2={cX + pxW} y2={cY} stroke="#6b21a8" strokeWidth="2" />
                         <circle cx={cX} cy={cY} r="3" fill="#6b21a8" />
                        <text x={cX + pxW/2} y={cY - 5} textAnchor="middle" fill="#6b21a8" fontWeight="bold">r = {width}</text>
                    </g>
                )}
             </svg>
        </div>

        {/* Controls - Shrink */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
             <button onClick={randomize} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                <Icons.Reset size={18} className={animate ? 'animate-spin' : ''} /> SLUMPA MÅTT
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