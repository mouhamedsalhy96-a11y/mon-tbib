"use client";

import { useState, useEffect } from "react";
import { Save, Building2, MapPin, Phone, Stethoscope } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../layout";

export default function Settings() {
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinic, setClinic] = useState({
    name: "",
    address: "",
    phone: "",
    specialization: ""
  });

  useEffect(() => {
    const fetchClinic = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
      const { data: clinicData } = await supabase.from('clinics').select('*').eq('id', profile.clinic_id).single();
      
      if (clinicData) {
        setClinic({
          name: clinicData.name || "",
          address: clinicData.address || "",
          phone: clinicData.phone || "",
          specialization: clinicData.specialization || ""
        });
      }
      setLoading(false);
    };
    fetchClinic();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
      
      const { error } = await supabase
        .from('clinics')
        .update({
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          specialization: clinic.specialization
        })
        .eq('id', profile.clinic_id);

      if (error) throw error;
      showToast("Paramètres mis à jour avec succès !");
    } catch (err) {
      showToast("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Paramètres</h1>
        <p className="mt-1 text-sm text-zinc-500">Configurez les informations de votre cabinet pour vos documents officiels.</p>
      </div>

      <form onSubmit={handleSave} className="border border-zinc-200 bg-white p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Nom du Cabinet / Clinique</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                required
                className="w-full border border-zinc-300 bg-zinc-50 p-2.5 pl-10 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                value={clinic.name}
                onChange={(e) => setClinic({...clinic, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Spécialité</label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="ex: Cardiologue, Médecin Généraliste"
                className="w-full border border-zinc-300 bg-zinc-50 p-2.5 pl-10 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                value={clinic.specialization}
                onChange={(e) => setClinic({...clinic, specialization: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Adresse complète</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <textarea
                className="w-full border border-zinc-300 bg-zinc-50 p-2.5 pl-10 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                rows="3"
                value={clinic.address}
                onChange={(e) => setClinic({...clinic, address: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Téléphone de contact</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                className="w-full border border-zinc-300 bg-zinc-50 p-2.5 pl-10 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                value={clinic.phone}
                onChange={(e) => setClinic({...clinic, phone: e.target.value})}
              />
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-zinc-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-zinc-900 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}