"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, User, X, Phone, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { patientMatchesSearch, getPatientFirstName, getPatientLastName, formatDateForDisplay } from "../lib/searchUtils";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
      if (profile) {
        const { data } = await supabase
          .from('patients')
          .select('id, first_name, last_name, phone, date_of_birth')
          .eq('clinic_id', profile.clinic_id);
        setPatients(data || []);
      }
    };
    loadPatients();
  }, []);

  // THE SMART SEARCH UTILITY IN ACTION
  const results = useMemo(() => {
    if (query.length < 2) return [];
    return patients
      .filter((p) => patientMatchesSearch(p, query))
      .slice(0, 8); // Only show top 8 results
  }, [patients, query]);

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
            placeholder="Nom, tél, ou date de naissance..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => { setIsOpen(false); setQuery(""); }}>
            <X className="h-5 w-5 text-zinc-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {results.map(p => {
            const firstName = getPatientFirstName(p);
            const lastName = getPatientLastName(p);
            const dobValue = p.dob || p.date_of_birth;

            return (
              <button 
                key={p.id}
                onClick={() => {
                  router.push(`/dashboard/patients/${p.id}`);
                  setIsOpen(false);
                  setQuery("");
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 border-b border-zinc-50 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-100 p-2 rounded-full text-zinc-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 block group-hover:text-emerald-700">{firstName} {lastName}</span>
                    <div className="flex gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      {p.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</span>}
                      {dobValue && <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {formatDateForDisplay(dobValue)}</span>}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
          {query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-zinc-400 text-sm italic">Aucun patient trouvé.</div>
          )}
          {query.length < 2 && (
            <div className="p-8 text-center text-zinc-400 text-sm italic">Tapez au moins 2 caractères pour rechercher...</div>
          )}
        </div>
      </div>
    </div>
  );
}