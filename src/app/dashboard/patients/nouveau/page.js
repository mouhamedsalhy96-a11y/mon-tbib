"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "../../../../lib/supabase";

// Modern calendar imports
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

registerLocale("fr", fr);

export default function NouveauPatient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
         throw new Error("Impossible de trouver la clinique. Le profil est manquant.");
      }

      const { error: insertError } = await supabase
        .from('patients')
        .insert([
          {
            clinic_id: profile.clinic_id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth || null,
            phone: formData.phone || null,
          }
        ]);

      if (insertError) throw insertError;

      router.push("/dashboard/patients");
      router.refresh();

    } catch (error) {
      console.error("Erreur d'insertion:", error);
      alert(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="flex h-8 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Ajouter un patient</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border border-zinc-200 bg-white p-8">
        <div className="grid grid-cols-2 gap-6">
          
          <div className="col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Prénom *</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="block w-full border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Nom *</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="block w-full border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Date de naissance</label>
            <div className="relative">
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
                className="block w-full border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-700">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
            {loading ? "Enregistrement..." : "Enregistrer le patient"}
          </button>
        </div>
      </form>
    </div>
  );
}