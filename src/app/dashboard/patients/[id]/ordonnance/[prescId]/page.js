"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
// FIX: Exactly 6 jumps back to reach the root lib folder
import { supabase } from "../../../../../../lib/supabase";

export default function ViewOrdonnance() {
  const params = useParams();
  const prescId = params.prescId;
  const patientId = params.id;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Prescription + Patient + Clinic info in one go
        const { data: presc, error: pErr } = await supabase
          .from('prescriptions')
          .select('*, patients(*), clinics(*)')
          .eq('id', prescId)
          .single();

        if (pErr) throw pErr;

        // Fetch the specific medications
        const { data: items, error: iErr } = await supabase
          .from('prescription_items')
          .select('*')
          .eq('prescription_id', prescId);

        if (iErr) throw iErr;

        setData({ ...presc, items });
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setLoading(false);
      }
    };
    if (prescId) fetchData();
  }, [prescId]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-500">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="text-sm font-medium tracking-widest uppercase">Génération du document...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Navigation & Actions (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/dashboard/patients/${patientId}`} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour au dossier
        </Link>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
        >
          <Printer className="h-4 w-4" /> Imprimer l&apos;ordonnance
        </button>
      </div>

      {/* PRINTABLE AREA */}
      <div className="bg-white border border-zinc-200 p-16 shadow-sm min-h-[1000px] flex flex-col print:border-none print:shadow-none print:p-0">
        
        {/* Clinic Header */}
        <div className="border-b-4 border-zinc-900 pb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">{data?.clinics?.name || "Clinique Médicale"}</h1>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">Secteur Santé</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Document Officiel</p>
            <p className="text-sm font-bold text-zinc-900 mt-1">N° REF-{data?.id?.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="py-12 flex justify-between items-end border-b border-zinc-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Ordonnance pour</p>
            <h2 className="text-2xl font-bold text-zinc-900">{data?.patients?.first_name} {data?.patients?.last_name}</h2>
          </div>
          <div className="text-right font-mono text-sm font-bold text-zinc-900">
            {new Date(data?.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Medications List */}
        <div className="flex-1 py-10">
          <div className="space-y-10">
            {data?.items?.map((item, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500/20"></div>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-xl font-bold text-zinc-900">{item.medication_name}</h3>
                  <span className="text-sm font-bold text-emerald-600 italic">{item.dosage}</span>
                </div>
                <p className="text-base text-zinc-700 mt-2 font-medium leading-relaxed underline decoration-zinc-100 underline-offset-4">
                  {item.instructions}
                </p>
                <p className="text-[10px] text-zinc-400 mt-2 uppercase font-black tracking-widest">
                  Traitement: {item.duration}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Signature */}
        <div className="mt-20 pt-10 border-t-2 border-zinc-900 flex justify-between items-start">
          <div className="max-w-[200px]">
             <p className="text-[9px] leading-tight text-zinc-400 font-medium">
               Cette ordonnance est strictement personnelle. Validité selon la réglementation en vigueur.
             </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-12">Signature et Cachet du Praticien</p>
            <div className="h-24 w-48 border-2 border-dashed border-zinc-100 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}