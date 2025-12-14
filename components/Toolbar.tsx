import React from 'react';
import { Icons } from './icons';
import { WidgetType, BackgroundType, BackgroundConfig } from '../types';

interface ToolbarProps {
  onAddWidget: (type: WidgetType) => void;
  onSetBackground: (type: BackgroundType) => void;
  currentBackground: BackgroundType;
}

const WIDGET_BUTTONS = [
  { type: WidgetType.BASE_10, icon: Icons.Cube, label: 'Bas-klossar' },
  { type: WidgetType.NUMBER_BEADS, icon: Icons.Bead, label: 'Pärlband' },
  { type: WidgetType.HUNDRED_CHART, icon: Icons.Grid, label: 'Hundrarutan' },
  { type: WidgetType.NUMBER_HOUSE, icon: Icons.Home, label: 'Tal-huset' },
  { type: WidgetType.NUMBER_LINE, icon: Icons.More, label: 'Tallinje' },
  { type: WidgetType.FRACTION, icon: Icons.Fraction, label: 'Bråk' },
  { type: WidgetType.PERCENTAGE, icon: Icons.Percent, label: 'Procent' },
  { type: WidgetType.COORDINATES, icon: Icons.Graph, label: 'Koordinater' },
  { type: WidgetType.PROBABILITY, icon: Icons.Dice, label: 'Sannolikhet' },
  { type: WidgetType.NUMBER_OF_DAY, icon: Icons.Calendar, label: 'Dagens Tal' },
  { type: WidgetType.EQUATION, icon: Icons.Scale, label: 'Ekvation' },
];

const BACKGROUNDS: BackgroundConfig[] = [
    { type: 'GRID', label: 'Rutnät', className: 'bg-grid-pattern' },
    { type: 'DOTS', label: 'Prickar', className: 'bg-dot-pattern' },
    { type: 'WHITE', label: 'Vit', className: 'bg-white' },
    { type: 'BLACK', label: 'Svart', className: 'bg-slate-900' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ onAddWidget, onSetBackground, currentBackground }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4">
      
      {/* Widget Bar */}
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-2 border border-slate-200 flex gap-1 sm:gap-2 items-center overflow-x-auto max-w-[95vw]">
        {WIDGET_BUTTONS.map((btn) => (
          <button
            key={btn.type}
            onClick={() => onAddWidget(btn.type)}
            className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl hover:bg-slate-100 transition-all text-slate-600 hover:text-blue-600 hover:scale-105 active:scale-95 group"
          >
            <btn.icon size={24} className="mb-1 group-hover:stroke-2" />
            <span className="text-[10px] font-medium leading-tight text-center px-1">{btn.label}</span>
          </button>
        ))}
      </div>

       {/* Background Toggles */}
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

    </div>
  );
};