"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, User } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function PatientsDirectory() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          const { data: patientsData } = await supabase
            .from('patients')
            .select('*')
            .eq('clinic_id', profile.clinic_id)
            .order('created_at', { ascending: false });

          setPatients(patientsData || []);
        }
      }
      setLoading(false);
    };

    fetchPatients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Patients</h1>
          <p className="mt-1 text-sm text-zinc-500">Gérez votre base de données de patients.</p>
        </div>
        <Link 
          href="/dashboard/patients/nouveau"
          className="flex items-center gap-2 bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Nouveau Patient
        </Link>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          className="block w-full border border-zinc-300 bg-white p-3 pl-10 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Rechercher un patient par nom..."
        />
      </div>

      <div className="border border-zinc-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Chargement des données...</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">Aucun patient trouvé.</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {patients.map((patient) => (
              // FIX: Added router.push to navigate to the individual patient profile!
              <div 
                key={patient.id} 
                onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center bg-zinc-100 text-zinc-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{patient.first_name} {patient.last_name}</p>
                    <p className="text-xs text-zinc-500">{patient.phone || "Pas de téléphone"}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-medium text-zinc-500">Né(e) le</p>
                   <p className="text-sm font-semibold text-zinc-900">{patient.date_of_birth || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}