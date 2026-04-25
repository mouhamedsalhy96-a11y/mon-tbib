"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Loader2, FileBadge } from "lucide-react";
import Link from "next/navigation";
import { supabase } from "../../../../../../lib/supabase";

export default function ViewCertificat() {
  const params = useParams();
  const certId = params.certId;
  const patientId = params.id;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cert } = await supabase.from('certificates').select('*, patients(*), clinics(*)').eq('id', certId).single();
      setData(cert);
      setLoading(false);
    };
    if (certId) fetchData();
  }, [certId]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors">
          <Printer className="h-4 w-4" /> Imprimer le certificat
        </button>
      </div>

      <div className="bg-white border border-zinc-200 p-16 shadow-sm min-h-[900px] flex flex-col print:border-none print:shadow-none print:p-0">
        
        {/* CLINIC HEADER (DYNAMIC) */}
        <div className="border-b-4 border-zinc-900 pb-10 mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">{data?.clinics?.name}</h1>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">{data?.clinics?.specialization || "Service Médical"}</p>
          <div className="mt-4 text-xs font-medium text-zinc-500 space-y-1 uppercase tracking-wider">
            <p>{data?.clinics?.address}</p>
            <p>Tél: {data?.clinics?.phone}</p>
          </div>
        </div>

        {/* DOCUMENT TITLE */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-zinc-900 underline decoration-emerald-500 decoration-4 underline-offset-8">
            {data?.title}
          </h2>
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          <p className="text-lg leading-[2] text-zinc-800 text-justify whitespace-pre-wrap font-medium">
            {data?.content}
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-20 flex justify-between items-end">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Fait le {new Date(data?.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-12">Cachet et Signature</p>
            <div className="h-24 w-48 border-2 border-dashed border-zinc-100 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}