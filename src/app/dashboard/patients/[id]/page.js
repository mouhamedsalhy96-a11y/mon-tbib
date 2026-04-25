"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, User, Phone, Calendar, FileText, 
  Clock, Pill, ChevronRight, FileBadge, Microscope, CreditCard, CheckCircle2 
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { useToast } from "../../layout";

export default function PatientProfile() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;
  
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [docsCount, setDocsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadAllData() {
      if (!patientId) return;
      try {
        const { data: p } = await supabase.from('patients').select('*').eq('id', patientId).single();
        setPatient(p);
        const { data: n } = await supabase.from('medical_notes').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
        setNotes(n || []);
        const { data: pr } = await supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
        setPrescriptions(pr || []);
        const { data: c } = await supabase.from('certificates').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
        setCertificates(c || []);
        const { data: inv } = await supabase.from('invoices').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
        setInvoices(inv || []);
        const { count } = await supabase.from('patient_documents').select('*', { count: 'exact', head: true }).eq('patient_id', patientId);
        setDocsCount(count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [patientId, refreshTrigger]);

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const { error } = await supabase.from('invoices').update({ status: 'Payé' }).eq('id', invoiceId);
      if (error) throw error;
      showToast("Paiement enregistré !");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      showToast("Erreur lors du paiement", "error");
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('medical_notes').insert([{ 
        patient_id: patientId, doctor_id: user.id, note_content: newNote 
      }]);
      if (error) throw error;
      setNewNote("");
      showToast("Note clinique ajoutée au dossier");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      showToast("Erreur de sauvegarde", "error");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-zinc-400 font-bold uppercase tracking-widest text-xs">Ouverture du dossier...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients" className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all rounded-full shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">Dossier Médical</h1>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">ID: {patient?.id?.substring(0,8)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* === LEFT COLUMN: WIDGETS === */}
        <div className="col-span-1 space-y-6">
          
          {/* Identity Widget */}
          <div className="border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-zinc-900 text-white mb-4 text-3xl font-black">
                {patient?.first_name?.[0]}{patient?.last_name?.[0]}
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{patient?.first_name} {patient?.last_name}</h2>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Dossier Actif</span>
              </div>
            </div>
            
            <div className="py-8 space-y-5 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="bg-zinc-50 p-2 text-zinc-400"><Calendar className="h-4 w-4" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none mb-1">Naissance</p>
                  <p className="text-sm font-bold text-zinc-900">{patient?.date_of_birth || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-zinc-50 p-2 text-zinc-400"><Phone className="h-4 w-4" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none mb-1">Téléphone</p>
                  <p className="text-sm font-bold text-zinc-900">{patient?.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link href={`/dashboard/patients/${patientId}/ordonnance`} className="flex w-full items-center justify-center gap-3 bg-zinc-900 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-600 transition-all shadow-xl">
                <Pill className="h-4 w-4" /> Nouvelle Ordonnance
              </Link>
              <div className="grid grid-cols-2 gap-2">
                 <Link href={`/dashboard/patients/${patientId}/certificat`} className="flex items-center justify-center gap-2 border border-zinc-200 bg-white py-3 text-[9px] font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-50">
                   <FileBadge className="h-4 w-4 text-zinc-400" /> Certificat
                 </Link>
                 <Link href={`/dashboard/patients/${patientId}/examens`} className="flex items-center justify-center gap-2 border border-zinc-200 bg-white py-3 text-[9px] font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-50">
                   <Microscope className="h-4 w-4 text-zinc-400" /> Examens ({docsCount})
                 </Link>
              </div>
              <Link href={`/dashboard/patients/${patientId}/facture`} className="flex w-full items-center justify-center gap-2 border border-zinc-200 bg-zinc-50/50 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all">
                <CreditCard className="h-4 w-4 opacity-50" /> Facturer la visite
              </Link>
            </div>
          </div>

          {/* Ordonnances Widget (PUT BACK IN) */}
          <div className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Ordonnances</h3>
              <Pill className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto">
              {prescriptions.map((p) => (
                <Link key={p.id} href={`/dashboard/patients/${patientId}/ordonnance/${p.id}`} className="p-5 flex items-center justify-between hover:bg-zinc-50 group transition-colors">
                  <p className="text-sm font-bold text-zinc-900">{new Date(p.created_at).toLocaleDateString()}</p>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 transition-all" />
                </Link>
              ))}
              {prescriptions.length === 0 && <div className="p-8 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">Aucune ordonnance.</div>}
            </div>
          </div>

          {/* Certificats Widget (PUT BACK IN) */}
          <div className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Certificats</h3>
              <FileBadge className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto">
              {certificates.map((c) => (
                <Link key={c.id} href={`/dashboard/patients/${patientId}/certificat/${c.id}`} className="p-5 flex items-center justify-between hover:bg-zinc-50 group transition-colors">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 truncate max-w-[150px]">{c.title}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 transition-all" />
                </Link>
              ))}
              {certificates.length === 0 && <div className="p-8 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">Aucun certificat.</div>}
            </div>
          </div>

          {/* Billing Widget */}
          <div className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Facturation (DT)</h3>
              <CreditCard className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-5 space-y-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-black text-zinc-900">{inv.amount} DT</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-sm ring-1 ring-inset ${
                      inv.status === 'Payé' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  {inv.status === 'En attente' && (
                    <button onClick={() => handleMarkAsPaid(inv.id)} className="w-full flex items-center justify-center gap-2 bg-zinc-900 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 transition-all">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Marquer Payé
                    </button>
                  )}
                </div>
              ))}
              {invoices.length === 0 && <div className="p-10 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">Aucun historique.</div>}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: MEDICAL FEED === */}
        <div className="col-span-2 space-y-8">
          <div className="border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-emerald-500"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-800">Observations Cliniques</h3>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Saisissez le motif de consultation, les symptômes et le diagnostic..."
              className="w-full min-h-[160px] border border-zinc-200 bg-zinc-50 p-6 text-sm font-medium focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300"
            />
            <div className="mt-4 flex justify-end">
              <button onClick={handleSaveNote} disabled={savingNote || !newNote.trim()} className="bg-zinc-900 px-10 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 disabled:bg-zinc-200 transition-all shadow-xl">
                {savingNote ? "Synchronisation..." : "Ajouter au dossier"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-4 px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Historique Médical</h3>
                <div className="flex-1 h-px bg-zinc-200"></div>
             </div>
             
             <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border border-zinc-200 bg-white p-10 hover:border-zinc-400 transition-all shadow-sm group">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
                      {new Date(note.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <Clock className="h-4 w-4 text-zinc-200 group-hover:text-zinc-400 transition-all" />
                  </div>
                  <p className="text-base text-zinc-800 leading-relaxed font-medium whitespace-pre-wrap">{note.note_content}</p>
                </div>
              ))}
              {notes.length === 0 && <div className="p-20 text-center border-2 border-dashed border-zinc-100 rounded-xl text-zinc-300 font-bold uppercase tracking-widest text-xs">Dossier vide.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}