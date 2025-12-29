
import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '../icons';

interface RulerWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const RulerWidget: React.FC<RulerWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [rotation, setRotation] = useState(0);
  const [rulerWidth, setRulerWidth] = useState(450);
  const [unit, setUnit] = useState<'CM' | 'MM'>('CM');
  const [posA, setPosA] = useState(50);
  const [posB, setPosB] = useState(150);
  const [snap, setSnap] = useState(false);
  
  const rotate = (deg: number) => setRotation(r => (r + deg) % 360);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, target: 'A' | 'B') => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const initialPos = target === 'A' ? posA : posB;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const delta = currentX - startX;
        let newPos = initialPos + delta;
        
        if (snap) {
            newPos = Math.round(newPos / 10) * 10;
        }
        
        newPos = Math.max(0, Math.min(rulerWidth, newPos));
        target === 'A' ? setPosA(newPos) : setPosB(newPos);
    };

    const onEnd = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const dist = Math.abs(posA - posB) / 10;

  return (
    <div className="relative group p-16 select-none">
      {/* Precision Controls */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur shadow-2xl border border-slate-200 rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-all z-50">
        <div className="flex items-center gap-1 border-r pr-2 border-slate-200">
            <button onClick={() => rotate(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-400">1°</button>
            <button onClick={() => rotate(-15)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"><Icons.Rotate size={16} className="-scale-x-100" /></button>
            <button onClick={() => setRotation(0)} className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md">0°</button>
            <button onClick={() => rotate(15)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"><Icons.Rotate size={16} /></button>
            <button onClick={() => rotate(1)} className="p-1 hover:bg-slate-100 rounded text-slate-400">1°</button>
        </div>
        
        <div className="flex items-center gap-1 border-r pr-2 border-slate-200">
            <button onClick={() => setSnap(!snap)} className={`text-[10px] font-black px-2 py-1 rounded-md border transition-all ${snap ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-400'}`}>SNAP</button>
            <button onClick={() => setUnit(unit === 'CM' ? 'MM' : 'CM')} className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md">{unit}</button>
        </div>

        <button onClick={() => setTransparent?.(!isTransparent)} className={`p-1.5 rounded-full ${isTransparent ? 'text-blue-600' : 'text-slate-400'}`}><Icons.Maximize size={18} /></button>
      </div>

      {/* Ruler Body */}
      <div 
        className="relative shadow-2xl transition-transform duration-300 flex items-end"
        style={{ 
            width: `${rulerWidth}px`,
            transform: `rotate(${rotation}deg)`, 
            height: '90px',
            background: isTransparent ? 'rgba(255, 255, 240, 0.2)' : 'rgba(255, 255, 245, 0.95)',
            border: '2px solid rgba(180, 150, 50, 0.3)',
            borderRadius: '4px'
        }}
      >
        {/* Ticks */}
        <div className="absolute inset-0 flex pointer-events-none">
            {Array.from({length: Math.floor(rulerWidth / 10) + 1}).map((_, i) => {
                const isCm = i % 10 === 0;
                return (
                    <div key={i} className="flex-1 border-r border-slate-900/10 h-full relative">
                        <div className={`absolute bottom-0 right-0 border-r border-slate-800/60 ${isCm ? 'h-8' : (i%5===0 ? 'h-5' : 'h-3')}`}></div>
                        {isCm && <span className="absolute bottom-9 -right-2 text-[11px] font-black text-slate-800">{unit === 'CM' ? i/10 : i}</span>}
                    </div>
                )
            })}
        </div>

        {/* Marker A */}
        <div className="absolute top-0 bottom-0 z-30 flex flex-col items-center cursor-ew-resize group/ma" style={{ left: posA, transform: 'translateX(-50%)' }} onMouseDown={e => handleDrag(e, 'A')} onTouchStart={e => handleDrag(e, 'A')}>
            <div className="text-[10px] font-bold text-blue-600 mb-1 opacity-0 group-hover/ma:opacity-100">A</div>
            <div className="w-0.5 h-full bg-blue-500 shadow-[0_0_8px_blue]"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white -mt-2 shadow-md"></div>
        </div>

        {/* Marker B */}
        <div className="absolute top-0 bottom-0 z-30 flex flex-col items-center cursor-ew-resize group/mb" style={{ left: posB, transform: 'translateX(-50%)' }} onMouseDown={e => handleDrag(e, 'B')} onTouchStart={e => handleDrag(e, 'B')}>
            <div className="text-[10px] font-bold text-red-600 mb-1 opacity-0 group-hover/mb:opacity-100">B</div>
            <div className="w-0.5 h-full bg-red-500 shadow-[0_0_8px_red]"></div>
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white -mt-2 shadow-md"></div>
        </div>

        {/* Delta Reading */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-black flex gap-2 items-center shadow-xl">
            <span className="opacity-50">AVSTÅND:</span>
            <span className="text-amber-400">{unit === 'CM' ? dist.toFixed(1) : Math.round(dist * 10)} {unit.toLowerCase()}</span>
        </div>

        {/* Length Control */}
        <div className="absolute -right-2 top-0 bottom-0 w-6 cursor-ew-resize flex items-center justify-center hover:bg-black/5" onMouseDown={e => {
            const startX = e.clientX; const startW = rulerWidth;
            const move = (ev: MouseEvent) => setRulerWidth(Math.max(150, Math.min(1200, startW + (ev.clientX - startX))));
            const end = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); };
            window.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
        }}><div className="w-1 h-12 bg-slate-300 rounded-full"></div></div>
      </div>
    </div>
  );
};
