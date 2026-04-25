"use client";

import { useEffect, useState } from "react";
import { Users, FileText, CalendarClock, ArrowUpRight, TrendingUp, Stethoscope } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ patients: 0, notes: 0, appointmentsToday: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();
        
        const { count: pCount } = await supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', profile.clinic_id);
        const { count: nCount } = await supabase.from('medical_notes').select('*', { count: 'exact', head: true }).eq('doctor_id', user.id);
        
        const today = new Date().toISOString().split('T')[0];
        const { data: appts } = await supabase.from('appointments').select('*, patients(*)').eq('clinic_id', profile.clinic_id).eq('appointment_date', today).order('appointment_time');
        
        setStats({ patients: pCount || 0, notes: nCount || 0, appointmentsToday: appts || [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-zinc-400 font-bold uppercase tracking-widest text-xs">Synchronisation...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Bonjour, Docteur</h1>
          <p className="text-zinc-500 font-medium mt-1">Voici l&apos;activité de votre cabinet pour aujourd&apos;hui.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Session Sécurisée</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Patients", value: stats.patients, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Consultations", value: stats.notes, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Rendez-vous", value: stats.appointmentsToday.length, icon: CalendarClock, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-zinc-200 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute right-[-10%] top-[-10%] h-24 w-24 rounded-full ${item.bg} opacity-20 group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{item.label}</p>
                <p className="text-4xl font-black text-zinc-900 tracking-tighter">{item.value}</p>
              </div>
              <div className={`p-3 ${item.bg} ${item.color} rounded-xl`}>
                <item.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800">Planning du jour</h2>
            <button onClick={() => router.push('/dashboard/agenda')} className="text-[10px] font-black uppercase text-emerald-600 hover:underline">Voir l&apos;agenda</button>
          </div>
          <div className="divide-y divide-zinc-50">
            {stats.appointmentsToday.length === 0 ? (
              <div className="p-20 text-center text-zinc-400 italic text-sm">Aucun rendez-vous aujourd&apos;hui.</div>
            ) : (
              stats.appointmentsToday.map((apt) => (
                <div key={apt.id} onClick={() => router.push(`/dashboard/patients/${apt.patient_id}`)} className="px-8 py-6 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-black text-zinc-900 font-mono">{apt.appointment_time.substring(0, 5)}</span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{apt.patients?.first_name} {apt.patients?.last_name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{apt.reason || "Consultation"}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-900 p-8 text-white shadow-xl relative overflow-hidden h-full">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-2 uppercase tracking-widest">Support Technique</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">Un problème avec l&apos;impression ou la base de données ? Notre équipe est là.</p>
              <button className="w-full py-3 bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Contacter l&apos;Assistance</button>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Stethoscope className="h-32 w-32 rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}