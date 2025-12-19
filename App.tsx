
import React, { useState, useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { WidgetWrapper } from './components/WidgetWrapper';
import { Logo } from './components/Logo';
import { WidgetType, WidgetInstance, BackgroundType } from './types';
import { NumberLineWidget } from './components/widgets/NumberLineWidget';
import { RulerWidget } from './components/widgets/RulerWidget';
import { ProtractorWidget } from './components/widgets/ProtractorWidget';
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
import { FractionBarsWidget } from './components/widgets/FractionBarsWidget';
import { MathWorkshopWidget } from './components/widgets/MathWorkshopWidget';
import { Icons } from './components/icons';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [background, setBackground] = useState<BackgroundType>('GRID');
  const [topZ, setTopZ] = useState(40); 
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  
  // Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444'); // Red as default
  const [drawWidth, setDrawWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const drawingCanvasRef = useRef<DrawingCanvasHandle>(null);

  const [transparentWidgets, setTransparentWidgets] = useState<Record<string, boolean>>({});

  const getDefaultSize = (type: WidgetType) => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const isTablet = screenW < 1024;
      const isMobile = screenW < 640;

      const maxWidth = screenW * 0.95;
      const clampW = (w: number) => Math.min(w, maxWidth);

      switch(type) {
          case WidgetType.NUMBER_LINE: return { w: clampW(800), h: 380 };
          case WidgetType.COORDINATES: return { w: clampW(isTablet ? 650 : 700), h: isTablet ? 550 : 450 };
          case WidgetType.PROBABILITY: return { w: clampW(550), h: Math.min(650, screenH * 0.8) };
          case WidgetType.BASE_10: return { w: clampW(850), h: isTablet ? 650 : 550 };
          case WidgetType.PERCENTAGE: return { w: clampW(700), h: isMobile ? 550 : 420 };
          case WidgetType.NUMBER_BEADS: return { w: clampW(650), h: 420 };
          case WidgetType.FRACTION: return { w: clampW(550), h: isMobile ? 550 : 350 };
          case WidgetType.RULER: return { w: 500, h: 200 };
          case WidgetType.PROTRACTOR: return { w: 450, h: 300 };
          case WidgetType.EQUATION: return { w: clampW(600), h: isTablet ? 700 : 650 };
          case WidgetType.HUNDRED_CHART: return { w: clampW(500), h: 650 };
          case WidgetType.NUMBER_OF_DAY: return { w: clampW(450), h: isMobile ? 650 : 550 };
          case WidgetType.FRACTION_BARS: return { w: clampW(800), h: isTablet ? 650 : 550 };
          case WidgetType.NUMBER_HOUSE: return { w: clampW(380), h: 580 };
          case WidgetType.CALCULATOR: return { w: clampW(360), h: 580 };
          case WidgetType.SHAPES: return { w: clampW(500), h: isMobile ? 650 : 580 };
          case WidgetType.MATH_WORKSHOP: return { w: clampW(850), h: isTablet ? 600 : 500 };
          default: return { w: clampW(450), h: 400 };
      }
  };

  const addWidget = (type: WidgetType) => {
    const size = getDefaultSize(type);
    const id = `${type}-${Date.now()}`;
    
    // Force Ruler and Protractor to open in transparent mode (no frame)
    if (type === WidgetType.RULER || type === WidgetType.PROTRACTOR) {
        setTransparentWidgets(prev => ({ ...prev, [id]: true }));
    }

    const newWidget: WidgetInstance = {
      id,
      type,
      x: Math.max(10, window.innerWidth / 2 - size.w / 2 + (Math.random() * 20 - 10)),
      y: Math.max(80, window.innerHeight / 2 - size.h / 2 + (Math.random() * 20 - 10)),
      width: size.w,
      height: size.h,
      zIndex: topZ + 1,
    };
    setTopZ(prev => prev + 1);
    setWidgets([...widgets, newWidget]);
    setIsToolsOpen(false);
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
      case WidgetType.RULER: return <RulerWidget {...props} />;
      case WidgetType.PROTRACTOR: return <ProtractorWidget {...props} />;
      case WidgetType.FRACTION: return <FractionWidget {...props} />;
      case WidgetType.COORDINATES: return <CoordinatesWidget {...props} />;
      case WidgetType.PROBABILITY: return <ProbabilityWidget {...props} />;
      case WidgetType.NUMBER_OF_DAY: return <NumberDayWidget {...props} />;
      case WidgetType.EQUATION: return <EquationWidget />;
      case WidgetType.FORMULAS: return <FormulaWidget {...props} />;
      case WidgetType.CALCULATOR: return <CalculatorWidget {...props} />;
      case WidgetType.PERCENTAGE: return <PercentageWidget {...props} />;
      case WidgetType.BASE_10: return <Base10Widget {...props} />;
      case WidgetType.HUNDRED_CHART: return <HundredChartWidget {...props} />;
      case WidgetType.NUMBER_HOUSE: return <NumberHouseWidget {...props} />;
      case WidgetType.NUMBER_BEADS: return <NumberBeadsWidget {...props} />;
      case WidgetType.SHAPES: return <ShapesWidget {...props} />;
      case WidgetType.FRACTION_BARS: return <FractionBarsWidget {...props} />;
      case WidgetType.MATH_WORKSHOP: return <MathWorkshopWidget {...props} />;
      default: return null;
    }
  };

  const getWidgetTitle = (type: WidgetType) => {
      switch (type) {
      case WidgetType.NUMBER_LINE: return 'Interaktiv Tallinje';
      case WidgetType.RULER: return 'Linjal';
      case WidgetType.PROTRACTOR: return 'Gradskiva';
      case WidgetType.FRACTION: return 'Jämför Bråk';
      case WidgetType.COORDINATES: return 'Koordinatsystem';
      case WidgetType.PROBABILITY: return 'Sannolikhets-labb';
      case WidgetType.NUMBER_OF_DAY: return 'Dagens Tal';
      case WidgetType.EQUATION: return 'Ekvations-labbet';
      case WidgetType.FORMULAS: return 'Formelsamling';
      case WidgetType.CALCULATOR: return 'Miniräknare';
      case WidgetType.PERCENTAGE: return 'Procent och jämförelse';
      case WidgetType.BASE_10: return 'Bas-klossar';
      case WidgetType.HUNDRED_CHART: return 'Hundrarutan';
      case WidgetType.NUMBER_HOUSE: return 'Tal-huset';
      case WidgetType.NUMBER_BEADS: return 'Pärlband (0-20)';
      case WidgetType.SHAPES: return 'Former & Geometri';
      case WidgetType.FRACTION_BARS: return 'Bråkstavarna';
      case WidgetType.MATH_WORKSHOP: return 'Matte-verkstad';
      default: return 'Widget';
    }
  };

  const EXTRA_TOOLS = [
    { type: 'DRAWING', icon: Icons.Pencil, label: 'Rita' },
    { type: WidgetType.MATH_WORKSHOP, icon: Icons.Plus, label: 'Matte-verkstad' },
    { type: WidgetType.CALCULATOR, icon: Icons.Math, label: 'Räknare' },
    { type: WidgetType.SHAPES, icon: Icons.Shapes, label: 'Former' },
    { type: WidgetType.RULER, icon: Icons.Ruler, label: 'Linjal' },
    { type: WidgetType.PROTRACTOR, icon: Icons.Rotate, label: 'Gradskiva' },
  ];

  const handleToolClick = (tool: any) => {
    if (tool.type === 'DRAWING') {
      setIsDrawingMode(!isDrawingMode);
      setIsToolsOpen(false);
    } else {
      addWidget(tool.type as WidgetType);
    }
  };

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${getBackgroundClass()}`}>
      
      <Logo darkMode={background === 'BLACK'} />

      {/* Floating Top Right Tools */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[100] flex items-start gap-2 max-w-[50vw]">
         
         {/* Dagens Tal Button */}
         <button 
            onClick={() => addWidget(WidgetType.NUMBER_OF_DAY)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-lg border border-transparent hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm"
         >
             <Icons.Calendar size={16} /> <span className="hidden md:inline">Dagens Tal</span>
         </button>

         {/* Tools Dropdown */}
         <div className="relative">
            <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm ${isToolsOpen ? 'ring-2 ring-blue-200 text-blue-600' : ''}`}
            >
                <Icons.Tools size={16} /> 
                <span className="hidden md:inline">Verktyg</span>
                <Icons.ChevronDown size={14} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {isToolsOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    {EXTRA_TOOLS.map((tool) => (
                        <button
                            key={tool.label}
                            onClick={() => handleToolClick(tool)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${tool.type === 'DRAWING' && isDrawingMode ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-700 hover:text-blue-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <tool.icon size={18} className={tool.type === 'DRAWING' && isDrawingMode ? 'text-blue-500' : 'text-slate-400'} />
                                {tool.label}
                            </div>
                            {tool.type === 'DRAWING' && isDrawingMode && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
            
            {isToolsOpen && (
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsToolsOpen(false)}></div>
            )}
         </div>

      </div>

      {/* Canvas Area (Widgets) */}
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

      {/* Drawing Layer - Always on top when active */}
      <DrawingCanvas 
        ref={drawingCanvasRef}
        isDrawingMode={isDrawingMode}
        color={drawColor}
        lineWidth={drawWidth}
        isEraser={isEraser}
        zIndex={topZ + 10} 
      />

      {/* Intro Text if Empty */}
      {widgets.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40 px-4">
              <h1 className={`text-4xl sm:text-6xl font-bold tracking-tight mb-4 ${background === 'BLACK' ? 'text-white' : 'text-slate-900'}`}>Matteytan</h1>
              <p className={`text-lg sm:text-xl ${background === 'BLACK' ? 'text-slate-400' : 'text-slate-500'}`}>Välj ett verktyg nedan för att starta lektionen</p>
          </div>
      )}

      {/* Toolbar */}
      <Toolbar 
        onAddWidget={addWidget} 
        onSetBackground={setBackground}
        currentBackground={background}
        isDrawingMode={isDrawingMode}
        setIsDrawingMode={setIsDrawingMode}
        drawColor={drawColor}
        setDrawColor={setDrawColor}
        drawWidth={drawWidth}
        setDrawWidth={setDrawWidth}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        onClearDrawings={() => drawingCanvasRef.current?.clear()}
      />
    </div>
  );
};

export default App;
