
import React, { useState, useRef } from 'react';
import { Icons } from '../icons';

interface MathWorkshopWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

type TabType = 'NUMBERS' | 'SYMBOLS' | 'SHAPES';

interface Asset {
    id: string; 
    type: 'NUMBER' | 'SYMBOL' | 'SHAPE';
    label: string;
    speakText: string;
    content: React.ReactNode;
    bgColor?: string;
    textColor?: string;
}

interface CanvasItem extends Asset {
    instanceId: string;
    x: number;
    y: number;
}

const NUMBER_COLORS = ['#e2e8f0','#fee2e2','#dcfce7','#fef9c3','#dbeafe','#ffedd5','#f3e8ff','#fce7f3','#ccfbf1','#e0e7ff'];

const NUMBERS: Asset[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `num-${i}`,
    type: 'NUMBER',
    label: i.toString(),
    speakText: i.toString(),
    content: <span className="text-2xl sm:text-4xl font-black">{i}</span>,
    bgColor: NUMBER_COLORS[i],
    textColor: '#1e293b'
}));

const SYMBOLS: Asset[] = [
    { id: 'sym-plus', type: 'SYMBOL', label: '+', speakText: 'Plustecken', content: <Icons.Plus size={24} strokeWidth={3} />, bgColor: '#fef08a' },
    { id: 'sym-minus', type: 'SYMBOL', label: '−', speakText: 'Minustecken', content: <Icons.Minimize size={24} strokeWidth={3} />, bgColor: '#fef08a' },
    { id: 'sym-mult', type: 'SYMBOL', label: '×', speakText: 'Gångertecken', content: <Icons.X size={24} strokeWidth={3} />, bgColor: '#fef08a' },
    { id: 'sym-div', type: 'SYMBOL', label: '÷', speakText: 'Divisionstecken', content: <span className="text-2xl sm:text-4xl font-black">÷</span>, bgColor: '#fef08a' },
    { id: 'sym-eq', type: 'SYMBOL', label: '=', speakText: 'Lika med', content: <span className="text-2xl sm:text-4xl font-black">=</span>, bgColor: '#ffffff' },
    { id: 'sym-lt', type: 'SYMBOL', label: '<', speakText: 'Mindre än', content: <span className="text-2xl sm:text-4xl font-black">&lt;</span>, bgColor: '#ffffff' },
    { id: 'sym-gt', type: 'SYMBOL', label: '>', speakText: 'Större än', content: <span className="text-2xl sm:text-4xl font-black">&gt;</span>, bgColor: '#ffffff' },
];

const SHAPES: Asset[] = [
    { id: 'shape-circle', type: 'SHAPE', label: 'Cirkel', speakText: 'Cirkel', bgColor: 'transparent', content: <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-500 border-2 border-blue-700"></div> },
    { id: 'shape-square', type: 'SHAPE', label: 'Kvadrat', speakText: 'Kvadrat', bgColor: 'transparent', content: <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 border-2 border-green-700"></div> },
    { id: 'shape-tri', type: 'SHAPE', label: 'Triangel', speakText: 'Triangel', bgColor: 'transparent', content: <div className="w-0 h-0 border-l-[12px] sm:border-l-[24px] border-r-[12px] sm:border-r-[24px] border-b-[20px] sm:border-b-[40px] border-l-transparent border-r-transparent border-b-purple-500"></div> },
];

export const MathWorkshopWidget: React.FC<MathWorkshopWidgetProps> = ({ isTransparent }) => {
  const [activeTab, setActiveTab] = useState<TabType>('NUMBERS');
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const speak = (text: string) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'sv-SE';
      window.speechSynthesis.speak(u);
  };

  const addItemFromSidebar = (asset: Asset) => {
      speak(asset.speakText);
      const newItem: CanvasItem = {
          ...asset,
          instanceId: Date.now().toString() + Math.random(),
          x: 50 + Math.random() * 50,
          y: 50 + Math.random() * 50
      };
      setItems(prev => [...prev, newItem]);
  };

  const startMove = (e: React.MouseEvent | React.TouchEvent, id: string) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const item = items.find(i => i.instanceId === id);
      if (!item) return;

      setDraggingId(id);
      dragOffset.current = { x: clientX - item.x, y: clientY - item.y };
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!draggingId || !canvasRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const finalX = clientX - rect.left - dragOffset.current.x;
      const finalY = clientY - rect.top - dragOffset.current.y;

      setItems(prev => prev.map(i => i.instanceId === draggingId ? { ...i, x: finalX, y: finalY } : i));
  };

  const deleteItem = (id: string) => setItems(prev => prev.filter(i => i.instanceId !== id));

  const renderAsset = (asset: Asset, isSidebar = false) => (
      <div 
        key={isSidebar ? asset.id : (asset as CanvasItem).instanceId}
        onClick={() => isSidebar && addItemFromSidebar(asset)}
        className={`flex flex-col items-center justify-center transition-transform ${isSidebar ? 'w-12 h-16 sm:w-20 sm:h-24 m-0.5 sm:m-1 cursor-pointer hover:scale-105 active:scale-95' : 'w-20 h-20 sm:w-24 sm:h-24 cursor-move absolute shadow-xl rounded-xl'}`}
        style={!isSidebar ? { left: (asset as CanvasItem).x, top: (asset as CanvasItem).y, backgroundColor: asset.bgColor, color: asset.textColor, border: asset.type !== 'SHAPE' ? '2px solid rgba(0,0,0,0.1)' : 'none', touchAction: 'none' } : {}}
        onMouseDown={!isSidebar ? (e) => startMove(e, (asset as CanvasItem).instanceId) : undefined}
        onTouchStart={!isSidebar ? (e) => startMove(e, (asset as CanvasItem).instanceId) : undefined}
        onDoubleClick={!isSidebar ? () => deleteItem((asset as CanvasItem).instanceId) : undefined}
      >
          <div className={`flex items-center justify-center text-center ${isSidebar ? 'w-10 h-10 sm:w-16 sm:h-16 rounded-lg shadow-sm border border-slate-200' : 'w-full h-full'}`} style={isSidebar ? { backgroundColor: asset.bgColor, color: asset.textColor } : {}}>
              {asset.content}
          </div>
          {isSidebar && <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 truncate w-full text-center px-1">{asset.label}</span>}
      </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-white select-none overflow-hidden">
        <div className="flex justify-between items-center px-2 sm:px-4 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
            <div className="flex gap-1 sm:gap-2">
                {(['NUMBERS', 'SYMBOLS', 'SHAPES'] as TabType[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-2 sm:px-4 py-1.5 rounded-t-lg font-bold text-[10px] sm:text-sm transition-colors ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm border-x border-t border-slate-200' : 'text-slate-400'}`}>
                        {tab === 'NUMBERS' ? 'Siffror' : tab === 'SYMBOLS' ? 'Symboler' : 'Former'}
                    </button>
                ))}
            </div>
            <button onClick={() => setItems([])} className="p-2 text-slate-400 hover:text-red-500"><Icons.Trash size={16} /></button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
            <div className="h-24 sm:h-auto sm:w-24 md:w-48 bg-slate-100 border-b sm:border-r border-slate-200 overflow-x-auto sm:overflow-y-auto p-1 sm:p-2 flex sm:flex-wrap content-start items-center sm:justify-center gap-1 shadow-inner">
                {activeTab === 'NUMBERS' && NUMBERS.map(a => renderAsset(a, true))}
                {activeTab === 'SYMBOLS' && SYMBOLS.map(a => renderAsset(a, true))}
                {activeTab === 'SHAPES' && SHAPES.map(a => renderAsset(a, true))}
            </div>

            <div 
                ref={canvasRef}
                className="flex-1 relative bg-grid-pattern overflow-hidden touch-none"
                onMouseMove={onMove}
                onMouseUp={() => setDraggingId(null)}
                onTouchMove={onMove}
                onTouchEnd={() => setDraggingId(null)}
            >
                {items.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none text-center p-4"><p className="text-sm sm:text-lg font-bold">Klicka på objekt för att lägga till dem</p></div>}
                {items.map(item => renderAsset(item, false))}
            </div>
        </div>
    </div>
  );
};
