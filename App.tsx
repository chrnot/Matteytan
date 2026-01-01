import React, { useState, useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { WidgetWrapper } from './components/WidgetWrapper';
import { Logo } from './components/Logo';
import { WidgetType, WidgetInstance, BackgroundType, BackgroundConfig } from './types';
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
import { PrimeBubblesWidget } from './components/widgets/PrimeBubblesWidget';
import { ChanceGeneratorWidget } from './components/widgets/ChanceGeneratorWidget';
import { Icons } from './components/icons';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';

const BACKGROUNDS: BackgroundConfig[] = [
  { type: 'GRID', label: 'Rutnät', className: 'bg-grid-pattern' },
  { type: 'DOTS', label: 'Prickar', className: 'bg-dot-pattern' },
  { type: 'WHITE', label: 'Vit', className: 'bg-white' },
  { type: 'BLACK', label: 'Svart', className: 'bg-slate-900' },
];

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [background, setBackground] = useState<BackgroundType>('GRID');
  const [topZ, setTopZ] = useState(40); 
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  
  // Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444'); 
  const [drawWidth, setDrawWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const drawingCanvasRef = useRef<DrawingCanvasHandle>(null);

  const [transparentWidgets, setTransparentWidgets] = useState<Record<string, boolean>>({});

  const getDefaultSize = (type: WidgetType) => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const isMobile = screenW < 768;

      const clampW = (w: number) => Math.min(w, screenW * 0.95);
      const clampH = (h: number) => Math.min(h, screenH * 0.85);

      switch(type) {
          case WidgetType.NUMBER_LINE: return { w: clampW(800), h: clampH(380) };
          case WidgetType.COORDINATES: return { w: clampW(isMobile ? 380 : 700), h: clampH(isMobile ? 500 : 450) };
          case WidgetType.PROBABILITY: return { w: clampW(600), h: clampH(650) };
          case WidgetType.BASE_10: return { w: clampW(850), h: clampH(550) };
          case WidgetType.PERCENTAGE: return { w: clampW(700), h: clampH(420) };
          case WidgetType.NUMBER_BEADS: return { w: clampW(650), h: clampH(420) };
          case WidgetType.FRACTION: return { w: clampW(550), h: clampH(350) };
          case WidgetType.RULER: return { w: clampW(500), h: 200 };
          case WidgetType.PROTRACTOR: return { w: clampW(450), h: 300 };
          case WidgetType.EQUATION: return { w: clampW(600), h: clampH(650) };
          case WidgetType.HUNDRED_CHART: return { w: clampW(500), h: clampH(650) };
          case WidgetType.NUMBER_OF_DAY: return { w: clampW(450), h: clampH(550) };
          case WidgetType.FRACTION_BARS: return { w: clampW(800), h: clampH(550) };
          case WidgetType.NUMBER_HOUSE: return { w: clampW(380), h: clampH(580) };
          case WidgetType.CALCULATOR: return { w: clampW(360), h: clampH(580) };
          case WidgetType.SHAPES: return { w: clampW(500), h: clampH(580) };
          case WidgetType.MATH_WORKSHOP: return { w: clampW(850), h: clampH(600) };
          case WidgetType.PRIME_BUBBLES: return { w: clampW(850), h: clampH(650) };
          case WidgetType.CHANCE_GENERATOR: return { w: 280, h: 360 };
          default: return { w: clampW(450), h: 400 };
      }
  };

  const addWidget = (type: WidgetType) => {
    const size = getDefaultSize(type);
    const id = `${type}-${Date.now()}`;
    
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
        id: widget.id,
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
      case WidgetType.EQUATION: return <EquationWidget {...props} />;
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
      case WidgetType.PRIME_BUBBLES: return <PrimeBubblesWidget {...props} />;
      case WidgetType.CHANCE_GENERATOR: return <ChanceGeneratorWidget {...props} />;
      default: return null;
    }
  };

  const getWidgetTitle = (type: WidgetType) => {
      switch (type) {
      case WidgetType.NUMBER_LINE: return 'Tallinje';
      case WidgetType.RULER: return 'Linjal';
      case WidgetType.PROTRACTOR: return 'Gradskiva';
      case WidgetType.FRACTION: return 'Bråk';
      case WidgetType.COORDINATES: return 'Koordinatsystem';
      case WidgetType.PROBABILITY: return 'Sannolikhet';
      case WidgetType.NUMBER_OF_DAY: return 'Dagens Tal';
      case WidgetType.EQUATION: return 'Ekvationer';
      case WidgetType.FORMULAS: return 'Formler';
      case WidgetType.CALCULATOR: return 'Räknare';
      case WidgetType.PERCENTAGE: return 'Procent';
      case WidgetType.BASE_10: return 'Bas-klossar';
      case WidgetType.HUNDRED_CHART: return 'Hundrarutan';
      case WidgetType.NUMBER_HOUSE: return 'Tal-huset';
      case WidgetType.NUMBER_BEADS: return 'Pärlband';
      case WidgetType.SHAPES: return 'Former';
      case WidgetType.FRACTION_BARS: return 'Bråkstavar';
      case WidgetType.MATH_WORKSHOP: return 'Matte-verkstad';
      case WidgetType.PRIME_BUBBLES: return 'Prim-Bubblor';
      case WidgetType.CHANCE_GENERATOR: return 'Slump-gen';
      default: return 'Verktyg';
    }
  };

  const EXTRA_TOOLS = [
    { type: WidgetType.MATH_WORKSHOP, icon: Icons.Tools, label: 'Verkstad' },
    { type: WidgetType.CHANCE_GENERATOR, icon: Icons.Sparkles, label: 'Slump-gen' },
    { type: WidgetType.SHAPES, icon: Icons.Shapes, label: 'Former' },
    { type: WidgetType.RULER, icon: Icons.Ruler, label: 'Linjal' },
    { type: WidgetType.PROTRACTOR, icon: Icons.Rotate, label: 'Gradskiva' },
    { type: WidgetType.CALCULATOR, icon: Icons.Math, label: 'Räknare' },
    { type: 'DRAWING', icon: Icons.Pencil, label: 'Rita' },
  ];

  const handleToolClick = (tool: any) => {
    if (tool.type === 'DRAWING') {
      setIsDrawingMode(!isDrawingMode);
      setIsToolsOpen(false);
    } else {
      addWidget(tool.type as WidgetType);
    }
  };

  const clearDrawings = () => {
    drawingCanvasRef.current?.clear();
  };

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${getBackgroundClass()}`}>
      
      <Logo darkMode={background === 'BLACK'} />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[100] flex items-start gap-2">
         
         <button 
            onClick={() => addWidget(WidgetType.NUMBER_OF_DAY)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm"
         >
             <Icons.Calendar size={16} /> <span className="hidden md:inline">Dagens Tal</span>
         </button>

         <div className="relative">
            <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm ${isToolsOpen ? 'ring-2 ring-blue-200 text-blue-600' : ''}`}
            >
                <Icons.Tools size={16} /> 
                <span className="hidden md:inline">Verktyg</span>
                <Icons.ChevronDown size={14} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {isToolsOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">Funktioner</div>
                    {EXTRA_TOOLS.map((tool) => (
                        <button
                            key={tool.label}
                            onClick={() => handleToolClick(tool)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${tool.type === 'DRAWING' && isDrawingMode ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-700 hover:text-blue-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <tool.icon size={18} />
                                <span>{tool.label}</span>
                            </div>
                            {tool.type === 'DRAWING' && isDrawingMode && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                        </button>
                    ))}
                    
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mt-2 mb-1">Bakgrund</div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                        {BACKGROUNDS.map(bg => (
                            <button 
                                key={bg.type}
                                onClick={() => setBackground(bg.type)}
                                className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-tighter border transition-all ${background === bg.type ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                            >
                                {bg.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </div>

      <DrawingCanvas 
        ref={drawingCanvasRef}
        isDrawingMode={isDrawingMode}
        color={drawColor}
        lineWidth={drawWidth}
        isEraser={isEraser}
        zIndex={10}
      />

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
        onClearDrawings={clearDrawings}
      />
    </div>
  );
};

export default App;