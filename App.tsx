
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
import { ClockLabWidget } from './components/widgets/ClockLabWidget';
import { EconomyWidget } from './components/widgets/EconomyWidget';
import { MultiMatchWidget } from './components/widgets/MultiMatchWidget';
import { Icons } from './components/icons';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';

const BACKGROUNDS: BackgroundConfig[] = [
  { type: 'GRID', label: 'Rutnät', className: 'bg-grid-pattern' },
  { type: 'DOTS', label: 'Prickar', className: 'bg-dot-pattern' },
  { type: 'WHITE', label: 'Vit', className: 'bg-white' },
  { type: 'BLACK', label: 'Svart', className: 'bg-slate-900' },
];

const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              Om Matteytan – <span className="text-blue-600">Där abstrakt matematik blir konkret</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <Icons.Close size={24} />
            </button>
          </div>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p className="text-lg font-medium text-slate-700">
              Välkommen till Matteytan. Vi vet att matematiklärare ofta tvingas hoppa mellan olika flikar, fysiska plockmaterial och statiska presentationer för att få fram sin poäng. Matteytan är lösningen på det problemet – en samlad, digital startpunkt för dina lektioner.
            </p>

            <section>
              <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-2">Vad är Matteytan?</h3>
              <p>Tänk dig en klassisk whiteboard, fast smartare. Matteytan fungerar som en interaktiv canvas där du fritt placerar ut skräddarsydda "widgets" anpassade för matematikundervisning.</p>
            </section>

            <section>
              <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-2">Varför använda Matteytan?</h3>
              <p className="mb-4">Vi bygger våra verktyg på beprövad matematikdidaktik. Vi vet att elever lär sig bäst när de får se och pröva själva. Därför erbjuder vi verktyg som:</p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 text-blue-500"><Icons.Sparkles size={18}/></div>
                  <div><strong className="text-slate-800">Visualiserar det osynliga:</strong> Med Bråkstavarna och Prim-bubblorna blir abstrakta talrelationer fysiska objekt som går att flytta och kombinera.</div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-blue-500"><Icons.Scale size={18}/></div>
                  <div><strong className="text-slate-800">Bygger broar till algebra:</strong> Genom Tändsticksgåtan och Ekvationsvågen hjälper vi elever att gå från konkret plockmaterial till att förstå variabler och formler.</div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-blue-500"><Icons.Tools size={18}/></div>
                  <div><strong className="text-slate-800">Sparar tid:</strong> Slipp leta efter linjaler eller tärningar. Med Geometri-kitet och Chans-generatorn har du alltid verktygen ett klick bort.</div>
                </li>
              </ul>
            </section>

            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">För svenska klassrum</h3>
              <p className="text-sm">Matteytan är utvecklad med den svenska läroplanen i åtanke. Från tallinjer och koordinatsystem till sannolikhetslära – allt är designat för att passa in direkt i din undervisning, oavsett om du undervisar på låg-, mellan- eller högstadiet.</p>
            </section>

            <p className="text-center font-black text-slate-400 uppercase text-xs tracking-[0.2em] pt-4">
              Inga onödiga animationer. Inget krångel. Bara en ren yta för matematik.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-black text-sm shadow-lg hover:bg-blue-700 transition-all"
          >
            FÖRSTÅTT!
          </button>
        </div>
      </div>
    </div>
  );
};

const CodeOfConductModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              Uppförandekod för <span className="text-indigo-600">Matteytan.se</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <Icons.Close size={24} />
            </button>
          </div>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-lg font-black text-indigo-900 mb-2">Välkommen!</h3>
              <p className="text-indigo-800/80 font-medium">
                Vi strävar efter att göra Matteytan.se till en vänlig, välkomnande och trygg plats där alla kan lära sig, nätverka och växa tillsammans – helt fritt från trakasserier och dömande attityder.
              </p>
            </div>

            <p>Som en öppen community har vi medlemmar med olika bakgrund, könsidentitet, ålder, utbildningsnivå och erfarenhet. Vi förväntar oss att alla känner sig välkomna här, oavsett om du är nybörjare på matematik eller expert.</p>

            <section>
              <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-4">Våra grundregler</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black">1</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Vi agerar med omtanke</h4>
                    <p className="text-sm">Vi tänker efter innan vi skriver. Vi förstår att det finns en riktig människa bakom skärmen. Vi låter inte frustration över ett svårt matteproblem eller en diskussion förvandlas till personangrepp.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black">2</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Vi är tålmodiga och snälla</h4>
                    <p className="text-sm">Vi avfärdar inte någon för att de har en annan kunskapsnivå eller bakgrund än vi själva. På Matteytan.se finns inga dumma frågor. Vi hånar aldrig någon för att de svarar fel.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black">3</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Vi tar ansvar och rättar till misstag</h4>
                    <p className="text-sm">Ingen förväntas veta allt. Om någon påpekar att ditt beteende har varit sårande: lyssna utan att gå i försvarsställning, ta till dig kritiken och försök lösa situationen konstruktivt.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
              <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-3">Nolltolerans</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-bold text-rose-800/70">
                <li>• Våldsamma hot</li>
                <li>• Diskriminerande kommentarer</li>
                <li>• Kränkande ordval</li>
                <li>• Trakasserier</li>
                <li>• Doxxing (privat info)</li>
                <li>• Explicit material</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Så hanterar vi överträdelser</h3>
              <p className="text-sm">Om något har hänt som får dig att känna dig exkluderad eller otrygg: Försök prata med personen privat om det känns tryggt, annars kontakta administratörerna direkt. Vi hanterar alla rapporter konfidentiellt.</p>
            </section>

            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Konsekvenser</h3>
              <p className="text-sm">Moderatorer har rätt att agera vid brott mot denna kod. Detta kan leda till varning, radering av inlägg, tillfällig avstängning eller permanent bannlysning. Vid allvarliga fall görs polisanmälan.</p>
            </section>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-sm shadow-lg hover:bg-indigo-700 transition-all"
          >
            JAG ACCEPTERAR
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [background, setBackground] = useState<BackgroundType>('GRID');
  const [topZ, setTopZ] = useState(150); 
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCoCOpen, setIsCoCOpen] = useState(false);
  
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
          case WidgetType.NUMBER_BEADS: return { w: clampW(850), h: clampH(720) };
          case WidgetType.FRACTION: return { w: clampW(550), h: clampH(350) };
          case WidgetType.RULER: return { w: clampW(500), h: 200 };
          case WidgetType.PROTRACTOR: return { w: clampW(450), h: 300 };
          case WidgetType.EQUATION: return { w: clampW(600), h: clampH(650) };
          case WidgetType.HUNDRED_CHART: return { w: clampW(500), h: clampH(650) };
          case WidgetType.NUMBER_OF_DAY: return { w: clampW(450), h: clampH(750) };
          case WidgetType.FRACTION_BARS: return { w: clampW(800), h: clampH(550) };
          case WidgetType.NUMBER_HOUSE: return { w: clampW(380), h: clampH(580) };
          case WidgetType.CALCULATOR: return { w: clampW(360), h: clampH(580) };
          case WidgetType.SHAPES: return { w: clampW(500), h: clampH(580) };
          case WidgetType.MATH_WORKSHOP: return { w: clampW(850), h: clampH(600) };
          case WidgetType.PRIME_BUBBLES: return { w: clampW(850), h: clampH(650) };
          case WidgetType.CHANCE_GENERATOR: return { w: clampW(380), h: clampH(580) };
          case WidgetType.CLOCK: return { w: clampW(700), h: clampH(550) };
          case WidgetType.ECONOMY: return { w: clampW(750), h: clampH(650) };
          case WidgetType.MULTI_MATCH: return { w: clampW(450), h: clampH(750) };
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
      case WidgetType.CLOCK: return <ClockLabWidget />;
      case WidgetType.ECONOMY: return <EconomyWidget {...props} />;
      case WidgetType.MULTI_MATCH: return <MultiMatchWidget {...props} />;
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
      case WidgetType.CLOCK: return 'Klock-Labbet';
      case WidgetType.ECONOMY: return 'Ekonomi-Kollen';
      case WidgetType.MULTI_MATCH: return 'Multi-Matchen';
      default: return 'Verktyg';
    }
  };

  const EXTRA_TOOLS = [
    { type: WidgetType.MATH_WORKSHOP, icon: Icons.Tools, label: 'Verkstad' },
    { type: WidgetType.MULTI_MATCH, icon: Icons.Zap, label: 'Multi-Match' },
    { type: WidgetType.CHANCE_GENERATOR, icon: Icons.Shuffle, label: 'Slump-gen' },
    { type: WidgetType.ECONOMY, icon: Icons.Wallet, label: 'Ekonomi' },
    { type: WidgetType.CLOCK, icon: Icons.Clock, label: 'Klocka' },
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
         
         {/* FEEDBACK LINK */}
         <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSegCGpTPfvN7R2A1WOWsDS5qZuM_JDKJiTvG1gRtCCF2l8Uvw/viewform?usp=sharing&ouid=116333036204575168879"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm"
         >
             <Icons.Feedback size={16} /> <span className="hidden md:inline">GE FEEDBACK</span>
         </a>

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

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      
      {/* Code of Conduct Modal */}
      <CodeOfConductModal isOpen={isCoCOpen} onClose={() => setIsCoCOpen(false)} />

      {/* GLOBAL FOOTER ELEMENTS */}
      
      {/* Bottom Left: Creative Commons */}
      <div className="absolute bottom-4 left-6 z-[150] pointer-events-auto flex items-center gap-2 transition-opacity duration-300 text-shadow-sm">
          <svg className="w-4 h-4 text-slate-400 opacity-80" viewBox="0 0 496 512" fill="currentColor">
            <path d="M245.83 214.87l-33.22 17.28c-9.43-19.58-25.24-19.93-27.46-19.93-22.13 0-33.22 14.61-33.22 43.89 0 23.57 9.21 43.89 33.22 43.89 20 0 33.22-14.61 33.22-43.89h33.22c0 46.14-31.09 77.12-66.44 77.12-46.92 0-66.44-32.63-66.44-77.12 0-43.55 17.28-77.12 66.44-77.12 26.74 0 53.21 10.82 66.44 35.88zm143.84 0l-33.22 17.28c-9.43-19.58-25.24-19.93-27.46-19.93-22.13 0-33.22 14.61-33.22 43.89 0 23.57 9.21 43.89 33.22 43.89 20 0 33.22-14.61 33.22-43.89h33.22c0 46.14-31.09 77.12-66.44 77.12-46.92 0-66.44-32.63-66.44-77.12 0-43.55 17.28-77.12 66.44-77.12 26.74 0 53.21 10.82 66.44 35.88zM247.7 8C104.74 8 8 123.04 8 256c0 132.96 96.74 248 239.7 248 142.96 0 248.3-115.04 248.3-248C496 123.04 390.66 8 247.7 8zm.3 450.7c-112.03 0-203-90.97-203-203s90.97-203 203-203 203 90.97 203 203-90.97 203-203 203z"/>
          </svg>
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">
              LICENS: CC0 1.0 UNIVERSAL
          </div>
      </div>

      {/* Bottom Center: Main Links (Below Widget Menu) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-6 pointer-events-auto transition-opacity duration-300">
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
          >
            Om Matteytan
          </button>
          <button 
            onClick={() => setIsCoCOpen(true)}
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
          >
            Uppförandekod
          </button>
      </div>

      {/* Bottom Right: Netlify Link */}
      <div className="absolute bottom-4 right-6 z-[150] pointer-events-auto transition-opacity duration-300">
          <a 
            href="https://www.netlify.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            This site is powered by Netlify
          </a>
      </div>

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
