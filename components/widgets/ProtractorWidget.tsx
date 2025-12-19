import React, { useState } from 'react';
import { Icons } from '../icons';

interface ProtractorWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const ProtractorWidget: React.FC<ProtractorWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const rotate = (deg: number) => setRotation(r => (r + deg) % 360);

  return (
    <div className="relative group p-12">
      {/* Tooltip Controls */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button onClick={() => rotate(-15)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Vrid -15°"><Icons.Rotate size={16} className="-scale-x-100" /></button>
        <button onClick={() => setRotation(0)} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded">0°</button>
        <button onClick={() => rotate(15)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Vrid +15°"><Icons.Rotate size={16} /></button>
        <div className="w-px h-4 bg-slate-200 mx-1"></div>
        <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-slate-400">SKALA</span>
            <input 
                type="range" min="0.5" max="2" step="0.1" 
                value={scale} 
                onChange={e => setScale(Number(e.target.value))}
                className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
        <div className="w-px h-4 bg-slate-200 mx-1"></div>
        <button onClick={() => setTransparent?.(!isTransparent)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Visa/Dölj ram">
            {isTransparent ? <Icons.Maximize size={16} /> : <Icons.Minimize size={16} />}
        </button>
      </div>

      {/* Protractor Body */}
      <div 
         className="relative shadow-2xl origin-bottom transition-all duration-300"
         style={{ 
             width: `${320 * scale}px`,
             height: `${160 * scale}px`,
             transform: `rotate(${rotation}deg)`, 
             background: 'rgba(59, 130, 246, 0.05)', // Reduced opacity from 0.15 to 0.05
             backdropFilter: 'none', // Removed blur(6px) for clarity
             borderTopLeftRadius: '1000px',
             borderTopRightRadius: '1000px',
             border: '2px solid rgba(59, 130, 246, 0.2)', // Reduced border opacity
             borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
         }}
      >
          {/* Origin Point */}
          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-600 rounded-full -translate-x-1/2 translate-y-1/2 z-20 border-2 border-white shadow-sm"></div>
          
          {/* Outer Ticks */}
          {Array.from({length: 19}).map((_, i) => {
              const angle = i * 10;
              return (
                  <div 
                    key={i} 
                    className="absolute bottom-0 left-1/2 h-full w-[1px] origin-bottom pointer-events-none"
                    style={{ transform: `rotate(${angle - 90}deg)` }}
                  >
                      <div className="absolute top-0 w-[1px] h-4 bg-blue-800/80"></div>
                      <span 
                        className="absolute top-5 left-1/2 -translate-x-1/2 text-blue-900 font-black font-mono pointer-events-none"
                        style={{ 
                            fontSize: `${Math.max(8, 10 * scale)}px`,
                            transform: `translateX(-50%) rotate(${90 - (angle - 90)}deg)` 
                        }}
                      >
                          {angle}
                      </span>
                  </div>
              )
          })}

          {/* 5-degree Ticks */}
          {Array.from({length: 37}).map((_, i) => {
              if (i % 2 === 0) return null;
              const angle = i * 5;
              return (
                  <div 
                    key={i} 
                    className="absolute bottom-0 left-1/2 h-full w-[1px] origin-bottom pointer-events-none"
                    style={{ transform: `rotate(${angle - 90}deg)` }}
                  >
                      <div className="absolute top-0 w-[1px] h-2 bg-blue-800/40"></div>
                  </div>
              )
          })}

          {/* Brand/Decoration */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <div className="text-[10px] text-blue-800 font-black tracking-widest opacity-30 uppercase">Matteytan</div>
          </div>
      </div>
    </div>
  );
};