import React, { useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { WidgetWrapper } from './components/WidgetWrapper';
import { Logo } from './components/Logo';
import { WidgetType, WidgetInstance, BackgroundType } from './types';
import { NumberLineWidget } from './components/widgets/NumberLineWidget';
import { GeometryWidget } from './components/widgets/GeometryWidget';
import { FractionWidget } from './components/widgets/FractionWidget';
import { CoordinatesWidget } from './components/widgets/CoordinatesWidget';
import { ProbabilityWidget } from './components/widgets/ProbabilityWidget';
import { NumberDayWidget } from './components/widgets/NumberDayWidget';
import { EquationWidget } from './components/widgets/EquationWidget';
import { FormulaWidget } from './components/widgets/FormulaWidget';
import { CalculatorWidget } from './components/widgets/CalculatorWidget';
import { PercentageWidget } from './components/widgets/PercentageWidget';
import { Base10Widget } from './components/widgets/Base10Widget';
import { HundredChartWidget } from './components/widgets/HundredChartWidget';
import { NumberHouseWidget } from './components/widgets/NumberHouseWidget';
import { NumberBeadsWidget } from './components/widgets/NumberBeadsWidget';
import { ShapesWidget } from './components/widgets/ShapesWidget';
import { Icons } from './components/icons';

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [background, setBackground] = useState<BackgroundType>('GRID');
  const [topZ, setTopZ] = useState(40); // Start higher than toolbar (z-30)
  
  // Track transparency state for widgets that support it
  const [transparentWidgets, setTransparentWidgets] = useState<Record<string, boolean>>({});

  const getDefaultSize = (type: WidgetType) => {
      switch(type) {
          case WidgetType.NUMBER_LINE: return { w: 800, h: 350 };
          case WidgetType.COORDINATES: return { w: 650, h: 450 };
          case WidgetType.PROBABILITY: return { w: 550, h: 600 };
          case WidgetType.BASE_10: return { w: 850, h: 600 };
          case WidgetType.PERCENTAGE: return { w: 700, h: 400 };
          case WidgetType.NUMBER_BEADS: return { w: 650, h: 400 };
          case WidgetType.FRACTION: return { w: 550, h: 300 };
          case WidgetType.GEOMETRY: return { w: 500, h: 400 };
          case WidgetType.EQUATION: return { w: 550, h: 500 };
          case WidgetType.HUNDRED_CHART: return { w: 550, h: 650 };
          default: return { w: 450, h: 400 };
      }
  };

  const addWidget = (type: WidgetType) => {
    const size = getDefaultSize(type);
    const newWidget: WidgetInstance = {
      id: `${type}-${Date.now()}`,
      type,
      x: Math.max(50, window.innerWidth / 2 - size.w / 2 + (Math.random() * 40 - 20)),
      y: Math.max(50, window.innerHeight / 2 - size.h / 2 + (Math.random() * 40 - 20)),
      width: size.w,
      height: size.h,
      zIndex: topZ + 1,
    };
    setTopZ(prev => prev + 1);
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    const newTrans = { ...transparentWidgets };
    delete newTrans[id];
    setTransparentWidgets(newTrans);
  };

  const bringToFront = (id: string) => {
    setTopZ(prev => prev + 1);
    setWidgets(widgets.map(w => w.id === id ? { ...w, zIndex: topZ + 1 } : w));
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, x, y } : w));
  };
  
  const toggleTransparency = (id: string, isTrans: boolean) => {
      setTransparentWidgets(prev => ({ ...prev, [id]: isTrans }));
  };

  const getBackgroundClass = () => {
    switch (background) {
      case 'GRID': return 'bg-paper bg-grid-pattern';
      case 'DOTS': return 'bg-paper bg-dot-pattern';
      case 'BLACK': return 'bg-slate-900';
      default: return 'bg-white';
    }
  };

  const renderWidgetContent = (widget: WidgetInstance) => {
    const props = {
        isTransparent: transparentWidgets[widget.id] || false,
        setTransparent: (v: boolean) => toggleTransparency(widget.id, v)
    };

    switch (widget.type) {
      case WidgetType.NUMBER_LINE: return <NumberLineWidget {...props} />;
      case WidgetType.GEOMETRY: return <GeometryWidget {...props} />;
      case WidgetType.FRACTION: return <FractionWidget {...props} />;
      case WidgetType.COORDINATES: return <CoordinatesWidget {...props} />;
      case WidgetType.PROBABILITY: return <ProbabilityWidget {...props} />;
      case WidgetType.NUMBER_OF_DAY: return <NumberDayWidget {...props} />;
      case WidgetType.EQUATION: return <EquationWidget {...props} />;
      case WidgetType.FORMULAS: return <FormulaWidget {...props} />;
      case WidgetType.CALCULATOR: return <CalculatorWidget {...props} />;
      case WidgetType.PERCENTAGE: return <PercentageWidget {...props} />;
      case WidgetType.BASE_10: return <Base10Widget {...props} />;
      case WidgetType.HUNDRED_CHART: return <HundredChartWidget {...props} />;
      case WidgetType.NUMBER_HOUSE: return <NumberHouseWidget {...props} />;
      case WidgetType.NUMBER_BEADS: return <NumberBeadsWidget {...props} />;
      case WidgetType.SHAPES: return <ShapesWidget {...props} />;
      default: return null;
    }
  };

  const getWidgetTitle = (type: WidgetType) => {
      switch (type) {
      case WidgetType.NUMBER_LINE: return 'Interaktiv Tallinje';
      case WidgetType.GEOMETRY: return 'Mätning';
      case WidgetType.FRACTION: return 'Bråktals-byggare';
      case WidgetType.COORDINATES: return 'Koordinatsystem';
      case WidgetType.PROBABILITY: return 'Sannolikhets-labb';
      case WidgetType.NUMBER_OF_DAY: return 'Dagens Tal';
      case WidgetType.EQUATION: return 'Ekvations-balans';
      case WidgetType.FORMULAS: return 'Formelsamling';
      case WidgetType.CALCULATOR: return 'Miniräknare';
      case WidgetType.PERCENTAGE: return 'Procent & Jämförelse';
      case WidgetType.BASE_10: return 'Bas-klossar (Hundratal, Tiotal, Ental)';
      case WidgetType.HUNDRED_CHART: return 'Hundrarutan';
      case WidgetType.NUMBER_HOUSE: return 'Tal-huset';
      case WidgetType.NUMBER_BEADS: return 'Pärlband (0-20)';
      case WidgetType.SHAPES: return 'Former & Geometri';
      default: return 'Widget';
    }
  };

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${getBackgroundClass()}`}>
      
      {/* App Logo */}
      <Logo darkMode={background === 'BLACK'} />

      {/* Floating Top Right Tools - Lower Z-index than widgets */}
      <div className="absolute top-6 right-6 z-30 flex gap-2">
         <button 
            onClick={() => addWidget(WidgetType.CALCULATOR)}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
         >
             <Icons.Math size={18} /> Räknare
         </button>
         <button 
            onClick={() => addWidget(WidgetType.SHAPES)}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
         >
             <Icons.Shapes size={18} /> Former
         </button>
         <button 
            onClick={() => addWidget(WidgetType.GEOMETRY)}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
         >
             <Icons.Ruler size={18} /> Mätning
         </button>
         <button 
            onClick={() => addWidget(WidgetType.FORMULAS)}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
         >
             <Icons.Book size={18} /> Formler
         </button>
      </div>

      {/* Canvas Area */}
      {widgets.map(widget => (
        <WidgetWrapper
          key={widget.id}
          id={widget.id}
          title={getWidgetTitle(widget.type)}
          initialX={widget.x}
          initialY={widget.y}
          initialWidth={widget.width}
          initialHeight={widget.height}
          zIndex={widget.zIndex}
          transparent={transparentWidgets[widget.id]}
          onClose={removeWidget}
          onFocus={bringToFront}
          onMove={updatePosition}
        >
          {renderWidgetContent(widget)}
        </WidgetWrapper>
      ))}

      {/* Intro Text if Empty */}
      {widgets.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40">
              <h1 className={`text-6xl font-bold tracking-tight mb-4 ${background === 'BLACK' ? 'text-white' : 'text-slate-900'}`}>Matteytan</h1>
              <p className={`text-xl ${background === 'BLACK' ? 'text-slate-400' : 'text-slate-500'}`}>Välj ett verktyg nedan för att starta lektionen</p>
          </div>
      )}

      {/* Toolbar */}
      <Toolbar 
        onAddWidget={addWidget} 
        onSetBackground={setBackground}
        currentBackground={background}
      />
    </div>
  );
};

export default App;