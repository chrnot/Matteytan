
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
  { type: WidgetType.BASE_10, icon: Icons.Cube, label: 'Bas-klossar' },
  { type: WidgetType.NUMBER_BEADS, icon: Icons.Bead, label: 'Pärlband' },
  { type: WidgetType.HUNDRED_CHART, icon: Icons.Grid, label: 'Hundrarutan' },
  { type: WidgetType.NUMBER_HOUSE, icon: Icons.Home, label: 'Tal-huset' },
  { type: WidgetType.FRACTION, icon: Icons.Fraction, label: 'Bråk' },
  { type: WidgetType.FRACTION_BARS, icon: Icons.Bars, label: 'Bråkstavar' },
  { type: WidgetType.PERCENTAGE, icon: Icons.Percent, label: 'Procent' },
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

const BACKGROUNDS: BackgroundConfig[] = [
    { type: 'GRID', label: 'Rutnät', className: 'bg-grid-pattern' },
    { type: 'DOTS', label: 'Prickar', className: 'bg-dot-pattern' },
    { type: 'WHITE', label: 'Vit', className: 'bg-white' },
    { type: 'BLACK', label: 'Svart', className: 'bg-slate-900' },
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
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-4">
      
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
      <div className="flex flex-col items-center gap-3">
        
        {/* Widget Bar */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-2 border border-slate-200 flex gap-1 sm:gap-2 items-center overflow-x-auto max-w-[95vw]">
          {WIDGET_BUTTONS.map((btn) => (
            <button
              key={btn.type}
              onClick={() => onAddWidget(btn.type)}
              className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl hover:bg-slate-100 transition-all text-slate-600 hover:text-blue-600 hover:scale-105 active:scale-95 group shrink-0"
            >
              <btn.icon size={24} className="mb-1 group-hover:stroke-2" />
              <span className="text-[10px] font-medium leading-tight text-center px-1">{btn.label}</span>
            </button>
          ))}
        </div>

         {/* Background & Meta Bar */}
         <div className="flex gap-4 items-center">
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 flex gap-3">
                {BACKGROUNDS.map(bg => (
                    <button 
                      key={bg.type}
                      onClick={() => onSetBackground(bg.type)}
                      className={`w-6 h-6 rounded-full border-2 shadow-sm ${currentBackground === bg.type ? 'border-blue-500 scale-110' : 'border-slate-200'} ${bg.type === 'BLACK' ? 'bg-slate-900' : 'bg-white'}`}
                      title={bg.label}
                    >
                        {bg.type === 'GRID' && <div className="w-full h-full opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0gNCAwIEwgMCAwIDAgNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]"></div>}
                    </button>
                ))}
            </div>
            
            {/* Legend/Mode hint */}
            {isDrawingMode && (
                <div className="px-3 py-2 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg animate-pulse uppercase tracking-wider">
                   Ritläge Aktivt
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
