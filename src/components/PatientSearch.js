"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, User, X, Check } from "lucide-react";
import { 
  patientMatchesSearch, 
  getPatientFirstName, 
  getPatientLastName, 
  formatDateForDisplay 
} from "../lib/searchUtils"; 

export default function PatientSearch({ patients = [], selectedPatientId, onSelectPatient }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // THE SMART SEARCH IN ACTION
  const filteredPatients = useMemo(() => {
    if (!query) return patients.slice(0, 5); // Show first 5 by default if empty
    return patients.filter(p => patientMatchesSearch(p, query)).slice(0, 8);
  }, [patients, query]);

  // FIX: Update the search bar text the moment they click, avoiding the useEffect loop!
  const handleSelect = (p) => {
    onSelectPatient(p.id);
    setQuery(`${getPatientFirstName(p)} ${getPatientLastName(p)}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectPatient("");
    setQuery("");
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          className="w-full border border-zinc-300 bg-zinc-50 p-3 pl-10 pr-10 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
          placeholder="Rechercher par nom, téléphone, ou date de naissance..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            // If they start typing again, clear the current selection
            if (selectedPatientId) onSelectPatient(""); 
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        {/* Clear Button if a patient is selected */}
        {selectedPatientId && (
          <button 
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3.5 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 shadow-xl max-h-64 overflow-y-auto">
          {filteredPatients.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500 text-center italic">Aucun patient trouvé.</div>
          ) : (
            filteredPatients.map(p => {
              const isSelected = p.id === selectedPatientId;
              const dobValue = p.dob || p.date_of_birth;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`w-full p-3 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-zinc-50 border-b border-zinc-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`text-sm font-bold block ${isSelected ? 'text-emerald-700' : 'text-zinc-900'}`}>
                        {getPatientFirstName(p)} {getPatientLastName(p)}
                      </span>
                      <div className="flex gap-2 mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {p.phone && <span>{p.phone}</span>}
                        {p.phone && dobValue && <span>•</span>}
                        {dobValue && <span>Né(e) le {formatDateForDisplay(dobValue)}</span>}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  );
}