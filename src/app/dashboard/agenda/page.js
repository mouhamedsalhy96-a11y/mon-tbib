"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

// Modern calendar imports
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

registerLocale("fr", fr);

export default function Agenda() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();

        if (profile) {
          const dateObj = new Date(selectedDate);
          const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

          const { data: appts } = await supabase
            .from('appointments')
            .select(`id, appointment_time, reason, status, patient_id, patients (first_name, last_name)`)
            .eq('clinic_id', profile.clinic_id)
            .eq('appointment_date', formattedDate)
            .order('appointment_time', { ascending: true });

          setAppointments(appts || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Agenda</h1>
          <p className="mt-1 text-sm text-zinc-500">Gérez vos rendez-vous du jour.</p>
        </div>
        <Link href="/dashboard/agenda/nouveau" className="flex items-center gap-2 bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800">
          <Plus className="h-4 w-4" /> Nouveau Rendez-vous
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        <div className="col-span-1">
          <div className="sticky top-6 border border-zinc-200 bg-white p-5 shadow-sm">
            <button onClick={() => setSelectedDate(new Date())} className="mb-4 w-full rounded-sm bg-zinc-100 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-200">Aujourd&apos;hui</button>
            <div className="[&_.react-datepicker]:w-full [&_.react-datepicker\_\_month-container]:w-full [&_.react-datepicker]:border-none [&_.react-datepicker\_\_day--selected]:bg-emerald-600">
              <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} inline locale="fr" />
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="border border-zinc-200 bg-white min-h-[400px]">
            <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
               <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800">
                 {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
               </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {!loading && appointments.length === 0 && (
                <div className="p-12 text-center text-sm text-zinc-500 italic">Aucun rendez-vous.</div>
              )}
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-6 transition-colors hover:bg-zinc-50/50">
                  <div className="text-center w-16">
                    <span className="text-lg font-black text-zinc-900">{apt.appointment_time.substring(0, 5)}</span>
                  </div>
                  <div className="h-8 w-px bg-zinc-200"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900">{apt.patients?.first_name} {apt.patients?.last_name}</p>
                    <p className="text-xs text-zinc-500">{apt.reason}</p>
                  </div>
                  
                  {/* NEW ACTION: START CONSULTATION */}
                  <Link 
                    href={`/dashboard/consultation?patientId=${apt.patient_id}&apptId=${apt.id}`}
                    className="flex items-center gap-2 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Lancer
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}