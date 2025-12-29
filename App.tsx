
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
  const [showCoC, setShowCoC] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
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
      case WidgetType.PRIME_BUBBLES: return 'Prim-Bubblorna';
      case WidgetType.CHANCE_GENERATOR: return 'Slump-gen';
      default: return 'Widget';
    }
  };

  const EXTRA_TOOLS = [
    { type: 'DRAWING', icon: Icons.Pencil, label: 'Rita' },
    { type: WidgetType.CHANCE_GENERATOR, icon: Icons.Sparkles, label: 'Slump-gen' },
    { type: WidgetType.MATH_WORKSHOP, icon: Icons.Plus, label: 'Verkstad' },
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

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[100] flex items-start gap-2 max-w-[50vw]">
         
         <button 
            onClick={() => addWidget(WidgetType.NUMBER_OF_DAY)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-lg border border-transparent hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm"
         >
             <Icons.Calendar size={16} /> <span className="hidden md:inline">Dagens Tal</span>
         </button>

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
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">Funktioner</div>
                    {EXTRA_TOOLS.map((tool) => (
                        <button
                            key={tool.label}
                            onClick={() => handleToolClick(tool)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${tool.type === 'DRAWING' && isDrawingMode ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-700 hover:text-blue-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <tool.icon size={18} className={tool.type === 'DRAWING' && isDrawingMode ? 'text-blue-500' : 'text-slate-400'} />
                                {tool.label}
                            </div>
                        </button>
                    ))}

                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mt-2 mb-1">Bakgrund</div>
                    <div className="flex gap-2 p-2 justify-center">
                        {BACKGROUNDS.map(bg => (
                            <button 
                              key={bg.type}
                              onClick={() => setBackground(bg.type)}
                              className={`w-7 h-7 rounded-full border-2 transition-all shadow-sm ${background === bg.type ? 'border-blue-500 scale-110 ring-2 ring-blue-100' : 'border-slate-200 hover:scale-105'} ${bg.type === 'BLACK' ? 'bg-slate-900' : 'bg-white'}`}
                              title={bg.label}
                            >
                                {bg.type === 'GRID' && <div className="w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0gNCAwIEwgMCAwIDAgNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]"></div>}
                                {bg.type === 'DOTS' && <div className="w-full h-full opacity-30 flex items-center justify-center"><div className="w-0.5 h-0.5 bg-black rounded-full"></div></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </div>

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

      <DrawingCanvas 
        ref={drawingCanvasRef}
        isDrawingMode={isDrawingMode}
        color={drawColor}
        lineWidth={drawWidth}
        isEraser={isEraser}
        zIndex={topZ + 10} 
      />

      {widgets.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40 px-4">
              <h1 className={`text-4xl sm:text-6xl font-bold tracking-tight mb-4 ${background === 'BLACK' ? 'text-white' : 'text-slate-900'}`}>Matteytan</h1>
              <p className={`text-lg sm:text-xl ${background === 'BLACK' ? 'text-slate-400' : 'text-slate-500'}`}>Välj ett verktyg nedan för att starta lektionen</p>
          </div>
      )}

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

      {/* Footer Links */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-6">
          <button 
            onClick={() => setShowAbout(true)}
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-blue-500 transition-colors"
          >
            Om Matteytan
          </button>
          <button 
            onClick={() => setShowCoC(true)}
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-blue-500 transition-colors"
          >
            Uppförandekod
          </button>
      </div>

      {/* Watermark CC0 & Netlify */}
      <div className="fixed bottom-2 right-6 z-[120] flex flex-col items-end select-none">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 opacity-60 pointer-events-none">
            CC0 1.0 Universal
          </span>
          <a 
            href="https://www.netlify.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 opacity-60 hover:opacity-100 hover:text-blue-500 transition-all cursor-pointer"
          >
            This site is powered by Netlify
          </a>
      </div>

      {/* About Modal */}
      {showAbout && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          <Icons.Sparkles className="text-blue-600" size={24} />
                          Om Matteytan – Där abstrakt matematik blir konkret
                      </h2>
                      <button 
                        onClick={() => setShowAbout(false)}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                      >
                        <Icons.X size={24} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-thin">
                      <section>
                          <p className="text-slate-600 leading-relaxed italic border-l-4 border-blue-100 pl-4">
                              Välkommen till Matteytan. Vi vet att matematiklärare ofta tvingas hoppa mellan olika flikar, fysiska plockmaterial och statiska presentationer för att få fram sin poäng. Matteytan är lösningen på det prover – en samlad, digital startpunkt för dina lektioner.
                          </p>
                      </section>

                      <section>
                          <h3 className="text-lg font-black text-slate-800 mb-3">Vad är Matteytan?</h3>
                          <p className="text-slate-600 leading-relaxed">
                              Tänk dig en klassisk whiteboard, fast smartare. Matteytan fungerar som en interaktiv canvas där du fritt placerar ut skräddarsydda "widgets" anpassade för matematikundervisning.
                          </p>
                      </section>

                      <section>
                          <h3 className="text-lg font-black text-slate-800 mb-4 border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">Varför använda Matteytan?</h3>
                          <p className="text-slate-600 leading-relaxed mb-6">Vi bygger våra verktyg på beprövad matematikdidaktik. Vi vet att elever lär sig bäst när de får se och pröva själva. Därför erbjuder vi verktyg som:</p>
                          
                          <div className="space-y-4">
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                                      <Icons.Zap size={16} /> Visualiserar det osynliga
                                  </h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                      Med Bråkstavarna och Prim-bubblorna blir abstrakta talrelationer fysiska objekt som går att flytta och kombinera.
                                  </p>
                              </div>

                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <h4 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                                      <Icons.Scale size={16} /> Bygger broar till algebra
                                  </h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                      Genom Tändsticksgåtan och Ekvationsvågen hjälper vi elever att gå från konkret plockmaterial till att förstå variabler och formler.
                                  </p>
                              </div>

                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                      <Icons.Ruler size={16} /> Sparar tid
                                  </h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                      Slipp leta efter linjaler eller tärningar. Med Geometri-kitet och Chans-generatorn har du alltid verktygen ett klick bort.
                                  </p>
                              </div>
                          </div>
                      </section>

                      <section>
                          <h3 className="text-lg font-black text-slate-800 mb-3">För svenska klassrum</h3>
                          <p className="text-slate-600 leading-relaxed">
                              Matteytan är utvecklad med den svenska läroplanen i åtanke. Från tallinjer och koordinatsystem till sannolikhetslära – allt är designat för att passa in direkt i din undervisning, oavsett om du undervisar på låg-, mellan- eller högstadiet.
                          </p>
                      </section>

                      <section className="bg-blue-600 p-8 rounded-3xl text-white text-center shadow-xl mb-6">
                          <p className="text-xl font-black italic">
                              Inga onödiga animationer. Inget krångel. Bara en ren yta för matematik.
                          </p>
                      </section>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                      <button 
                        onClick={() => setShowAbout(false)}
                        className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest"
                      >
                        Stäng
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Code of Conduct Modal */}
      {showCoC && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          <Icons.Book className="text-blue-600" size={24} />
                          Uppförandekod för Matteytan.se
                      </h2>
                      <button 
                        onClick={() => setShowCoC(false)}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                      >
                        <Icons.X size={24} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-thin">
                      <section>
                          <h3 className="text-lg font-black text-slate-800 mb-3">Välkommen!</h3>
                          <p className="text-slate-600 leading-relaxed">
                              Vi strävar efter att göra Matteytan.se till en vänlig, välkomnande och trygg plats där alla kan lära sig, nätverka och växa tillsammans – helt fritt från trakasserier och dömande attityder.
                          </p>
                          <p className="text-slate-600 leading-relaxed mt-4">
                              Som en öppen community har vi medlemmar med olika bakgrund, könsidentitet, ålder, utbildningsnivå och erfarenhet. Vi förväntar oss att alla känner sig välkomna här, oavsett om du är nybörjare på matematik eller expert.
                          </p>
                      </section>

                      <section>
                          <h3 className="text-lg font-black text-slate-800 mb-4 border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">Våra grundregler</h3>
                          <p className="text-slate-600 leading-relaxed mb-6">Vi förväntar oss att alla användare följer dessa tre grundprinciper i all kommunikation på plattformen:</p>
                          
                          <div className="space-y-6">
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <h4 className="font-bold text-slate-800 mb-2">1. Vi agerar med omtanke</h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                      Vi tänker efter innan vi skriver. Vi förstår att det finns en riktig människa bakom skärmen. Vi låter inte frustration över ett svårt matteproblem eller en diskussion förvandlas till personangrepp. En community där folk känner sig otrygga är inte en produktiv plats för lärande.
                                  </p>
                              </div>

                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <h4 className="font-bold text-slate-800 mb-2">2. Vi är tålmodiga och snälla</h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                      Vi avfärdar inte någon för att de har en annan kunskapsnivå eller bakgrund än vi själva.
                                      <br/><br/>
                                      <strong>På Matteytan.se finns inga dumma frågor.</strong>
                                      <br/><br/>
                                      Vi är respektfulla även när vi inte håller med varandra. Vi hånar aldrig någon för att de svarar fel eller inte förstår en uppgift direkt.
                                  </p>
                              </div>

                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <h4 className="font-bold text-slate-800 mb-2">3. Vi tar ansvar och rättar till misstag</h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                      Ingen förväntas vara perfekt eller veta allt. Ibland kan även goda intentioner få fel utfall. Det viktiga är hur vi hanterar det. Om någon påpekar att ditt beteende har varit sårande: lyssna utan att gå i försvarsställning, ta till dig kritiken och försök lösa situationen konstruktivt.
                                  </p>
                              </div>
                          </div>
                      </section>

                      <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
                          <h3 className="text-lg font-black text-red-800 mb-4 flex items-center gap-2">
                             <Icons.X className="text-red-500" size={20} />
                             Nolltolerans
                          </h3>
                          <p className="text-red-900/70 text-sm mb-4">För att garantera en trygg miljö accepterar vi inte följande beteenden:</p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-red-900/80 text-xs font-semibold">
                              <li>• Våldsamma hot eller språk</li>
                              <li>• Diskriminerande kommentarer</li>
                              <li>• Bristande respekt för identitet</li>
                              <li>• Sexuellt eller våldsamt material</li>
                              <li>• Doxxing (privat information)</li>
                              <li>• Förolämpningar och kränkningar</li>
                              <li>• Trakasserier</li>
                              <li>• Uppmuntran till ovanstående</li>
                          </ul>
                      </section>

                      <section>
                          <h3 className="text-lg font-black text-slate-800 mb-3">Så hanterar vi överträdelser</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                              Om något har hänt som får dig att känna dig exkluderad eller otrygg, eller om du ser någon annan bli utsatt:
                          </p>
                          <ul className="mt-4 space-y-3 text-slate-600 text-sm">
                              <li><strong>• Om du känner dig trygg:</strong> Försök prata med personen privat. Ofta kan missförstånd lösas genom en lugn dialog.</li>
                              <li><strong>• Om det inte känns tryggt:</strong> Kontakta oss (administratörerna) direkt.</li>
                          </ul>
                          <p className="text-slate-500 text-[10px] mt-4 italic">
                              När du rapporterar en incident till oss tar vi det på största allvar. Vi hanterar alla rapporter konfidentiellt om så önskas.
                          </p>
                      </section>

                      <section className="pb-6">
                          <h3 className="text-lg font-black text-slate-800 mb-3 text-sm uppercase tracking-widest">Konsekvenser</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                              Moderatorer och administratörer på Matteytan.se har rätt att agera vid brott mot denna uppförandekod. Beroende på hur allvarlig händelsen är kan det leda till: 
                              Varning, radering av inlägg, tillfällig avstängning eller permanent bannlysning. Vid allvarliga fall kan polisanmälan göras.
                          </p>
                      </section>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                      <button 
                        onClick={() => setShowCoC(false)}
                        className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest"
                      >
                        Jag förstår
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
