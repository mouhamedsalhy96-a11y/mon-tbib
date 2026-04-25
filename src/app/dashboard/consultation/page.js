"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, User, Activity, FileText, ArrowLeft } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../layout";

function ConsultationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId");
  const apptId = searchParams.get("apptId");
  
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    observation: "",
    vitals_weight: "",
    vitals_bp: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
      setPatient(data);
      setLoading(false);
    };
    if (patientId) fetchData();
  }, [patientId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();

      const { data: cons, error } = await supabase.from('consultations').insert([{
        appointment_id: apptId,
        patient_id: patientId,
        doctor_id: user.id,
        clinic_id: profile.clinic_id,
        ...formData
      }]).select().single();

      if (error) throw error;

      await supabase.from('medical_notes').insert([{
        patient_id: patientId,
        doctor_id: user.id,
        note_content: `CONSULTATION: \nSymptômes: ${formData.symptoms}\nDiagnostic: ${formData.diagnosis}\nObservations: ${formData.observation}`
      }]);

      if (apptId) {
        await supabase.from('appointments').update({ status: 'Confirmé' }).eq('id', apptId);
      }

      showToast("Consultation enregistrée avec succès !");
      router.push(`/dashboard/patients/${patientId}`);
    } catch (err) {
      showToast("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Initialisation...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-zinc-500" />
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Consultation en cours</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="bg-zinc-900 text-white px-8 py-3 font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Save className="h-4 w-4" /> {saving ? "Sauvegarde..." : "Terminer et Enregistrer"}
        </button>
      </div>

      <div className="bg-white border border-zinc-200 p-6 flex items-center gap-6 shadow-sm">
        <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">{patient?.first_name} {patient?.last_name}</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Né(e) le {patient?.date_of_birth}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Signes Vitaux
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Poids (kg)</label>
                <input 
                  type="text" 
                  className="w-full border border-zinc-200 bg-zinc-50 p-2 text-sm focus:bg-white outline-none" 
                  value={formData.vitals_weight}
                  onChange={(e) => setFormData({...formData, vitals_weight: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Tension Artérielle</label>
                <input 
                  type="text" 
                  placeholder="ex: 12/8"
                  className="w-full border border-zinc-200 bg-zinc-50 p-2 text-sm focus:bg-white outline-none" 
                  value={formData.vitals_bp}
                  onChange={(e) => setFormData({...formData, vitals_bp: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" /> Symptômes & Plaintes
              </h3>
              <textarea 
                rows="3" 
                className="w-full border border-zinc-200 bg-zinc-50 p-3 text-sm focus:bg-white outline-none"
                value={formData.symptoms}
                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
              />
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" /> Diagnostic
              </h3>
              <textarea 
                rows="3" 
                className="w-full border border-zinc-200 bg-zinc-50 p-3 text-sm focus:bg-white outline-none"
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              />
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" /> Observations / Plan de traitement
              </h3>
              <textarea 
                rows="5" 
                className="w-full border border-zinc-200 bg-zinc-50 p-3 text-sm focus:bg-white outline-none"
                value={formData.observation}
                onChange={(e) => setFormData({...formData, observation: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Chargement de la session...</div>}>
      <ConsultationContent />
    </Suspense>
  );
}