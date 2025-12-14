import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';

type ItemType = 'X' | 'ONE';

interface Item {
    id: string;
    type: ItemType;
    weight: number; // Abstract weight
}

interface EquationWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const EquationWidget: React.FC<EquationWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [leftItems, setLeftItems] = useState<Item[]>([]);
  const [rightItems, setRightItems] = useState<Item[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  
  // Logic: "X" weighs 3 units visually for balancing logic, "1" weighs 1 unit.
  // This is purely visual simulation, not a solver.
  const X_WEIGHT = 3; 

  const calcWeight = (items: Item[]) => items.reduce((acc, item) => acc + (item.type === 'X' ? X_WEIGHT : 1), 0);
  
  const leftWeight = calcWeight(leftItems);
  const rightWeight = calcWeight(rightItems);
  const diff = leftWeight - rightWeight;
  const tilt = Math.max(-20, Math.min(20, diff * 2)); 

  const addItem = (side: 'LEFT' | 'RIGHT', type: ItemType) => {
      const newItem: Item = { id: Date.now().toString() + Math.random(), type, weight: type === 'X' ? X_WEIGHT : 1 };
      if (side === 'LEFT') setLeftItems([...leftItems, newItem]);
      else setRightItems([...rightItems, newItem]);
  };

  const removeItem = (side: 'LEFT' | 'RIGHT', id: string) => {
      if (side === 'LEFT') setLeftItems(leftItems.filter(i => i.id !== id));
      else setRightItems(rightItems.filter(i => i.id !== id));
  };

  const clear = () => {
      setLeftItems([]);
      setRightItems([]);
      setShowSolution(false);
  };

  // --- Math Logic ---
  
  const getCounts = (items: Item[]) => ({
      x: items.filter(i => i.type === 'X').length,
      c: items.filter(i => i.type === 'ONE').length
  });

  const formatExpression = (x: number, c: number) => {
      if (x === 0 && c === 0) return '0';
      const xPart = x === 0 ? '' : (x === 1 ? 'x' : `${x}x`);
      const cPart = c === 0 ? '' : c.toString();
      
      if (xPart && cPart) return `${xPart} + ${cPart}`;
      return xPart || cPart;
  };

  const lCount = getCounts(leftItems);
  const rCount = getCounts(rightItems);

  const solutionSteps = useMemo(() => {
      const steps: string[] = [];
      let lx = lCount.x;
      let lc = lCount.c;
      let rx = rCount.x;
      let rc = rCount.c;

      // Helper to push current state
      const pushState = () => steps.push(`${formatExpression(lx, lc)} = ${formatExpression(rx, rc)}`);

      // 1. Initial State
      // pushState(); // Already shown in header

      // If purely constants, check truth
      if (lx === 0 && rx === 0) {
          if (lc === rc) steps.push("Likheten stämmer.");
          else steps.push("Likheten stämmer inte.");
          return steps;
      }

      // 2. Move X to one side (prefer keeping X positive)
      // Strategy: Move smaller X to larger X
      if (lx > 0 && rx > 0) {
          if (lx >= rx) {
              steps.push(`Subtrahera ${rx === 1 ? 'x' : rx + 'x'} från båda sidor`);
              lx -= rx;
              rx = 0;
          } else {
              steps.push(`Subtrahera ${lx === 1 ? 'x' : lx + 'x'} från båda sidor`);
              rx -= lx;
              lx = 0;
          }
          pushState();
      }

      // 3. Isolate X (Move constants away from X)
      if (lx > 0) {
          // X is on Left
          if (lc > 0) {
              steps.push(`Subtrahera ${lc} från båda sidor`);
              rc -= lc;
              lc = 0;
              pushState();
          }
          // Divide if coefficient > 1
          if (lx > 1) {
              steps.push(`Dela båda sidor med ${lx}`);
              const res = rc / lx;
              // Check if integer
              const final = Number.isInteger(res) ? res : res.toFixed(2);
              steps.push(`x = ${final}`);
          }
      } else if (rx > 0) {
          // X is on Right
          if (rc > 0) {
              steps.push(`Subtrahera ${rc} från båda sidor`);
              lc -= rc;
              rc = 0;
              pushState();
          }
          // Divide
          if (rx > 1) {
              steps.push(`Dela båda sidor med ${rx}`);
              const res = lc / rx;
              const final = Number.isInteger(res) ? res : res.toFixed(2);
              steps.push(`${final} = x`);
          }
      }

      return steps;
  }, [lCount, rCount]);

  return (
    <div className="w-[500px] flex flex-col items-center">
      
      {/* Balance Visualization */}
      <div className="relative w-full h-[220px] flex items-end justify-center mb-6 overflow-visible">
        
        {/* Base */}
        <div className="z-10 w-8 h-32 bg-slate-700 mx-auto rounded-t-lg relative">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
        </div>
        <div className="z-10 absolute bottom-0 w-40 h-3 bg-slate-800 rounded-full opacity-20 blur-sm"></div>

        {/* Beam */}
        <div 
            className="absolute bottom-28 w-[90%] h-3 bg-gradient-to-b from-blue-500 to-blue-700 rounded transition-transform duration-700 ease-out origin-center flex justify-between items-end shadow-md z-20"
            style={{ transform: `rotate(${tilt}deg)` }}
        >
            {/* Left Pan Container */}
            <div className="relative -left-4 top-24 w-32 h-32 flex flex-col items-center"
                 style={{ transform: `rotate(${-tilt}deg)`, transformOrigin: 'top center', transition: 'transform 0.7s ease-out' }}>
                 
                 {/* String */}
                 <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-0.5 h-24 bg-slate-400"></div>
                 
                 {/* Pan */}
                 <div className="w-full h-12 border-b-4 border-slate-400 rounded-b-full bg-slate-100/80 backdrop-blur-sm shadow-lg flex justify-center items-end pb-2 relative z-10 overflow-visible">
                    <div className="flex flex-wrap-reverse justify-center gap-1 absolute bottom-2 w-full px-2">
                        {leftItems.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => removeItem('LEFT', item.id)}
                                className={`
                                    cursor-pointer hover:opacity-80 transition-all shadow-sm border border-black/10
                                    ${item.type === 'X' ? 'w-8 h-8 bg-amber-400 rounded-sm flex items-center justify-center font-bold text-amber-900' : 'w-6 h-6 bg-emerald-400 rounded-full'}
                                `}
                            >
                                {item.type === 'X' ? 'x' : '1'}
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            {/* Right Pan Container */}
             <div className="relative -right-4 top-24 w-32 h-32 flex flex-col items-center"
                 style={{ transform: `rotate(${-tilt}deg)`, transformOrigin: 'top center', transition: 'transform 0.7s ease-out' }}>
                 <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-0.5 h-24 bg-slate-400"></div>
                 <div className="w-full h-12 border-b-4 border-slate-400 rounded-b-full bg-slate-100/80 backdrop-blur-sm shadow-lg flex justify-center items-end pb-2 relative z-10 overflow-visible">
                    <div className="flex flex-wrap-reverse justify-center gap-1 absolute bottom-2 w-full px-2">
                        {rightItems.map((item) => (
                             <div 
                                key={item.id} 
                                onClick={() => removeItem('RIGHT', item.id)}
                                className={`
                                    cursor-pointer hover:opacity-80 transition-all shadow-sm border border-black/10
                                    ${item.type === 'X' ? 'w-8 h-8 bg-amber-400 rounded-sm flex items-center justify-center font-bold text-amber-900' : 'w-6 h-6 bg-emerald-400 rounded-full'}
                                `}
                            >
                                {item.type === 'X' ? 'x' : '1'}
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-8 w-full mb-6">
        {/* Left Controls */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 mb-2 text-center uppercase">Vänsterled (VL)</h4>
            <div className="flex justify-center gap-2">
                 <button onClick={() => addItem('LEFT', 'X')} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-amber-50">
                    <div className="w-4 h-4 bg-amber-400 rounded-sm"></div> <span className="text-sm font-bold text-slate-700">+X</span>
                 </button>
                 <button onClick={() => addItem('LEFT', 'ONE')} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-emerald-50">
                    <div className="w-4 h-4 bg-emerald-400 rounded-full"></div> <span className="text-sm font-bold text-slate-700">+1</span>
                 </button>
            </div>
        </div>

        {/* Right Controls */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 mb-2 text-center uppercase">Högerled (HL)</h4>
            <div className="flex justify-center gap-2">
                 <button onClick={() => addItem('RIGHT', 'X')} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-amber-50">
                    <div className="w-4 h-4 bg-amber-400 rounded-sm"></div> <span className="text-sm font-bold text-slate-700">+X</span>
                 </button>
                 <button onClick={() => addItem('RIGHT', 'ONE')} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-emerald-50">
                    <div className="w-4 h-4 bg-emerald-400 rounded-full"></div> <span className="text-sm font-bold text-slate-700">+1</span>
                 </button>
            </div>
        </div>
      </div>

      {/* Math Model & Solution */}
      <div className="w-full bg-indigo-50 rounded-xl border border-indigo-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-indigo-100/50">
              <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Nuvarande Ekvation</span>
                  <div className="text-2xl font-mono font-bold text-indigo-900">
                      {formatExpression(lCount.x, lCount.c)} = {formatExpression(rCount.x, rCount.c)}
                  </div>
              </div>
              <button 
                onClick={() => setShowSolution(!showSolution)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                    ${showSolution ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'}
                `}
              >
                  <Icons.Book size={16} />
                  {showSolution ? 'Dölj Lösning' : 'Visa Lösning'}
              </button>
          </div>

          {showSolution && (
              <div className="p-4 bg-white border-t border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                  {(lCount.x === 0 && rCount.x === 0) ? (
                      <p className="text-sm text-slate-500 italic">Inga variabler (x) att lösa ut.</p>
                  ) : (
                      <div className="space-y-3">
                          {solutionSteps.map((step, i) => (
                             <div key={i} className="flex items-center gap-3">
                                 <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                     {i + 1}
                                 </div>
                                 <span className="text-sm text-slate-700 font-mono">{step}</span>
                             </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>

      <div className="mt-4 flex w-full justify-between items-center text-[10px] text-slate-400 px-2">
           <span>Klicka på objekt i vågskålarna för att ta bort dem.</span>
           <button onClick={clear} className="hover:text-red-500 underline flex items-center gap-1">
               <Icons.Trash size={12}/> Rensa allt
           </button>
      </div>
    </div>
  );
};