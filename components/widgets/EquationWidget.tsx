import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

// --- TYPES ---

type ItemType = 'X' | 'ONE' | 'NEG_ONE';

interface EqItem {
    id: string;
    type: ItemType;
}

interface EquationWidgetProps {
  isTransparent?: boolean;
}

// --- SUB-COMPONENT: SCALE ITEM ---
const ScaleItem: React.FC<{ item: EqItem, onClick: () => void }> = ({ item, onClick }) => {
    if (item.type === 'X') {
        return (
            <div 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="relative w-12 h-12 bg-blue-500 border-2 border-blue-600 rounded-lg shadow-[0_4px_0_rgb(29,78,216)] text-white flex items-center justify-center font-bold text-lg cursor-pointer hover:bg-red-500 hover:border-red-600 hover:shadow-[0_4px_0_rgb(220,38,38)] hover:-translate-y-1 transition-all group mb-1" 
                title="Variabel X (Klicka för att ta bort)"
            >
                x
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Icons.Close size={24} />
                </div>
            </div>
        );
    }
    if (item.type === 'ONE') {
        return (
            <div 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="relative w-10 h-10 bg-amber-400 border-2 border-amber-600 rounded-md shadow-[0_3px_0_rgb(217,119,6)] text-amber-900 flex items-center justify-center font-bold text-base cursor-pointer hover:bg-red-500 hover:text-white hover:border-red-600 hover:shadow-[0_3px_0_rgb(220,38,38)] hover:-translate-y-1 transition-all group m-0.5" 
                title="Vikt 1 (Klicka för att ta bort)"
            >
                1
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Icons.Close size={18} />
                </div>
            </div>
        );
    }
    if (item.type === 'NEG_ONE') {
        return (
            <div className="relative group z-20 flex flex-col items-center" style={{ marginBottom: '45px', marginTop: '-30px' }}>
                {/* String */}
                <div className="w-0.5 h-12 bg-slate-400 group-hover:bg-red-300"></div>
                {/* Balloon */}
                <div 
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className="w-10 h-12 bg-red-500 border border-red-600 rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-110 hover:bg-red-600 transition-all shadow-inner relative -mt-1" 
                    title="Ballong -1 (Lyfter upp)"
                >
                    -1
                    <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-red-500 rotate-180"></div>
                    {/* Shine */}
                    <div className="absolute top-2 right-2 w-2 h-4 bg-white/20 rounded-full rotate-[-15deg]"></div>
                </div>
            </div>
        );
    }
    return null;
};

export const EquationWidget: React.FC<EquationWidgetProps> = ({ isTransparent }) => {
  const [itemsL, setItemsL] = useState<EqItem[]>([]);
  const [itemsR, setItemsR] = useState<EqItem[]>([]);
  const [xValue, setXValue] = useState<number>(4); 
  const [isBalanced, setIsBalanced] = useState(false);
  const [tilt, setTilt] = useState(0); // Degrees
  
  // Input state
  const [inputStr, setInputStr] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- HELPERS ---

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const createItem = (type: ItemType): EqItem => ({ id: generateId(), type });

  // Generate the math string from items (e.g. "2x + 1")
  const getSideString = (items: EqItem[]) => {
      let xCount = 0;
      let constant = 0;
      items.forEach(i => {
          if (i.type === 'X') xCount++;
          if (i.type === 'ONE') constant++;
          if (i.type === 'NEG_ONE') constant--;
      });

      if (xCount === 0 && constant === 0) return '0';

      const parts = [];
      if (xCount > 0) parts.push(xCount === 1 ? 'x' : `${xCount}x`);
      
      if (constant !== 0) {
          if (parts.length > 0) {
              // We have Xs, so we need + or - separator
              if (constant > 0) parts.push(`+ ${constant}`);
              else parts.push(`- ${Math.abs(constant)}`);
          } else {
              // No Xs, just the number
              parts.push(`${constant}`);
          }
      }
      return parts.join(' ');
  };

  // --- PARSING LOGIC ---
  const parseAndLoad = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setErrorMsg("");

      if (!inputStr.trim()) return;

      const eq = inputStr.toLowerCase().replace(/\s+/g, ''); 
      const sides = eq.split('=');

      if (sides.length !== 2) {
          setErrorMsg("Använd likhetstecken (=)");
          return;
      }

      const parseSide = (str: string): EqItem[] => {
          const items: EqItem[] = [];
          // Split by + or - but keep the delimiter
          const terms = str.replace(/([+-])/g, '|$1').split('|').filter(t => t);

          terms.forEach(term => {
              if (term.includes('x')) {
                  // Variable
                  let coeffStr = term.replace('x', '');
                  if (coeffStr === '' || coeffStr === '+') coeffStr = '1';
                  if (coeffStr === '-') coeffStr = '-1';
                  
                  const coeff = parseInt(coeffStr, 10);
                  if (!isNaN(coeff)) {
                      if (coeff > 0) {
                          for(let i=0; i<coeff; i++) items.push(createItem('X'));
                      } else {
                          setErrorMsg("Negativa x stöds ej visuellt än.");
                      }
                  }
              } else {
                  // Constant
                  const val = parseInt(term, 10);
                  if (!isNaN(val)) {
                      if (val > 0) {
                          for(let i=0; i<val; i++) items.push(createItem('ONE'));
                      } else {
                          for(let i=0; i<Math.abs(val); i++) items.push(createItem('NEG_ONE'));
                      }
                  }
              }
          });
          return items;
      };

      const left = parseSide(sides[0]);
      const right = parseSide(sides[1]);

      // Calculate a suitable X to make it balance if possible, else default to 4
      let xCount = 0;
      let constCount = 0;
      
      const countSide = (arr: EqItem[], multiplier: number) => {
          arr.forEach(i => {
              if (i.type === 'X') xCount += multiplier;
              if (i.type === 'ONE') constCount += multiplier;
              if (i.type === 'NEG_ONE') constCount -= multiplier;
          });
      };
      
      // Left side positive, Right side negative (move to left)
      countSide(left, 1);
      countSide(right, -1);
      
      // Equation: xCount * X + constCount = 0  =>  xCount * X = -constCount  =>  X = -constCount / xCount
      if (xCount !== 0) {
          const solvedX = -constCount / xCount;
          if (solvedX > 0 && Number.isInteger(solvedX)) {
              setXValue(solvedX);
          } else {
              setXValue(5); // Default if solution is weird
          }
      }

      setItemsL(left);
      setItemsR(right);
  };

  // --- PHYSICS LOOP ---
  useEffect(() => {
      const calcMass = (items: EqItem[]) => {
          let m = 0;
          items.forEach(i => {
              if (i.type === 'X') m += xValue;
              if (i.type === 'ONE') m += 1;
              if (i.type === 'NEG_ONE') m -= 1;
          });
          return m;
      };

      const massL = calcMass(itemsL);
      const massR = calcMass(itemsR);
      const diff = massL - massR;
      
      setIsBalanced(diff === 0);
      
      // Max tilt 15 degrees
      const targetTilt = Math.max(-15, Math.min(15, diff * 2));
      setTilt(targetTilt);

  }, [itemsL, itemsR, xValue]);


  // --- INTERACTION ---
  const addItem = (side: 'L' | 'R', type: ItemType) => {
      const newItem = createItem(type);
      if (side === 'L') setItemsL([...itemsL, newItem]);
      else setItemsR([...itemsR, newItem]);
  };

  const removeItem = (side: 'L' | 'R', id: string) => {
      if (side === 'L') setItemsL(itemsL.filter(i => i.id !== id));
      else setItemsR(itemsR.filter(i => i.id !== id));
  };
  
  const clearAll = () => {
      setItemsL([]);
      setItemsR([]);
      setInputStr("");
      setErrorMsg("");
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 select-none min-h-[500px]">
      
      {/* 1. INPUT & CONTROL HEADER */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex gap-2 w-full">
              <form onSubmit={parseAndLoad} className="flex-1 flex gap-2">
                <input 
                    type="text" 
                    value={inputStr}
                    onChange={(e) => setInputStr(e.target.value)}
                    placeholder="Ekvation (t.ex. 2x + 1 = 9)"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-700 shadow-inner focus:ring-2 ring-blue-500 outline-none"
                />
                <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-sm">
                    Ladda
                </button>
              </form>
              <button onClick={clearAll} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Rensa">
                  <Icons.Trash size={20} />
              </button>
          </div>
          
          {errorMsg && <div className="text-xs font-bold text-red-500 px-1">{errorMsg}</div>}
          
          {/* Presets */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['x + 3 = 7', '2x = 8', '2x + 1 = x + 5'].map(eq => (
                  <button 
                    key={eq}
                    onClick={() => { setInputStr(eq); setTimeout(() => document.querySelector<HTMLButtonElement>('button[type=submit]')?.click(), 10); }}
                    className="whitespace-nowrap px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                      {eq}
                  </button>
              ))}
          </div>
      </div>

      {/* 2. DYNAMIC EQUATION DISPLAY */}
      <div className="flex justify-center items-center py-2 px-4 gap-6 bg-white rounded-xl border border-slate-200 shadow-sm min-h-[60px]">
          <div className="text-2xl font-mono font-bold text-slate-700 tracking-wide">
              {getSideString(itemsL)}
          </div>
          <div className={`text-3xl font-bold transition-colors duration-300 ${isBalanced ? 'text-green-500' : 'text-orange-400'}`}>
              {isBalanced ? '=' : '≠'}
          </div>
          <div className="text-2xl font-mono font-bold text-slate-700 tracking-wide">
              {getSideString(itemsR)}
          </div>
      </div>

      {/* 3. MAIN VISUALIZATION AREA */}
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-slate-200 relative overflow-hidden flex flex-col items-center justify-end shadow-inner">
           
           {/* Status Indicator (Floating Top) */}
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
               {isBalanced ? (
                   <div className="bg-green-500 border-2 border-green-400 text-white px-6 py-3 rounded-xl shadow-xl animate-in zoom-in slide-in-from-bottom-4 flex flex-col items-center">
                       <div className="flex items-center gap-2 mb-1">
                            <Icons.Scale size={20} className="stroke-[3px]" />
                            <span className="font-black uppercase tracking-widest text-sm">BALANS!</span>
                       </div>
                       <div className="bg-white/20 px-3 py-1 rounded text-lg font-mono font-bold">
                           Lösning: x = {xValue}
                       </div>
                   </div>
               ) : (
                   <div className="bg-white/80 backdrop-blur border border-red-200 text-red-500 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                       <Icons.Close size={16} />
                       <span className="font-bold text-xs uppercase tracking-wider">Obalans</span>
                   </div>
               )}
           </div>

           {/* --- THE SCALE RIG --- */}
           <div className="relative w-full h-[320px] flex justify-center items-end pb-8">
               
               {/* 1. Base (Static) */}
               <div className="absolute bottom-8 w-4 h-48 bg-slate-700 rounded-t-full z-10 shadow-xl"></div>
               <div className="absolute bottom-8 w-32 h-6 bg-slate-800 rounded-t-full z-10"></div>
               
               {/* 2. Beam Container (Rotates) */}
               <div 
                   className="absolute bottom-[200px] w-[80%] max-w-[500px] h-0 z-20 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                   style={{ transform: `rotate(${tilt}deg)` }}
               >
                   {/* The Beam Bar */}
                   <div className="absolute -top-3 left-0 w-full h-6 bg-slate-600 rounded-full border-b-4 border-slate-800 shadow-md flex items-center justify-between px-2">
                       {/* Pivot Point */}
                       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-300 rounded-full border-4 border-slate-600 shadow-inner z-30"></div>
                   </div>

                   {/* --- LEFT PAN ASSEMBLY --- */}
                   <div className="absolute left-4 top-0" style={{ transform: `rotate(${-tilt}deg)`, transition: 'transform 0.7s' }}>
                        {/* Chain */}
                        <div className="absolute top-0 left-0 w-[2px] h-32 bg-slate-400 origin-top -translate-x-1/2"></div>
                        
                        {/* Pan */}
                        <div className="absolute top-32 left-0 -translate-x-1/2 w-40 min-h-[10px]">
                            {/* Pan Dish */}
                            <div className="w-full h-4 bg-slate-800/20 border-b-4 border-slate-500 rounded-b-full absolute top-0 backdrop-blur-sm"></div>
                            
                            {/* Items Container (Grows upwards from pan) */}
                            <div className="flex flex-wrap-reverse justify-center gap-1 absolute bottom-0 w-full px-2 pb-1" style={{ transform: 'translateY(-4px)' }}>
                                {itemsL.map(item => (
                                    <ScaleItem key={item.id} item={item} onClick={() => removeItem('L', item.id)} />
                                ))}
                            </div>
                        </div>
                   </div>

                   {/* --- RIGHT PAN ASSEMBLY --- */}
                   <div className="absolute right-4 top-0" style={{ transform: `rotate(${-tilt}deg)`, transition: 'transform 0.7s' }}>
                        {/* Chain */}
                        <div className="absolute top-0 right-0 w-[2px] h-32 bg-slate-400 origin-top translate-x-1/2"></div>
                        
                        {/* Pan */}
                        <div className="absolute top-32 right-0 translate-x-1/2 w-40 min-h-[10px]">
                            {/* Pan Dish */}
                            <div className="w-full h-4 bg-slate-800/20 border-b-4 border-slate-500 rounded-b-full absolute top-0 backdrop-blur-sm"></div>
                            
                            {/* Items Container */}
                            <div className="flex flex-wrap-reverse justify-center gap-1 absolute bottom-0 w-full px-2 pb-1" style={{ transform: 'translateY(-4px)' }}>
                                {itemsR.map(item => (
                                    <ScaleItem key={item.id} item={item} onClick={() => removeItem('R', item.id)} />
                                ))}
                            </div>
                        </div>
                   </div>

               </div>
           </div>
      </div>

      {/* 4. MANUAL CONTROLS */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vänster Skål</span>
              <div className="flex gap-3">
                  <button onClick={() => addItem('L', 'X')} className="w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold shadow-sm border border-blue-200 flex flex-col items-center justify-center transition-all active:scale-95">
                      <span className="text-lg leading-none">x</span>
                  </button>
                  <button onClick={() => addItem('L', 'ONE')} className="w-12 h-12 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold shadow-sm border border-amber-200 flex flex-col items-center justify-center transition-all active:scale-95">
                      <span className="text-lg leading-none">1</span>
                  </button>
                  <button onClick={() => addItem('L', 'NEG_ONE')} className="w-12 h-12 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold shadow-sm border border-red-200 flex flex-col items-center justify-center transition-all active:scale-95">
                      <span className="text-lg leading-none">-1</span>
                  </button>
              </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Höger Skål</span>
              <div className="flex gap-3">
                  <button onClick={() => addItem('R', 'X')} className="w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold shadow-sm border border-blue-200 flex flex-col items-center justify-center transition-all active:scale-95">
                      <span className="text-lg leading-none">x</span>
                  </button>
                  <button onClick={() => addItem('R', 'ONE')} className="w-12 h-12 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold shadow-sm border border-amber-200 flex flex-col items-center justify-center transition-all active:scale-95">
                      <span className="text-lg leading-none">1</span>
                  </button>
                  <button onClick={() => addItem('R', 'NEG_ONE')} className="w-12 h-12 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold shadow-sm border border-red-200 flex flex-col items-center justify-center transition-all active:scale-95">
                      <span className="text-lg leading-none">-1</span>
                  </button>
              </div>
          </div>
      </div>

    </div>
  );
};