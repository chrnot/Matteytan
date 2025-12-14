import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

type Tab = 'URN' | 'SUMS' | 'MYSTERY';

interface ProbabilityWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

// Helper: SVG Sock Icon
const SockIcon = ({ color, className }: { color: string, className?: string }) => (
    <svg viewBox="0 0 24 24" fill={color} className={className} stroke="rgba(0,0,0,0.1)" strokeWidth="1">
        <path d="M7 17a4 4 0 0 0 4 4h5a2 2 0 0 0 2-2v-6l-5-9h-4a2 2 0 0 0-2 2v11z" />
        <path d="M7 17l4 0" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    </svg>
);

const DiceFace: React.FC<{ val: number }> = ({ val }) => (
    <div className="w-10 h-10 bg-white border border-slate-300 rounded-lg shadow-sm flex items-center justify-center font-bold text-xl text-slate-800">{val}</div>
);

// --- SUB-COMPONENT: URNAN ---
const UrnView = () => {
    const [config, setConfig] = useState({ red: 2, blue: 2, green: 0 });
    const [replacement, setReplacement] = useState(true);
    const [mode, setMode] = useState<'BALLS' | 'SOCKS'>('BALLS');
    const [items, setItems] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [animating, setAnimating] = useState<string | null>(null);

    const reset = () => {
        const newItems: string[] = [];
        for(let i=0; i<config.red; i++) newItems.push('RED');
        for(let i=0; i<config.blue; i++) newItems.push('BLUE');
        for(let i=0; i<config.green; i++) newItems.push('GREEN');
        setItems(newItems);
        setHistory([]);
        setAnimating(null);
    };

    useEffect(() => { reset(); }, [config]);

    const draw = () => {
        if (items.length === 0) return;
        const index = Math.floor(Math.random() * items.length);
        const color = items[index];
        setAnimating(color);
        setTimeout(() => {
            setHistory(prev => [color, ...prev].slice(0, 8));
            setAnimating(null);
            if (!replacement) {
                const newItems = [...items];
                newItems.splice(index, 1);
                setItems(newItems);
            }
        }, 600);
    };

    const getProb = (color: string) => {
        const count = items.filter(b => b === color).length;
        const total = items.length;
        if (total === 0) return { pct: 0, text: '0/0' };
        return { pct: Math.round((count / total) * 100), text: `${count}/${total}` };
    };

    const probs = { RED: getProb('RED'), BLUE: getProb('BLUE'), GREEN: getProb('GREEN') };
    const getColorClass = (c: string) => c === 'RED' ? 'bg-red-500' : c === 'BLUE' ? 'bg-blue-500' : 'bg-green-500';
    const getFillColor = (c: string) => c === 'RED' ? '#ef4444' : c === 'BLUE' ? '#3b82f6' : '#22c55e';

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500">Antal:</span>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><input type="number" min="0" max="10" className="w-10 border rounded px-1" value={config.red} onChange={e=>setConfig({...config, red: Number(e.target.value)})} /></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div><input type="number" min="0" max="10" className="w-10 border rounded px-1" value={config.blue} onChange={e=>setConfig({...config, blue: Number(e.target.value)})} /></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><input type="number" min="0" max="10" className="w-10 border rounded px-1" value={config.green} onChange={e=>setConfig({...config, green: Number(e.target.value)})} /></div>
                    </div>
                </div>
                <div className="flex flex-col justify-between items-end flex-1 gap-2">
                     <div className="flex gap-1 bg-white p-0.5 rounded border border-slate-200">
                         <button onClick={() => setMode('BALLS')} className={`px-2 py-0.5 text-xs rounded ${mode === 'BALLS' ? 'bg-slate-200 font-bold' : 'text-slate-400'}`}>Kulor</button>
                         <button onClick={() => setMode('SOCKS')} className={`px-2 py-0.5 text-xs rounded ${mode === 'SOCKS' ? 'bg-slate-200 font-bold' : 'text-slate-400'}`}>Strumpor</button>
                     </div>
                    <div className="flex gap-2">
                         <button onClick={() => setReplacement(!replacement)} className={`px-2 py-1 text-[10px] rounded border ${replacement ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>{replacement ? 'Återläggning: PÅ' : 'Återläggning: AV'}</button>
                        <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"><Icons.Reset size={12} /></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
                <div className="relative w-40 h-full max-h-48 border-b-4 border-l-2 border-r-2 border-slate-300 rounded-b-3xl bg-slate-100/50 flex flex-wrap-reverse content-start p-2 gap-1 justify-center overflow-hidden shadow-inner shrink-0">
                    {items.map((color, i) => (
                        <div key={i} className="transition-all animate-in zoom-in duration-300">
                             {mode === 'BALLS' ? (<div className={`w-6 h-6 rounded-full shadow-sm border border-black/10 ${getColorClass(color)}`}></div>) : (<SockIcon color={getFillColor(color)} className="w-8 h-8 drop-shadow-sm" />)}
                        </div>
                    ))}
                    {animating && (<div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-bounce`}>{mode === 'BALLS' ? (<div className={`w-16 h-16 rounded-full shadow-2xl border-4 border-white ${getColorClass(animating)}`}></div>) : (<SockIcon color={getFillColor(animating)} className="w-20 h-20 drop-shadow-2xl filter brightness-110" />)}</div>)}
                </div>

                <div className="flex-1 w-full flex flex-col items-center gap-4">
                    <button onClick={draw} disabled={items.length === 0 || !!animating} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full">{mode === 'BALLS' ? 'DRA KULA' : 'DRA STRUMPA'}</button>
                    <div className="w-full space-y-2 overflow-y-auto max-h-[150px]">
                        <div className="flex justify-between items-center text-sm p-2 bg-red-50 rounded border border-red-100"><span className="font-bold text-red-700">Röd</span><span className="font-mono text-red-900">{probs.RED.pct}% <span className="text-xs opacity-60">({probs.RED.text})</span></span></div>
                        <div className="flex justify-between items-center text-sm p-2 bg-blue-50 rounded border border-blue-100"><span className="font-bold text-blue-700">Blå</span><span className="font-mono text-blue-900">{probs.BLUE.pct}% <span className="text-xs opacity-60">({probs.BLUE.text})</span></span></div>
                        {config.green > 0 && (<div className="flex justify-between items-center text-sm p-2 bg-green-50 rounded border border-green-100"><span className="font-bold text-green-700">Grön</span><span className="font-mono text-green-900">{probs.GREEN.pct}% <span className="text-xs opacity-60">({probs.GREEN.text})</span></span></div>)}
                    </div>
                </div>
            </div>

            <div className="h-8 flex items-center gap-2 bg-slate-100 rounded-full px-3 overflow-hidden shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">Historik</span>
                {history.map((c, i) => (<div key={i} className={`w-4 h-4 rounded-full flex-shrink-0 ${getColorClass(c)}`}></div>))}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: SUMMA (TÄRNING) ---
const SumsView = () => {
    const [diceCount, setDiceCount] = useState(2);
    const [data, setData] = useState<any[]>([]);
    const [totalRolls, setTotalRolls] = useState(0);
    const [lastRoll, setLastRoll] = useState<number[]>([]);

    useEffect(() => { reset(); }, [diceCount]);

    const reset = () => {
        const min = diceCount;
        const max = diceCount * 6;
        const initData = [];
        for (let i = min; i <= max; i++) initData.push({ sum: i, count: 0 });
        setData(initData);
        setTotalRolls(0);
        setLastRoll([]);
    };

    const roll = (times: number) => {
        const newData = [...data];
        let finalRoll: number[] = [];
        for (let t = 0; t < times; t++) {
            let currentRolls = [];
            let sum = 0;
            for (let d = 0; d < diceCount; d++) {
                const val = Math.floor(Math.random() * 6) + 1;
                currentRolls.push(val);
                sum += val;
            }
            finalRoll = currentRolls;
            const idx = sum - diceCount;
            if (newData[idx]) newData[idx].count += 1;
        }
        setLastRoll(finalRoll);
        setData(newData);
        setTotalRolls(prev => prev + times);
    };

    return (
        <div className="flex flex-col h-full gap-4">
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 shrink-0">
                 <div className="flex items-center gap-3">
                     <span className="text-xs font-bold text-slate-500">Antal Tärningar:</span>
                     <div className="flex bg-white rounded border border-slate-300 overflow-hidden">
                         <button onClick={() => setDiceCount(1)} className={`px-3 py-1 text-sm ${diceCount === 1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>1</button>
                         <button onClick={() => setDiceCount(2)} className={`px-3 py-1 text-sm ${diceCount === 2 ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>2</button>
                     </div>
                 </div>
                 <button onClick={reset} className="p-1.5 text-slate-400 hover:text-red-500"><Icons.Trash size={16}/></button>
             </div>

             <div className="flex-1 flex flex-col overflow-hidden">
                 <div className="h-16 flex items-center justify-between px-4 mb-2 shrink-0">
                     <div className="flex gap-2">{lastRoll.map((r, i) => (<DiceFace key={i} val={r} />))}{lastRoll.length > 0 && (<div className="flex items-center ml-2 text-sm font-bold text-slate-500">= {lastRoll.reduce((a,b)=>a+b,0)}</div>)}</div>
                     <div className="flex gap-2">
                        <button onClick={() => roll(1)} className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow hover:bg-slate-700 font-bold text-sm">Kasta</button>
                        <button onClick={() => roll(100)} className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-200 font-bold text-xs">+100</button>
                     </div>
                 </div>
                 <div className="flex-1 w-full min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <XAxis dataKey="sum" tick={{fontSize: 10}} />
                            <YAxis tick={{fontSize: 10}} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#475569' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>{data.map((entry, index) => (<Cell key={`cell-${index}`} fill={diceCount === 1 ? '#3b82f6' : `rgb(${59 + index * 10}, 130, 246)`} />))}</Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
             </div>
             <div className="text-center text-xs text-slate-400 shrink-0">Totalt antal kast: <span className="font-bold text-slate-600">{totalRolls}</span>{diceCount > 1 && <span className="ml-2 italic">(Notera pyramidformen!)</span>}</div>
        </div>
    )
};

// --- SUB-COMPONENT: DETEKTIVEN (Hypotesprövning) ---
const MysteryView = () => {
    const [isCheating, setIsCheating] = useState(false);
    const [counts, setCounts] = useState([0,0,0,0,0,0]);
    const [lastRolls, setLastRolls] = useState<number[]>([]);
    const [revealed, setRevealed] = useState(false);
    const [gameId, setGameId] = useState(0);

    useEffect(() => {
        const cheating = Math.random() > 0.5;
        setIsCheating(cheating);
        setCounts([0,0,0,0,0,0]);
        setLastRolls([]);
        setRevealed(false);
    }, [gameId]);

    const roll = (times: number) => {
        const newCounts = [...counts];
        const currentBatch = [];
        for(let i=0; i<times; i++) {
            let res;
            if (isCheating) {
                const r = Math.random();
                if (r < 0.50) res = 6; else res = Math.floor(Math.random() * 5) + 1;
            } else res = Math.floor(Math.random() * 6) + 1;
            newCounts[res-1]++;
            currentBatch.push(res);
        }
        setCounts(newCounts);
        setLastRolls(currentBatch.slice(0, 15));
    };

    const total = counts.reduce((a,b)=>a+b, 0);
    const sixRatio = total > 0 ? (counts[5]/total * 100).toFixed(1) : '0';

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-sm text-indigo-800 shrink-0"><p className="font-bold mb-1">Uppdrag:</p><p>En tärning är antingen ärlig (16.7% chans för 6:a) eller falsk (50% chans!). Kasta tärningen och avgör vilken det är!</p></div>
            <div className="flex justify-between items-center shrink-0">
                 <div className="flex gap-2"><button onClick={() => roll(1)} className="px-4 py-2 bg-white border shadow-sm rounded hover:bg-slate-50 font-bold text-slate-700">Kasta 1</button><button onClick={() => roll(10)} className="px-4 py-2 bg-white border shadow-sm rounded hover:bg-slate-50 font-bold text-slate-700">Kasta 10</button></div>
                 <div className="flex gap-1 overflow-hidden h-6 items-center max-w-[150px]">{lastRolls.map((r, i) => (<span key={i} className={`text-xs font-bold ${r===6 ? 'text-red-600' : 'text-slate-400'}`}>{r}</span>))}</div>
            </div>
            <div className="flex-1 flex flex-col justify-end min-h-[150px]">
                <div className="h-full flex items-end justify-between px-4 gap-2 border-b border-slate-200 pb-2">
                    {counts.map((c, i) => {
                        const pct = total > 0 ? (c/total)*100 : 0;
                        return (<div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full"><div className="text-[10px] text-slate-500 mb-1 opacity-100 font-mono">{Math.round(pct)}%</div><div className={`w-full rounded-t transition-all duration-500 ease-out ${i===5 ? 'bg-indigo-500' : 'bg-slate-300'}`} style={{ height: `${Math.max(pct, 2)}%` }}></div><div className="mt-1 font-bold text-slate-600 border-t border-transparent w-full text-center pt-1">{i+1}</div>{i===5 && <div className="absolute top-0 right-0 text-[9px] text-indigo-300 font-bold">Mål</div>}</div>)
                    })}
                </div>
                <div className="text-center text-xs text-slate-400 mt-1 shrink-0">Antal kast: {total}</div>
            </div>
            {revealed ? (
                <div className={`p-4 rounded-xl text-center animate-in zoom-in shadow-lg border-2 shrink-0 ${isCheating ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}><div className="font-bold text-xl mb-1">{isCheating ? 'FALSK TÄRNING! 🕵️‍♀️' : 'ÄRLIG TÄRNING! ✅'}</div><div className="text-xs opacity-80 mb-3">Andel sexor: {sixRatio}% (Förväntat vid fusk: ~50%)</div><button onClick={() => setGameId(g => g+1)} className="px-6 py-2 bg-white shadow rounded-lg font-bold text-sm hover:scale-105 transition-transform">Spela Igen</button></div>
            ) : (<div className="grid grid-cols-2 gap-3 shrink-0"><button onClick={() => setRevealed(true)} className="py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-sm active:scale-95 transition-transform">Gissa: Ärlig</button><button onClick={() => setRevealed(true)} className="py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-sm active:scale-95 transition-transform">Gissa: Falsk</button></div>)}
        </div>
    );
};

export const ProbabilityWidget: React.FC<ProbabilityWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [activeTab, setActiveTab] = useState<Tab>('URN');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex border-b border-slate-200 mb-4 overflow-x-auto shrink-0">
          <button onClick={() => setActiveTab('URN')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'URN' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Urnan</button>
          <button onClick={() => setActiveTab('SUMS')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'SUMS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Summa</button>
          <button onClick={() => setActiveTab('MYSTERY')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'MYSTERY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Detektiven</button>
      </div>

      <div className="flex-1 relative overflow-hidden h-full">
          {activeTab === 'URN' && <UrnView />}
          {activeTab === 'SUMS' && <SumsView />}
          {activeTab === 'MYSTERY' && <MysteryView />}
      </div>
    </div>
  );
};