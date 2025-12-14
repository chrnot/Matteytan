import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';

const FORMULAS = [
    // PREFIX
    { cat: 'Prefix', name: 'Tera (T)', val: '10¹²' },
    { cat: 'Prefix', name: 'Giga (G)', val: '10⁹' },
    { cat: 'Prefix', name: 'Mega (M)', val: '10⁶' },
    { cat: 'Prefix', name: 'Kilo (k)', val: '10³' },
    { cat: 'Prefix', name: 'Hekto (h)', val: '10²' },
    { cat: 'Prefix', name: 'Deka (da)', val: '10¹' },
    { cat: 'Prefix', name: 'Deci (d)', val: '10⁻¹' },
    { cat: 'Prefix', name: 'Centi (c)', val: '10⁻²' },
    { cat: 'Prefix', name: 'Milli (m)', val: '10⁻³' },
    { cat: 'Prefix', name: 'Mikro (µ)', val: '10⁻⁶' },
    { cat: 'Prefix', name: 'Nano (n)', val: '10⁻⁹' },
    { cat: 'Prefix', name: 'Piko (p)', val: '10⁻¹²' },

    // POTENSER
    { cat: 'Potenser', name: 'Multiplikation', val: 'aˣ · aʸ = aˣ⁺ʸ' },
    { cat: 'Potenser', name: 'Division', val: 'aˣ / aʸ = aˣ⁻ʸ' },
    { cat: 'Potenser', name: 'Potens av potens', val: '(aˣ)ʸ = aˣ·ʸ' },
    { cat: 'Potenser', name: 'Negativ exponent', val: 'a⁻ˣ = 1 / aˣ' },
    { cat: 'Potenser', name: 'Exponent noll', val: 'a⁰ = 1' },

    // FUNKTIONER
    { cat: 'Funktioner', name: 'Räta linjens ekvation', val: 'y = kx + m' },

    // GEOMETRI - Plana figurer
    { cat: 'Geometri', name: 'Triangel (Area)', val: 'A = (b · h) / 2' },
    { cat: 'Geometri', name: 'Parallellogram (Area)', val: 'A = b · h' },
    { cat: 'Geometri', name: 'Parallelltrapets (Area)', val: 'A = h(a + b) / 2' },
    { cat: 'Geometri', name: 'Cirkel (Area)', val: 'A = π · r²' },
    { cat: 'Geometri', name: 'Cirkel (Omkrets)', val: 'O = π · d = 2 · π · r' },
    { cat: 'Geometri', name: 'Cirkelsektor (Area)', val: 'A = (v / 360°) · π · r²' },
    { cat: 'Geometri', name: 'Cirkelsektor (Båge)', val: 'b = (v / 360°) · 2 · π · r' },

    // GEOMETRI - Rymdgeometri
    { cat: 'Geometri', name: 'Rätblock (Volym)', val: 'V = B · h' },
    { cat: 'Geometri', name: 'Prisma (Volym)', val: 'V = B · h' },
    { cat: 'Geometri', name: 'Cylinder (Volym)', val: 'V = B · h' },
    { cat: 'Geometri', name: 'Cylinder (Mantelarea)', val: 'Am = 2 · π · r · h' },
    { cat: 'Geometri', name: 'Pyramid (Volym)', val: 'V = (B · h) / 3' },
    { cat: 'Geometri', name: 'Kon (Volym)', val: 'V = (B · h) / 3' },
    { cat: 'Geometri', name: 'Kon (Mantelarea)', val: 'Am = π · r · s' },
    { cat: 'Geometri', name: 'Klot (Volym)', val: 'V = (4 · π · r³) / 3' },
    { cat: 'Geometri', name: 'Klot (Area)', val: 'A = 4 · π · r²' },

    // GEOMETRI - Övrigt
    { cat: 'Geometri', name: 'Areaskala', val: '(Längdskala)²' },
    { cat: 'Geometri', name: 'Volymskala', val: '(Längdskala)³' },
    { cat: 'Geometri', name: 'Pythagoras sats', val: 'a² + b² = c²' },
];

const CATEGORIES = ['Alla', 'Prefix', 'Potenser', 'Funktioner', 'Geometri'];

interface FormulaWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const FormulaWidget: React.FC<FormulaWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [activeCat, setActiveCat] = useState('Alla');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
      return FORMULAS.filter(f => {
          const matchesCat = activeCat === 'Alla' || f.cat === activeCat;
          const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.val.toLowerCase().includes(search.toLowerCase());
          return matchesCat && matchesSearch;
      });
  }, [activeCat, search]);

  return (
    <div className="w-[350px] flex flex-col h-[400px]">
      
      {/* Search Bar */}
      <div className="relative mb-3">
          <Icons.More className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={14} />
          <input 
            type="text" 
            placeholder="Sök formel, term eller värde..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCat === cat ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Inga formler hittades.</div>
        ) : (
            filtered.map((f, i) => (
                <div 
                    key={i} 
                    className="group bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default"
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-700 text-sm">{f.name}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-wide">{f.cat}</span>
                    </div>
                    <div className="font-serif text-lg text-blue-600 font-medium mt-1">
                        {f.val}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};