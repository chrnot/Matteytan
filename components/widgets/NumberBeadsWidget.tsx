import React, { useState } from 'react';
import { Icons } from '../icons';

interface NumberBeadsWidgetProps {
  isTransparent?: boolean;
}

type Tab = 'COUNT' | 'ADD' | 'SUB';

export const NumberBeadsWidget: React.FC<NumberBeadsWidgetProps> = ({ isTransparent }) => {
  const [activeTab, setActiveTab] = useState<Tab>('COUNT');
  
  // States for different modes
  const [countVal, setCountVal] = useState(0);
  
  const [addA, setAddA] = useState(5);
  const [addB, setAddB] = useState(3);
  
  const [subTotal, setSubTotal] = useState(10);
  const [subTake, setSubTake] = useState(3);

  // Constants
  const MAX_BEADS = 20;

  // Helper to determine bead visual properties
  const getBeadStyle = (index: number) => {
    // 1-based index for logic
    const i = index + 1;
    
    // Standard Coloring (5-grouping: Red, Blue, Red, Blue)
    const isRedGroup = (i <= 5) || (i > 10 && i <= 15);
    const baseColorStart = isRedGroup ? '#ef4444' : '#3b82f6'; // red-500 : blue-500
    const baseColorEnd = isRedGroup ? '#991b1b' : '#1e3a8a';   // red-800 : blue-900

    // Addition specific color (Green for the added part)
    const addColorStart = '#22c55e'; // green-500
    const addColorEnd = '#14532d';   // green-900

    let isActive = false;
    let isAddedPart = false;
    let isSubtractedPart = false;

    // Logic based on mode
    if (activeTab === 'COUNT') {
        isActive = i <= countVal;
    } else if (activeTab === 'ADD') {
        if (i <= addA) {
            isActive = true; // First part
        } else if (i <= addA + addB) {
            isActive = true;
            isAddedPart = true; // Second part (Green)
        }
    } else if (activeTab === 'SUB') {
        if (i <= subTotal) {
            isActive = true;
            // The last 'subTake' beads of the 'subTotal' are marked as subtracted
            if (i > subTotal - subTake) {
                isSubtractedPart = true;
            }
        }
    }

    // Determine Gradient Colors
    const start = isAddedPart ? addColorStart : baseColorStart;
    const end = isAddedPart ? addColorEnd : baseColorEnd;

    return {
      style: {
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, ${start} 25%, ${end} 100%)`,
        opacity: isActive ? 1 : 0.2,
        transform: isActive ? 'scale(1)' : 'scale(0.9)',
        boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.3)' : 'none'
      },
      isSubtracted: isSubtractedPart,
      isActive
    };
  };

  const handleBeadClick = (index: number) => {
      const val = index + 1;
      if (activeTab === 'COUNT') {
          setCountVal(val);
      }
      // Click interaction for ADD/SUB is ambiguous, so we disable direct bead click for those modes
      // to encourage using the sliders for specific concept building.
  };

  return (
    <div className="w-[600px] flex flex-col gap-4 select-none p-2">
      
      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-xl mx-auto mb-2 border border-slate-200">
          <button 
            onClick={() => setActiveTab('COUNT')} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'COUNT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Räkna
          </button>
          <button 
            onClick={() => setActiveTab('ADD')} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ADD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Addition (+)
          </button>
          <button 
            onClick={() => setActiveTab('SUB')} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'SUB' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Subtraktion (-)
          </button>
      </div>

      {/* Main Display (Number or Equation) */}
      <div className="flex justify-center mb-2">
        <div className="bg-white border-2 border-slate-200 rounded-2xl min-w-[6rem] px-6 h-24 flex items-center justify-center shadow-sm">
           {activeTab === 'COUNT' && (
               <span className="text-6xl font-black text-slate-800">{countVal}</span>
           )}
           {activeTab === 'ADD' && (
               <div className="flex items-center gap-3 text-5xl font-black">
                   <span className="text-slate-800">{addA}</span>
                   <span className="text-green-600">+</span>
                   <span className="text-green-600">{addB}</span>
                   <span className="text-slate-400">=</span>
                   <span className="text-slate-800">{addA + addB}</span>
               </div>
           )}
           {activeTab === 'SUB' && (
               <div className="flex items-center gap-3 text-5xl font-black">
                   <span className="text-slate-800">{subTotal}</span>
                   <span className="text-red-500">-</span>
                   <span className="text-red-500">{subTake}</span>
                   <span className="text-slate-400">=</span>
                   <span className="text-slate-800">{subTotal - subTake}</span>
               </div>
           )}
        </div>
      </div>

      {/* Beads Container */}
      <div className="relative h-20 flex items-center justify-center w-full px-4">
          
          {/* The String */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 rounded-full -translate-y-1/2 z-0 shadow-sm"></div>
          
          {/* The Beads */}
          <div className="relative z-10 flex justify-between w-full">
            {Array.from({ length: MAX_BEADS }).map((_, index) => {
               const { style, isSubtracted, isActive } = getBeadStyle(index);
               return (
                <div 
                    key={index}
                    onClick={() => handleBeadClick(index)}
                    className={`
                        w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-300 relative flex items-center justify-center
                        ${activeTab === 'COUNT' ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}
                    `}
                    style={style}
                >
                    {/* Subtraction Cross Overlay */}
                    {isSubtracted && (
                        <Icons.Close className="text-slate-900 drop-shadow-md w-5 h-5 opacity-60" strokeWidth={3} />
                    )}
                </div>
               );
            })}
          </div>
      </div>

      {/* Controls Area */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
          
          {/* COUNT CONTROLS */}
          {activeTab === 'COUNT' && (
              <>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    <span>0</span>
                    <span>10</span>
                    <span>20</span>
                </div>
                <input 
                    type="range" min="0" max="20" 
                    value={countVal}
                    onChange={(e) => setCountVal(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700 hover:accent-blue-600 transition-colors"
                />
              </>
          )}

          {/* ADDITION CONTROLS */}
          {activeTab === 'ADD' && (
              <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Term 1 (Start)</label>
                      <input 
                        type="range" min="0" max="20" 
                        value={addA}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setAddA(val);
                            // Adjust B so sum doesn't exceed 20
                            if (val + addB > 20) setAddB(20 - val);
                        }}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                      />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-green-600 uppercase">Term 2 (Lägg till)</label>
                      <input 
                        type="range" min="0" max={20 - addA} 
                        value={addB}
                        onChange={(e) => setAddB(Number(e.target.value))}
                        className="w-full h-3 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                  </div>
              </div>
          )}

          {/* SUBTRACTION CONTROLS */}
          {activeTab === 'SUB' && (
               <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Term 1 (Totalt)</label>
                      <input 
                        type="range" min="0" max="20" 
                        value={subTotal}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setSubTotal(val);
                            // Adjust take so we don't take more than we have
                            if (subTake > val) setSubTake(val);
                        }}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                      />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-red-500 uppercase">Term 2 (Ta bort)</label>
                      <input 
                        type="range" min="0" max={subTotal} 
                        value={subTake}
                        onChange={(e) => setSubTake(Number(e.target.value))}
                        className="w-full h-3 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                  </div>
              </div>
          )}
          
          <div className="text-center text-[10px] text-slate-400">
              {activeTab === 'COUNT' ? 'Dra i reglaget eller klicka på pärlorna.' : 'Justera reglagen för att bygga din uträkning.'}
          </div>
      </div>

    </div>
  );
};