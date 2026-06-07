"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import PatientSearch from "../../../../components/PatientSearch";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

registerLocale("fr", fr);

export default function NouveauRendezVous() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: new Date(),
    appointment_time: new Date(new Date().setHours(9, 0, 0, 0)), 
    reason: "",
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          const { data, error } = await supabase
            .from('patients')
            .select('id, first_name, last_name, phone, date_of_birth') 
            .eq('clinic_id', profile.clinic_id);
            
          if (error) {
            console.error("SUPABASE ERROR FETCHING PATIENTS:", error.message);
          } else {
            setPatients(data || []);
          }
        }
      } catch (err) {
        console.error("GENERAL ERROR:", err);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.patient_id) throw new Error("Veuillez sélectionner un patient dans la liste.");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
      if (!profile) throw new Error("Profil clinique introuvable.");

      const dateObj = new Date(formData.appointment_date);
      const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      const timeObj = new Date(formData.appointment_time);
      const formattedTime = `${String(timeObj.getHours()).padStart(2, '0')}:${String(timeObj.getMinutes()).padStart(2, '0')}:00`;

      const { error: insertError } = await supabase
        .from('appointments')
        .insert([{
          clinic_id: profile.clinic_id,
          patient_id: formData.patient_id,
          appointment_date: formattedDate,
          appointment_time: formattedTime,
          reason: formData.reason || null,
          status: "À venir"
        }]);

      if (insertError) throw new Error(insertError.message || "Erreur lors de l'insertion dans la base de données.");

      router.push("/dashboard/agenda");
      router.refresh();

    } catch (error) {
      console.error("Erreur complète:", error);
      alert(error.message || "Une erreur est survenue lors de l'ajout du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agenda" className="flex h-8 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nouveau Rendez-vous</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border border-zinc-200 bg-white p-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Patient *</label>
            <PatientSearch 
              patients={patients} 
              selectedPatientId={formData.patient_id} 
              onSelectPatient={(id) => setFormData({...formData, patient_id: id || ""})} 
            />
          </div>

          <div className="col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Date *</label>
            <div className="relative">
              <DatePicker
                selected={formData.appointment_date}
                onChange={(date) => setFormData({...formData, appointment_date: date})}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                className="block w-full border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Heure *</label>
            <div className="relative">
              <DatePicker
                selected={formData.appointment_time}
                onChange={(time) => setFormData({...formData, appointment_time: time})}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Heure"
                dateFormat="HH:mm"
                locale="fr"
                className="block w-full border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Motif de consultation</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Ex: Consultation de suivi, Douleur au dos..."
              className="block w-full border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-zinc-100 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:bg-zinc-400"
          >
            <Save className="h-4 w-4" />
            {loading ? "Enregistrement..." : "Enregistrer le rendez-vous"}
          </button>
        </div>
      </form>
    </div>
  );
}