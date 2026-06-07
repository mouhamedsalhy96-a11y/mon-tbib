"use client";

import { useState, useEffect } from "react";
import { Save, Building2, MapPin, Phone, Stethoscope, User } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../layout";
import { useRouter } from "next/navigation";

export default function Settings() {
  const { showToast } = useToast();
  const router = useRouter(); // Next.js router for cache busting
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [doctorName, setDoctorName] = useState("");
  
  const [clinic, setClinic] = useState({
    name: "",
    address: "",
    phone: "",
    specialization: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('clinic_id, full_name').eq('id', user.id).single();
      
      if (profile) {
        setDoctorName(profile.full_name || "Dr. ");
        
        const { data: clinicData } = await supabase.from('clinics').select('*').eq('id', profile.clinic_id).single();
        if (clinicData) {
          setClinic({
            name: clinicData.name || "",
            address: clinicData.address || "",
            phone: clinicData.phone || "",
            specialization: clinicData.specialization || ""
          });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
      
      // 1. UPDATE SUPABASE AUTH METADATA (The hidden login data)
      await supabase.auth.updateUser({
        data: { full_name: doctorName }
      });

      // 2. UPDATE PROFILES TABLE (The database data)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: doctorName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. UPDATE THE CLINIC
      const { error: clinicError } = await supabase
        .from('clinics')
        .update({
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          specialization: clinic.specialization
        })
        .eq('id', profile.clinic_id);

      if (clinicError) throw clinicError;
      
      showToast("Paramètres mis à jour avec succès !");
      
      // 4. BUST CACHE & REFRESH: Force Next.js and the Browser to load the new name
      router.refresh(); // Clears Next.js Server Cache
      setTimeout(() => {
        window.location.reload(); // Reloads layout.js to grab fresh data
      }, 800);

    } catch (err) {
      console.error("Erreur:", err);
      showToast("Erreur lors de la sauvegarde. Vérifiez vos permissions RLS.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-zinc-500 text-sm">Chargement de vos paramètres...</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Paramètres</h1>
        <p className="mt-1 text-sm text-zinc-500">Configurez vos informations personnelles et celles de votre cabinet.</p>
      </div>

      <form onSubmit={handleSave} className="border border-zinc-200 bg-white p-8 space-y-8">
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-600 border-b border-zinc-100 pb-2">Le Praticien</h2>
          
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                required
                className="w-full border border-zinc-300 bg-zinc-50 p-2.5 pl-10 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-600 border-b border-zinc-100 pb-2">Le Cabinet</h2>
          
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