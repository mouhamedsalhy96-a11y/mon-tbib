"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";
import { useToast } from "../../../layout";

export default function NouvelleOrdonnance() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;
  
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meds, setMeds] = useState([{ medication_name: "", dosage: "", duration: "", instructions: "" }]);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
      setPatient(data);
      setLoading(false);
    };
    if (patientId) fetchPatient();
  }, [patientId]);

  const addMedRow = () => setMeds([...meds, { medication_name: "", dosage: "", duration: "", instructions: "" }]);
  const removeMedRow = (index) => meds.length > 1 && setMeds(meds.filter((_, i) => i !== index));
  const updateMed = (index, field, value) => {
    const updated = [...meds];
    updated[index][field] = value;
    setMeds(updated);
  };

  const handleSave = async () => {
    if (meds.some(m => !m.medication_name)) return showToast("Saisissez le nom du médicament.", "error");
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();

      const { data: presc, error: pErr } = await supabase
        .from('prescriptions')
        .insert([{ patient_id: patientId, doctor_id: user.id, clinic_id: profile.clinic_id }])
        .select().single();

      if (pErr) throw pErr;

      const items = meds.map(m => ({ ...m, prescription_id: presc.id }));
      await supabase.from('prescription_items').insert(items);

      showToast("Ordonnance enregistrée avec succès !");
      router.push(`/dashboard/patients/${patientId}`);
      router.refresh();
    } catch (err) {
      showToast("Erreur de sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-sm text-zinc-500">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/patients/${patientId}`} className="flex h-8 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Nouvelle Ordonnance</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:bg-zinc-400">
          <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="bg-zinc-900 p-8 text-white border-b-4 border-emerald-500">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Patient</p>
            <h2 className="text-2xl font-bold">{patient?.first_name} {patient?.last_name}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date d&apos;émission</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="border border-zinc-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <th className="px-6 py-4">Médicament</th>
              <th className="px-6 py-4">Dosage</th>
              <th className="px-6 py-4">Durée</th>
              <th className="px-6 py-4">Instructions</th>
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {meds.map((med, index) => (
              <tr key={index}>
                <td className="px-4 py-2"><input type="text" className="w-full border-none bg-transparent p-2 text-sm font-semibold focus:ring-0" placeholder="Nom..." value={med.medication_name} onChange={(e) => updateMed(index, "medication_name", e.target.value)} /></td>
                <td className="px-4 py-2"><input type="text" className="w-full border-none bg-transparent p-2 text-sm focus:ring-0" placeholder="Dosage..." value={med.dosage} onChange={(e) => updateMed(index, "dosage", e.target.value)} /></td>
                <td className="px-4 py-2"><input type="text" className="w-full border-none bg-transparent p-2 text-sm focus:ring-0" placeholder="Durée..." value={med.duration} onChange={(e) => updateMed(index, "duration", e.target.value)} /></td>
                <td className="px-4 py-2"><input type="text" className="w-full border-none bg-transparent p-2 text-sm focus:ring-0" placeholder="Instructions..." value={med.instructions} onChange={(e) => updateMed(index, "instructions", e.target.value)} /></td>
                <td className="px-4 py-2 text-center"><button onClick={() => removeMedRow(index)} className="text-zinc-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addMedRow} className="w-full border-t border-zinc-100 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900">+ Ajouter une ligne</button>
      </div>
    </div>
  );
}