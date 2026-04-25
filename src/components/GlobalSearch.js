"use client";

import { useState, useEffect } from "react";
import { Search, User, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchPatients = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      const { data } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(5);
      setResults(data || []);
    };

    const timer = setTimeout(searchPatients, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-3 px-4 py-2 bg-zinc-100 border border-zinc-200 text-zinc-500 text-sm w-64 hover:bg-zinc-200 transition-all"
    >
      <Search className="h-4 w-4" /> Rechercher un patient...
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/50 backdrop-blur-sm flex items-start justify-center pt-20">
      <div className="bg-white w-full max-w-xl shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
          <Search className="h-5 w-5 text-zinc-400" />
          <input 
            autoFocus
            className="flex-1 text-lg outline-none"
            placeholder="Tapez un nom..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)}><X className="h-5 w-5 text-zinc-400" /></button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {results.map(p => (
            <button 
              key={p.id}
              onClick={() => {
                router.push(`/dashboard/patients/${p.id}`);
                setIsOpen(false);
                setQuery("");
              }}
              className="w-full p-4 flex items-center gap-4 hover:bg-zinc-50 border-b border-zinc-50 text-left"
            >
              <div className="bg-zinc-100 p-2 rounded-full text-zinc-400"><User className="h-4 w-4" /></div>
              <span className="font-bold text-zinc-900">{p.first_name} {p.last_name}</span>
            </button>
          ))}
          {query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-zinc-400 text-sm italic">Aucun patient trouvé.</div>
          )}
        </div>
      </div>
    </div>
  );
}