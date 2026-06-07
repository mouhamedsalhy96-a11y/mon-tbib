"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, PlayCircle } from "lucide-react";
import { supabase } from "../../../../lib/supabase"; 

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

registerLocale("fr", fr);

export default function ConsultationRapide() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // FIXED: Changed 'dob' to 'date_of_birth' to match your main UI!
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "", 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();

      // FIXED: Saving to date_of_birth so the Consultation Header can read it
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert([{
          clinic_id: profile.clinic_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          date_of_birth: formData.date_of_birth || null, 
        }])
        .select()
        .single();

      if (patientError) throw patientError;

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

      const { data: newAppt, error: apptError } = await supabase
        .from('appointments')
        .insert([{
          clinic_id: profile.clinic_id,
          patient_id: newPatient.id,
          appointment_date: formattedDate,
          appointment_time: formattedTime,
          reason: "Consultation sans rendez-vous (Urgence / Passage)",
          status: "En cours" 
        }])
        .select()
        .single();

      if (apptError) throw apptError;

      router.push(`/dashboard/consultation?patientId=${newPatient.id}&apptId=${newAppt.id}`);

    } catch (error) {
      console.error("Erreur Rapide:", error);
      alert("Une erreur s'est produite lors de la création rapide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /> Consultation Rapide
          </h1>
          <p className="text-sm text-zinc-500">Ajoutez un patient sans rendez-vous et démarrez la consultation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Prénom *</label>
            <input 
              type="text" 
              required
              autoFocus
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nom *</label>
            <input 
              type="text" 
              required
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Date de naissance</label>
            <div className="relative">
              {/* FIXED: Reading and writing to formData.date_of_birth */}
              <DatePicker
                selected={formData.date_of_birth ? new Date(formData.date_of_birth) : null}
                onChange={(date) => {
                  const formattedDate = date ? date.toISOString().split('T')[0] : "";
                  setFormData({...formData, date_of_birth: formattedDate});
                }}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                maxDate={new Date()}
                placeholderText="JJ/MM/AAAA"
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Téléphone</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all disabled:opacity-50"
        >
          {loading ? "Création en cours..." : "Lancer la consultation"}
          <PlayCircle className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}