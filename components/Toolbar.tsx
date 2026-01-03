
import React, { useState } from 'react';
import { Icons } from './icons';
import { WidgetType, BackgroundType, BackgroundConfig } from '../types';

interface ToolbarProps {
  onAddWidget: (type: WidgetType) => void;
  onSetBackground: (type: BackgroundType) => void;
  currentBackground: BackgroundType;
  
  // Drawing Controls
  isDrawingMode: boolean;
  setIsDrawingMode: (v: boolean) => void;
  drawColor: string;
  setDrawColor: (c: string) => void;
  drawWidth: number;
  setDrawWidth: (w: number) => void;
  isEraser: boolean;
  setIsEraser: (v: boolean) => void;
  onClearDrawings: () => void;
}

const WIDGET_BUTTONS = [
  { type: WidgetType.NUMBER_LINE, icon: Icons.More, label: 'Tallinje' },
  { type: WidgetType.BASE_10, icon: Icons.Cube, label: 'Bas-klossar' },
  { type: WidgetType.NUMBER_BEADS, icon: Icons.Bead, label: 'Pärlband' },
  { type: WidgetType.HUNDRED_CHART, icon: Icons.Grid, label: 'Hundrarutan' },
  { type: WidgetType.NUMBER_HOUSE, icon: Icons.Home, label: 'Tal-huset' },
  { type: WidgetType.FRACTION, icon: Icons.Fraction, label: 'Bråk' },
  { type: WidgetType.FRACTION_BARS, icon: Icons.Bars, label: 'Bråkstavar' },
  { type: WidgetType.PERCENTAGE, icon: Icons.Percent, label: 'Procent' },
  { type: WidgetType.PRIME_BUBBLES, icon: Icons.Zap, label: 'Prim-Bubblor' },
  { type: WidgetType.COORDINATES, icon: Icons.Graph, label: 'Koordinater' },
  { type: WidgetType.PROBABILITY, icon: Icons.Dice, label: 'Sannolikhet' },
  { type: WidgetType.EQUATION, icon: Icons.Scale, label: 'Ekvation' },
];

const COLORS = [
  { hex: '#1e293b', label: 'Svart' },
  { hex: '#ef4444', label: 'Röd' },
  { hex: '#3b82f6', label: 'Blå' },
  { hex: '#10b981', label: 'Grön' },
  { hex: '#f59e0b', label: 'Orange' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddWidget, 
  onSetBackground, 
  currentBackground,
  isDrawingMode,
  setIsDrawingMode,
  drawColor,
  setDrawColor,
  drawWidth,
  setDrawWidth,
  isEraser,
  setIsEraser,
  onClearDrawings
}) => {
  // Set to false by default so it's open on load
  const [isMinimized, setIsMinimized] = useState(false);

  const handleAddWidget = (type: WidgetType) => {
    onAddWidget(type);
    setIsMinimized(true); // Auto-hide after selection to clear space
  };

  return (
    <div className={`fixed z-[110] flex flex-col gap-3 transition-all duration-500 ease-in-out ${
      isMinimized 
        ? 'bottom-16 right-6 items-end' 
        : 'bottom-3 left-1/2 -translate-x-1/2 items-center w-full px-4'
    }`}>
      
      {/* Drawing Sub-Toolbar (Conditional) */}
      {isDrawingMode && (
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-2 border-2 border-blue-500 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Color Selectors */}
          <div className="flex gap-1.5 px-2 border-r border-slate-200">
            {COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => { setDrawColor(c.hex); setIsEraser(false); }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${drawColor === c.hex && !isEraser ? 'scale-110 border-slate-400 ring-2 ring-slate-100' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>

          {/* Tools: Eraser & Width */}
          <div className="flex items-center gap-3 px-1 border-r border-slate-200 pr-3">
             <button 
                onClick={() => setIsEraser(!isEraser)}
                className={`p-2 rounded-lg transition-colors ${isEraser ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Suddgummi"
             >
                <Icons.Eraser size={22} />
             </button>
             
             <div className="flex flex-col gap-1 min-w-[70px]">
                <input 
                  type="range" min="2" max="24" 
                  value={drawWidth}
                  onChange={(e) => setDrawWidth(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[9px] font-black text-slate-400 uppercase text-center tracking-tighter">Bredd</span>
             </div>

             <button 
                onClick={onClearDrawings}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Rensa allt"
             >
                <Icons.Trash size={22} />
             </button>
          </div>

          {/* CLOSE DRAWING MODE BUTTON */}
          <button 
            onClick={() => setIsDrawingMode(false)}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-xl font-black text-xs hover:bg-red-600 shadow-md active:scale-95 transition-all"
            title="Avsluta ritläge"
          >
            <Icons.Close size={18} />
            <span className="hidden sm:inline">STÄNG</span>
          </button>
        </div>
      )}

      {/* Main Bar Container */}
      <div className={`flex flex-col gap-2 w-full transition-all duration-500 ${isMinimized ? 'items-end' : 'items-center max-w-[1100px]'}`}>
        
        {isMinimized ? (
          /* Minimized Trigger Button */
          <button 
            onClick={() => setIsMinimized(false)}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/20 animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Icons.Plus size={16} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest pr-1">Fler verktyg</span>
          </button>
        ) : (
          /* Full Widget Bar */
          <div className="relative w-full animate-in slide-in-from-bottom-8 duration-500 ease-out">
            {/* Collapse handle / button */}
            <button 
               onClick={() => setIsMinimized(true)}
               className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-8 bg-white border-x border-t border-slate-200 rounded-t-xl flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors shadow-sm z-10"
               title="Dölj meny"
            >
                <Icons.ChevronDown size={20} />
            </button>

            <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-2 border border-slate-200 flex gap-1 sm:gap-2 items-center overflow-x-auto xl:overflow-x-visible w-full no-scrollbar justify-start xl:justify-center">
              {WIDGET_BUTTONS.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => handleAddWidget(btn.type)}
                  className="flex flex-col items-center justify-center w-16 h-16 sm:w-[82px] sm:h-[82px] rounded-xl hover:bg-slate-100 transition-all text-slate-600 hover:text-blue-600 hover:scale-105 active:scale-95 group shrink-0"
                >
                  <btn.icon size={22} className="mb-1 group-hover:stroke-2" />
                  <span className="text-[9px] sm:text-[10px] font-bold leading-tight text-center px-1 whitespace-nowrap uppercase tracking-tighter">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

         {/* Status Bar */}
         {!isMinimized && (
           <div className="flex gap-4 items-center h-6 pointer-events-none">
              {isDrawingMode && (
                  <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full shadow-lg animate-pulse uppercase tracking-wider">
                     Ritläge Aktivt
                  </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};
