import React, { useState, useRef } from 'react';
import { Icons } from '../icons';

interface MathWorkshopWidgetProps {
  isTransparent?: boolean;
}

type TabType = 'NUMBERS' | 'SYMBOLS' | 'SHAPES';

// Define Asset Types
interface Asset {
    id: string; // Unique for drag source
    type: 'NUMBER' | 'SYMBOL' | 'SHAPE';
    label: string;
    speakText: string;
    content: React.ReactNode;
    bgColor?: string;
    textColor?: string;
}

// Canvas Item (Instance on the board)
interface CanvasItem extends Asset {
    instanceId: string;
    x: number;
    y: number;
}

// --- ASSET DATA ---

const NUMBER_COLORS = [
    '#e2e8f0', // 0 - Gray
    '#fee2e2', // 1 - Red
    '#dcfce7', // 2 - Green
    '#fef9c3', // 3 - Yellow
    '#dbeafe', // 4 - Blue
    '#ffedd5', // 5 - Orange
    '#f3e8ff', // 6 - Purple
    '#fce7f3', // 7 - Pink
    '#ccfbf1', // 8 - Teal
    '#e0e7ff', // 9 - Indigo
];

const NUMBERS: Asset[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `num-${i}`,
    type: 'NUMBER',
    label: i.toString(),
    speakText: i.toString(),
    content: <span className="text-4xl font-black">{i}</span>,
    bgColor: NUMBER_COLORS[i],
    textColor: '#1e293b'
}));

const SYMBOLS: Asset[] = [
    { id: 'sym-plus', type: 'SYMBOL', label: '+', speakText: 'Plustecken', content: <Icons.Plus size={32} strokeWidth={3} />, bgColor: '#fef08a' },
    { id: 'sym-minus', type: 'SYMBOL', label: '−', speakText: 'Minustecken', content: <Icons.Minimize size={32} strokeWidth={3} />, bgColor: '#fef08a' }, // Using Minimize icon as minus
    { id: 'sym-mult', type: 'SYMBOL', label: '×', speakText: 'Gångertecken', content: <Icons.X size={32} strokeWidth={3} />, bgColor: '#fef08a' },
    { id: 'sym-div', type: 'SYMBOL', label: '÷', speakText: 'Divisionstecken', content: <span className="text-4xl font-black">÷</span>, bgColor: '#fef08a' },
    { id: 'sym-eq', type: 'SYMBOL', label: '=', speakText: 'Lika med', content: <span className="text-4xl font-black">=</span>, bgColor: '#ffffff' },
    { id: 'sym-lt', type: 'SYMBOL', label: '<', speakText: 'Mindre än', content: <span className="text-4xl font-black">&lt;</span>, bgColor: '#ffffff' },
    { id: 'sym-gt', type: 'SYMBOL', label: '>', speakText: 'Större än', content: <span className="text-4xl font-black">&gt;</span>, bgColor: '#ffffff' },
    { id: 'sym-pct', type: 'SYMBOL', label: '%', speakText: 'Procent', content: <Icons.Percent size={32} strokeWidth={3} />, bgColor: '#ffffff' },
];

const SHAPES: Asset[] = [
    // 2D
    { id: 'shape-circle', type: 'SHAPE', label: 'Cirkel', speakText: 'Cirkel', bgColor: 'transparent', content: <div className="w-12 h-12 rounded-full bg-blue-500 border-2 border-blue-700"></div> },
    { id: 'shape-square', type: 'SHAPE', label: 'Kvadrat', speakText: 'Kvadrat', bgColor: 'transparent', content: <div className="w-12 h-12 bg-green-500 border-2 border-green-700"></div> },
    { id: 'shape-rect', type: 'SHAPE', label: 'Rektangel', speakText: 'Rektangel', bgColor: 'transparent', content: <div className="w-16 h-10 bg-orange-500 border-2 border-orange-700"></div> },
    { id: 'shape-tri', type: 'SHAPE', label: 'Triangel', speakText: 'Triangel', bgColor: 'transparent', content: <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[40px] border-l-transparent border-r-transparent border-b-purple-500 filter drop-shadow-sm"></div> },
    
    // 3D
    { id: 'shape-cube', type: 'SHAPE', label: 'Kub', speakText: 'Kub', bgColor: 'transparent', content: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fill-pink-200">
            <path d="M21 16.5A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9z" stroke="none" /> 
            <path d="M7 3l14 4-4 4-14-4 4-4z" className="fill-pink-300" stroke="currentColor"/> 
            <path d="M3 7v10c0 2.5 2.5 4 4.5 4h9c2 0 4.5-1.5 4.5-4V7" stroke="currentColor"/>
            <path d="M7 7v14" stroke="currentColor"/>
            <path d="M21 7l-4 4" stroke="currentColor"/>
        </svg>
    )}, // Simplified Cube SVG
    { id: 'shape-cyl', type: 'SHAPE', label: 'Cylinder', speakText: 'Cylinder', bgColor: 'transparent', content: (
        <div className="relative w-10 h-14">
            <div className="absolute top-0 w-full h-4 bg-teal-300 rounded-full border-2 border-teal-600 z-10"></div>
            <div className="absolute top-2 w-full h-10 bg-teal-200 border-x-2 border-teal-600"></div>
            <div className="absolute bottom-0 w-full h-4 bg-teal-200 rounded-full border-2 border-teal-600"></div>
        </div>
    )},
    { id: 'shape-cone', type: 'SHAPE', label: 'Kon', speakText: 'Kon', bgColor: 'transparent', content: (
         <div className="relative w-12 h-14 flex justify-center">
            <div className="absolute bottom-0 w-full h-4 bg-yellow-300 rounded-full border-2 border-yellow-600 z-10"></div>
            <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[50px] border-l-transparent border-r-transparent border-b-yellow-200 absolute bottom-2 filter drop-shadow-sm border-b-[solid]"></div>
         </div>
    )},
     { id: 'shape-sphere', type: 'SHAPE', label: 'Klot', speakText: 'Klot', bgColor: 'transparent', content: (
        <div className="w-12 h-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#fff,_#ef4444)] border border-red-200 shadow-sm"></div>
    )},
];

export const MathWorkshopWidget: React.FC<MathWorkshopWidgetProps> = ({ isTransparent }) => {
  const [activeTab, setActiveTab] = useState<TabType>('NUMBERS');
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [posterMode, setPosterMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- TTS ---
  const speak = (text: string) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'sv-SE';
      window.speechSynthesis.speak(u);
  };

  // --- DRAG AND DROP (Sidebar -> Canvas) ---
  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
      speak(asset.speakText); 
      // Changed: Send ID only. ReactNode in 'content' cannot be stringified safely.
      e.dataTransfer.setData('text/plain', asset.id);
      e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      
      try {
          const id = e.dataTransfer.getData('text/plain');
          
          // Find original asset to get the content back
          const allAssets = [...NUMBERS, ...SYMBOLS, ...SHAPES];
          const asset = allAssets.find(a => a.id === id);

          if (asset) {
            const newItem: CanvasItem = {
                ...asset,
                instanceId: Date.now().toString() + Math.random(),
                x: clientX - rect.left - 40, // Center approx
                y: clientY - rect.top - 40
            };
            setItems(prev => [...prev, newItem]);
          }
      } catch (err) {
          console.error("Drop failed", err);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
  };

  // --- INTERNAL DRAGGING (Canvas -> Canvas) ---
  const startMove = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Prevent WidgetWrapper drag
      e.preventDefault();
      
      const item = items.find(i => i.instanceId === id);
      if (!item) return;

      setDraggingId(id);
      // Calculate offset from top-left of the item
      dragOffset.current = {
          x: e.clientX - item.x,
          y: e.clientY - item.y
      };
      
      // Speak on click/move start? Maybe annoying if repeated. Let's stick to sidebar click for TTS.
  };

  const onMouseMove = (e: React.MouseEvent) => {
      if (!draggingId || !canvasRef.current) return;
      e.stopPropagation();
      e.preventDefault();
      
      const rect = canvasRef.current.getBoundingClientRect();
      // Calculate new position relative to canvas
      // Simplified: X = MouseX - CanvasLeft - OffsetX
      const finalX = e.clientX - rect.left - dragOffset.current.x;
      const finalY = e.clientY - rect.top - dragOffset.current.y;

      setItems(prev => prev.map(i => 
          i.instanceId === draggingId 
              ? { ...i, x: finalX, y: finalY }
              : i
      ));
  };

  const onMouseUp = () => {
      setDraggingId(null);
  };

  const deleteItem = (id: string) => {
      setItems(prev => prev.filter(i => i.instanceId !== id));
  };

  // --- ASSET RENDERER ---
  const renderAsset = (asset: Asset, isSidebar = false) => (
      <div 
        draggable={isSidebar}
        onDragStart={(e) => isSidebar && handleDragStart(e, asset)}
        onClick={() => isSidebar && speak(asset.speakText)}
        className={`
            flex flex-col items-center justify-center 
            ${isSidebar 
                ? 'w-20 h-24 m-1 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' 
                : 'w-24 h-24 cursor-move shadow-xl rounded-xl absolute animate-in zoom-in duration-200'
            }
        `}
        style={!isSidebar ? { 
            left: (asset as CanvasItem).x, 
            top: (asset as CanvasItem).y,
            backgroundColor: asset.bgColor,
            color: asset.textColor,
            border: asset.type !== 'SHAPE' ? '2px solid rgba(0,0,0,0.1)' : 'none'
        } : {}}
        onMouseDown={!isSidebar ? (e) => startMove(e, (asset as CanvasItem).instanceId) : undefined}
        onDoubleClick={!isSidebar ? (e) => { e.stopPropagation(); deleteItem((asset as CanvasItem).instanceId); } : undefined}
      >
          {/* Card Body */}
          <div className={`
              flex items-center justify-center text-center
              ${isSidebar ? 'w-16 h-16 rounded-lg shadow-sm border border-slate-200 mb-1' : 'w-full h-full'}
          `}
          style={isSidebar ? { backgroundColor: asset.bgColor, color: asset.textColor } : {}}
          >
              {asset.content}
          </div>
          
          {/* Label (Sidebar Only) */}
          {isSidebar && (
              <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center px-1">
                  {asset.label}
              </span>
          )}
      </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-white select-none">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-slate-50">
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('NUMBERS')}
                    className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeTab === 'NUMBERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Siffror
                </button>
                <button 
                    onClick={() => setActiveTab('SYMBOLS')}
                    className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeTab === 'SYMBOLS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Symboler
                </button>
                <button 
                    onClick={() => setActiveTab('SHAPES')}
                    className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeTab === 'SHAPES' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Former
                </button>
            </div>
            
            <button 
                onClick={() => setPosterMode(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors"
            >
                <Icons.Grid size={16} /> Visa alla
            </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* SIDEBAR (Toolbox) */}
            <div className="w-64 bg-slate-100 border-r border-slate-200 overflow-y-auto p-2 flex flex-wrap content-start justify-center shadow-inner gap-1">
                {activeTab === 'NUMBERS' && NUMBERS.map(a => renderAsset(a, true))}
                {activeTab === 'SYMBOLS' && SYMBOLS.map(a => renderAsset(a, true))}
                {activeTab === 'SHAPES' && SHAPES.map(a => renderAsset(a, true))}
            </div>

            {/* CANVAS (Workspace) */}
            <div 
                ref={canvasRef}
                className="flex-1 relative bg-grid-pattern overflow-hidden cursor-default"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                {items.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none">
                        <div className="text-center">
                            <Icons.Move size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xl font-bold">Dra objekt hit</p>
                        </div>
                    </div>
                )}
                
                {items.map(item => (
                    <div key={item.instanceId}>
                        {renderAsset(item, false)}
                    </div>
                ))}
                
                {/* Trash Zone Hint */}
                {draggingId && (
                    <div className="absolute bottom-4 right-4 bg-red-100 text-red-400 p-2 rounded-full border border-red-200 animate-pulse">
                        <Icons.Trash size={24} />
                    </div>
                )}
            </div>
        </div>

        {/* POSTER MODE OVERLAY */}
        {posterMode && (
            <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur flex flex-col p-8 overflow-y-auto animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-slate-800">Matte-verkstad: Översikt</h2>
                    <button onClick={() => setPosterMode(false)} className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                        <Icons.Close size={32} />
                    </button>
                </div>
                
                <div className="space-y-12">
                    <section>
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 mb-4 pb-2">Siffror</h3>
                        <div className="flex flex-wrap gap-4">
                            {NUMBERS.map(a => renderAsset(a, true))}
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 mb-4 pb-2">Symboler</h3>
                        <div className="flex flex-wrap gap-4">
                            {SYMBOLS.map(a => renderAsset(a, true))}
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 mb-4 pb-2">Former</h3>
                        <div className="flex flex-wrap gap-4">
                            {SHAPES.map(a => renderAsset(a, true))}
                        </div>
                    </section>
                </div>
            </div>
        )}
    </div>
  );
};