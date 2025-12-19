
import React, { useState } from 'react';
import { Icons } from '../icons';

interface RulerWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const RulerWidget: React.FC<RulerWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [rotation, setRotation] = useState(0);
  const [rulerWidth, setRulerWidth] = useState(400);
  const [unit, setUnit] = useState<'CM' | 'MM'>('CM');

  const rotate = (deg: number) => setRotation(r => (r + deg) % 360);

  return (
    <div className="relative group p-8">
      {/* Tooltip Controls (Visible on hover or if not fully transparent) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button onClick={() => rotate(-15)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Vrid -15°"><Icons.Rotate size={16} className="-scale-x-100" /></button>
        <button onClick={() => setRotation(0)} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded hover:bg-slate-200">0°</button>
        <button onClick={() => rotate(15)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Vrid +15°"><Icons.Rotate size={16} /></button>
        <div className="w-px h-4 bg-slate-200 mx-1"></div>
        <button onClick={() => setUnit(u => u === 'CM' ? 'MM' : 'CM')} className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">{unit}</button>
        <div className="w-px h-4 bg-slate-200 mx-1"></div>
        <button onClick={() => setTransparent?.(!isTransparent)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Visa/Dölj ram">
            {isTransparent ? <Icons.Maximize size={16} /> : <Icons.Minimize size={16} />}
        </button>
      </div>

      {/* Ruler Body */}
      <div 
        className="relative shadow-2xl select-none flex transition-transform duration-300 origin-center"
        style={{ 
            width: `${rulerWidth}px`,
            transform: `rotate(${rotation}deg)`, 
            height: '70px',
            background: 'rgba(255, 255, 230, 0.05)', // Reduced from 0.9 to 0.05
            backdropFilter: 'none', // Removed blur(4px)
            border: '2px solid rgba(234, 179, 8, 0.2)', // Reduced from 0.4 to 0.2
            borderRadius: '4px'
        }}
      >
        {/* Ticks */}
        <div className="absolute bottom-0 w-full h-full flex overflow-hidden pointer-events-none">
            {Array.from({length: Math.floor(rulerWidth / 10) + 1}).map((_, i) => {
                const isCmMark = i % 10 === 0;
                const isMidMark = i % 5 === 0 && !isCmMark;
                
                return (
                    <div key={i} className="flex-1 border-r border-slate-800/20 h-full relative min-w-[10px]">
                        <div className={`absolute bottom-0 right-0 border-r border-slate-800/80 ${isCmMark ? 'h-7' : (isMidMark ? 'h-5' : 'h-3')}`}></div>
                         {isCmMark && (
                            <span className="absolute bottom-8 -right-2 text-[11px] font-black text-slate-800 font-mono">
                                {unit === 'CM' ? i/10 : i}
                            </span>
                         )}
                    </div>
                )
            })}
        </div>
        
        <div className="absolute top-2 left-3 text-[10px] font-black text-yellow-700/50 italic tracking-widest pointer-events-none">LINJAL ({unit.toLowerCase()})</div>

        {/* Resize Handle (Length) */}
        <div className="absolute -right-3 top-0 h-full w-8 cursor-ew-resize flex items-center justify-center hover:bg-yellow-500/10 rounded-r group-hover:scale-x-110 transition-transform"
             onMouseDown={(e) => {
                 e.stopPropagation();
                 const startX = e.clientX;
                 const startW = rulerWidth;
                 const handleMove = (ev: MouseEvent) => {
                     setRulerWidth(Math.max(100, Math.min(1200, startW + (ev.clientX - startX))));
                 };
                 const handleUp = () => {
                     window.removeEventListener('mousemove', handleMove);
                     window.removeEventListener('mouseup', handleUp);
                 }
                 window.addEventListener('mousemove', handleMove);
                 window.addEventListener('mouseup', handleUp);
             }}
        >
            <div className="w-1.5 h-10 bg-yellow-600/30 rounded-full shadow-inner border border-yellow-600/10"></div>
        </div>
      </div>
    </div>
  );
};
