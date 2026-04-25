"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";
import { useToast } from "../../../layout";

export default function NouvelleFacture() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;
  
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "Consultation Médicale",
    status: "Payé"
  });

  useEffect(() => {
    const fetchPatient = async () => {
      const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
      setPatient(data);
      setLoading(false);
    };
    fetchPatient();
  }, [patientId]);

  const handleSave = async () => {
    if (!formData.amount) return showToast("Veuillez saisir un montant.", "error");
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();

      await supabase.from('invoices').insert([{
        patient_id: patientId,
        clinic_id: profile.clinic_id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        status: formData.status
      }]);

      showToast("Facture créée avec succès !");
      router.push(`/dashboard/patients/${patientId}`);
    } catch (err) {
      showToast("Erreur lors de la création.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-sm font-medium text-zinc-500">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/patients/${patientId}`} className="flex h-8 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nouvelle Facture</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-zinc-900 text-white px-8 py-2.5 font-bold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm">
          <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="bg-white border border-zinc-200 p-8 shadow-sm space-y-6">
        <div className="bg-emerald-50 p-4 border-l-4 border-emerald-500 mb-4">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Patient: {patient?.first_name} {patient?.last_name}</p>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-2 tracking-widest">Description</label>
          <input 
            type="text" 
            className="w-full border border-zinc-200 bg-zinc-50 p-3 text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2 tracking-widest">Montant (DT)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-zinc-400 text-sm font-bold">DT</span>
              <input 
                type="number" 
                placeholder="0.000"
                className="w-full border border-zinc-200 bg-zinc-50 p-3 pl-10 text-sm focus:bg-white focus:border-emerald-500 outline-none font-bold" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2 tracking-widest">État du Paiement</label>
            <select 
              className="w-full border border-zinc-200 bg-zinc-50 p-3 text-sm focus:bg-white focus:border-emerald-500 outline-none font-bold"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Payé">Payé</option>
              <option value="En attente">En attente</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}