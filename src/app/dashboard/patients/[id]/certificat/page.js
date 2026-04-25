"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";
import { useToast } from "../../../layout";

export default function NouveauCertificat() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;
  
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certificate, setCertificate] = useState({
    title: "Certificat Médical",
    content: "Je soussigné, certifie après examen clinique que l'état de santé de M./Mme ... nécessite un repos de ... jours à compter de ce jour."
  });

  useEffect(() => {
    const fetchPatient = async () => {
      const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
      setPatient(data);
      if (data) {
        setCertificate(prev => ({
          ...prev,
          content: `Je soussigné, certifie après examen clinique que l'état de santé de M./Mme ${data.last_name} ${data.first_name} nécessite un repos de ... jours à compter de ce jour.`
        }));
      }
      setLoading(false);
    };
    fetchPatient();
  }, [patientId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
      
      await supabase.from('certificates').insert([{
        patient_id: patientId,
        doctor_id: user.id,
        clinic_id: profile.clinic_id,
        title: certificate.title,
        content: certificate.content
      }]);

      showToast("Certificat enregistré avec succès !");
      router.push(`/dashboard/patients/${patientId}`);
    } catch (err) {
      showToast("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/patients/${patientId}`} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-zinc-500" />
          </Link>
          <h1 className="text-2xl font-bold">Rédiger un Certificat</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-zinc-900 text-white px-6 py-2 font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2">
          <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="bg-white border border-zinc-200 p-8 shadow-sm space-y-6">
        <div>
          <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-2 tracking-widest">Titre du document</label>
          <input 
            type="text" 
            className="w-full text-xl font-bold border-b border-zinc-200 py-2 focus:border-emerald-500 outline-none" 
            value={certificate.title}
            onChange={(e) => setCertificate({...certificate, title: e.target.value})}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-2 tracking-widest">Contenu du certificat</label>
          <textarea 
            rows="12" 
            className="w-full bg-zinc-50 p-6 text-lg leading-relaxed focus:bg-white border border-zinc-100 outline-none"
            value={certificate.content}
            onChange={(e) => setCertificate({...certificate, content: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
}