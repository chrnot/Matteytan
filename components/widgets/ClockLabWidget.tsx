
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '../icons';

type ViewMode = 'ANALOG' | 'DIGITAL' | 'HYBRID';

export const ClockLabWidget: React.FC = () => {
  const [totalMinutes, setTotalMinutes] = useState(14 * 60 + 35); // Start kl 14:35
  const [viewMode, setViewMode] = useState<ViewMode>('HYBRID');
  const [is24h, setIs24h] = useState(false);
  const [showSectors, setShowSectors] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null); // För tidspass-läget

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef<null | 'MINUTE' | 'HOUR'>(null);

  // Tidshantering
  const hours = Math.floor(totalMinutes / 60) % 24;
  const displayHours = is24h ? hours : hours % 12 || 12;
  const mins = totalMinutes % 60;

  useEffect(() => {
    if (!isRealtime) return;
    const interval = setInterval(() => {
      const now = new Date();
      setTotalMinutes(now.getHours() * 60 + now.getMinutes());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRealtime]);

  // Svenskt talstöd
  const swedishTimeText = useMemo(() => {
    // För talstöd avrundar vi ofta till närmaste 5 minuter för att det ska låta naturligt,
    // men vi kan också vara exakta om vi vill.
    const roundedMins = Math.round(mins / 5) * 5;
    const isExact = mins === roundedMins;
    
    // hTalk är den timme vi "syftar på" (t.ex. vid 17:25 syftar vi på 18/sex)
    const hTalk = (roundedMins >= 25 ? hours + 1 : hours) % 24;
    const hNames = ["tolv", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio", "tio", "elva", "tolv", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio", "tio", "elva"];
    const hName = hNames[hTalk];

    const prefix = isExact ? "" : "ungefär ";
    let verbal = "";

    if (roundedMins === 0 || roundedMins === 60) verbal = `${hName} prick`;
    else if (roundedMins === 5) verbal = `fem över ${hName}`;
    else if (roundedMins === 10) verbal = `tio över ${hName}`;
    else if (roundedMins === 15) verbal = `kvart över ${hName}`;
    else if (roundedMins === 20) verbal = `tjugo över ${hName}`;
    else if (roundedMins === 25) verbal = `fem i halv ${hName}`;
    else if (roundedMins === 30) verbal = `halv ${hName}`;
    else if (roundedMins === 35) verbal = `fem över halv ${hName}`;
    else if (roundedMins === 40) verbal = `tjugo i ${hName}`;
    else if (roundedMins === 45) verbal = `kvart i ${hName}`;
    else if (roundedMins === 50) verbal = `tio i ${hName}`;
    else if (roundedMins === 55) verbal = `fem i ${hName}`;
    
    // Om vi inte hittar ett bra verbalt uttryck (faller utanför avrundning), 
    // eller om användaren föredrar siffror för exakta minuter:
    if (!verbal) return `${hours}:${mins < 10 ? '0' + mins : mins}`;

    // Stor bokstav på första ordet
    const result = prefix + verbal;
    return result.charAt(0).toUpperCase() + result.slice(1);
  }, [hours, mins]);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
    const normalizedAngle = (angle + 360) % 360;

    if (isDragging.current === 'MINUTE') {
      const newMins = Math.round(normalizedAngle / 6) % 60;
      const currentMins = totalMinutes % 60;
      let diff = newMins - currentMins;
      if (diff < -30) diff += 60;
      if (diff > 30) diff -= 60;
      setTotalMinutes(prev => (prev + diff + 1440) % 1440);
    } else if (isDragging.current === 'HOUR') {
      const newTotalMins = (normalizedAngle / 360) * 12 * 60;
      const hOffset = hours >= 12 ? 12 * 60 : 0;
      setTotalMinutes(Math.round(newTotalMins + hOffset) % 1440);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white select-none">
      {/* 1. View Modes & Settings */}
      <div className="flex flex-wrap items-center justify-between p-3 gap-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
          {(['ANALOG', 'DIGITAL', 'HYBRID'] as ViewMode[]).map(m => (
            <button 
              key={m} 
              onClick={() => setViewMode(m)}
              className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === m ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {m === 'ANALOG' ? 'Analog' : m === 'DIGITAL' ? 'Digital' : 'Hybrid'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSectors(!showSectors)}
            className={`p-2 rounded-lg border transition-all ${showSectors ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}
            title="Visa sektorer (I / Över)"
          >
            <Icons.PieChart size={18} />
          </button>
          <button 
            onClick={() => setIs24h(!is24h)}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${is24h ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
          >
            24H
          </button>
          <button 
            onClick={() => {
              if (startTime === null) setStartTime(totalMinutes);
              else setStartTime(null);
            }}
            className={`p-2 rounded-lg border transition-all ${startTime !== null ? 'bg-amber-100 border-amber-300 text-amber-600 shadow-inner' : 'bg-white border-slate-200 text-slate-400'}`}
            title="Tidspass-läge"
          >
            <Icons.Rotate size={18} />
          </button>
          <button 
            onClick={() => setIsRealtime(!isRealtime)}
            className={`p-2 rounded-lg border transition-all ${isRealtime ? 'bg-red-100 border-red-300 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-400'}`}
            title="Synka realtid"
          >
             <Icons.Zap size={18} />
          </button>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div 
        className="flex-1 flex flex-col md:flex-row items-center justify-around p-6 gap-8 overflow-hidden min-h-0"
        onMouseMove={handleDrag}
        onMouseUp={() => isDragging.current = null}
        onMouseLeave={() => isDragging.current = null}
        onTouchMove={handleDrag}
        onTouchEnd={() => isDragging.current = null}
      >
        
        {/* Analog Section */}
        {(viewMode === 'ANALOG' || viewMode === 'HYBRID') && (
          <div className="relative flex-1 max-w-[400px] aspect-square animate-in zoom-in duration-500">
            <svg 
              ref={svgRef}
              viewBox="0 0 300 300" 
              className="w-full h-full drop-shadow-2xl"
            >
              <circle cx="150" cy="150" r="145" fill="white" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="150" cy="150" r="140" fill="#f8fafc" />

              {showSectors && (
                <g opacity="0.15">
                  <path d="M 150,150 L 150,10 A 140,140 0 0,1 150,290 Z" fill="#22c55e" />
                  <path d="M 150,150 L 150,290 A 140,140 0 0,1 150,10 Z" fill="#ef4444" />
                </g>
              )}

              {startTime !== null && (
                <g>
                  <line 
                    x1="150" y1="150" 
                    x2={150 + 80 * Math.sin((startTime % 720) * 0.5 * Math.PI / 180)} 
                    y2={150 - 80 * Math.cos((startTime % 720) * 0.5 * Math.PI / 180)} 
                    stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.3"
                  />
                  <line 
                    x1="150" y1="150" 
                    x2={150 + 110 * Math.sin((startTime % 60) * 6 * Math.PI / 180)} 
                    y2={150 - 110 * Math.cos((startTime % 60) * 6 * Math.PI / 180)} 
                    stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.3"
                  />
                  <path 
                    d={`M 150,150 L ${150 + 120 * Math.sin((startTime % 60) * 6 * Math.PI / 180)} ${150 - 120 * Math.cos((startTime % 60) * 6 * Math.PI / 180)} A 120 120 0 ${Math.abs(mins - (startTime % 60)) > 30 ? 1 : 0} 1 ${150 + 120 * Math.sin(mins * 6 * Math.PI / 180)} ${150 - 120 * Math.cos(mins * 6 * Math.PI / 180)} Z`} 
                    fill="#fbbf24" opacity="0.2" 
                  />
                </g>
              )}

              {Array.from({ length: 60 }).map((_, i) => (
                <line 
                  key={i}
                  x1="150" y1={i % 5 === 0 ? "10" : "15"}
                  x2="150" y2={i % 5 === 0 ? "25" : "20"}
                  stroke={i % 5 === 0 ? "#334155" : "#94a3b8"}
                  strokeWidth={i % 5 === 0 ? "3" : "1"}
                  transform={`rotate(${i * 6}, 150, 150)`}
                />
              ))}

              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i + 1) * 30;
                const x = 150 + 115 * Math.sin(angle * Math.PI / 180);
                const y = 150 - 115 * Math.cos(angle * Math.PI / 180);
                const x24 = 150 + 85 * Math.sin(angle * Math.PI / 180);
                const y24 = 150 - 85 * Math.cos(angle * Math.PI / 180);
                return (
                  <g key={i}>
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-xl font-black fill-slate-800 font-mono">
                      {i + 1}
                    </text>
                    {is24h && (
                      <text x={x24} y={y24} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold fill-blue-500 opacity-60">
                        {i + 13}
                      </text>
                    )}
                  </g>
                );
              })}

              <g 
                className="cursor-pointer"
                style={{ transform: `rotate(${(totalMinutes % 720) * 0.5}deg)`, transformOrigin: '150px 150px' }}
                onMouseDown={() => isDragging.current = 'HOUR'}
                onTouchStart={() => isDragging.current = 'HOUR'}
              >
                <line x1="150" y1="150" x2="150" y2="80" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                <circle cx="150" cy="150" r="8" fill="#ef4444" />
              </g>

              <g 
                className="cursor-pointer"
                style={{ transform: `rotate(${mins * 6}deg)`, transformOrigin: '150px 150px' }}
                onMouseDown={() => isDragging.current = 'MINUTE'}
                onTouchStart={() => isDragging.current = 'MINUTE'}
              >
                <line x1="150" y1="150" x2="150" y2="40" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
                <circle cx="150" cy="150" r="5" fill="#3b82f6" />
              </g>

              <circle cx="150" cy="150" r="4" fill="#334155" />
            </svg>
          </div>
        )}

        {/* Digital Section */}
        {(viewMode === 'DIGITAL' || viewMode === 'HYBRID') && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-right-4 duration-500">
             <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 flex items-center gap-4">
                <input 
                  type="number" 
                  value={displayHours}
                  onChange={(e) => {
                    const h = Math.max(0, Math.min(23, Number(e.target.value)));
                    setTotalMinutes(h * 60 + mins);
                  }}
                  className="w-32 bg-transparent text-red-500 text-7xl font-black text-center outline-none border-b-4 border-transparent focus:border-red-900 font-mono transition-colors"
                />
                <span className="text-7xl font-black text-slate-700 animate-pulse">:</span>
                <input 
                  type="number" 
                  value={mins}
                  onChange={(e) => {
                    const m = Math.max(0, Math.min(59, Number(e.target.value)));
                    setTotalMinutes(hours * 60 + m);
                  }}
                  className="w-32 bg-transparent text-blue-500 text-7xl font-black text-center outline-none border-b-4 border-transparent focus:border-blue-900 font-mono transition-colors"
                />
             </div>

             <div className="flex gap-12 mt-8">
                <div className="flex flex-col items-center gap-1">
                   <button onClick={() => setTotalMinutes(prev => (prev + 60) % 1440)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Icons.Plus size={24}/></button>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timmar</span>
                   <button onClick={() => setTotalMinutes(prev => (prev - 60 + 1440) % 1440)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Icons.Minimize size={24}/></button>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <button onClick={() => setTotalMinutes(prev => (prev + 1) % 1440)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Icons.Plus size={24}/></button>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minuter</span>
                   <button onClick={() => setTotalMinutes(prev => (prev - 1 + 1440) % 1440)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Icons.Minimize size={24}/></button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* 3. Speech Translation Support (Footer) */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="max-w-xl mx-auto flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Icons.Math size={24} />
             </div>
             <div className="flex-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Svenskt talstöd</span>
                <p className="text-xl font-bold text-slate-700 leading-tight">
                  Klockan är <span className="text-blue-600 underline decoration-2 underline-offset-4">{swedishTimeText}</span>.
                </p>
             </div>
             {startTime !== null && (
               <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-bold text-xs">
                  Δ {Math.abs(totalMinutes - startTime)} min
               </div>
             )}
          </div>
      </div>
    </div>
  );
};
