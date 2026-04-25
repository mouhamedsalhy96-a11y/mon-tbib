"use client";

import { useEffect, useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { 
  Home, Users, Calendar as CalendarIcon, 
  Settings as SettingsIcon, LogOut, Stethoscope,
  ChevronRight, UserCircle
} from "lucide-react";
import GlobalSearch from "../../components/GlobalSearch";
import Toast from "../../components/Toast";

// Create the Context for Notifications
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUser();
  }, []);

  const menu = [
    { to: "/dashboard", label: "Tableau de bord", icon: Home },
    { to: "/dashboard/patients", label: "Patients", icon: Users },
    { to: "/dashboard/agenda", label: "Agenda", icon: CalendarIcon },
    { to: "/dashboard/parametres", label: "Paramètres", icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex">
        
        {/* SIDEBAR */}
        <aside className="w-[280px] bg-zinc-950 text-zinc-400 flex flex-col border-r border-zinc-800 hidden lg:flex h-screen sticky top-0 z-50 print:hidden">
          <div className="h-20 flex-shrink-0 flex items-center px-8 border-b border-zinc-900 bg-zinc-950">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white italic leading-none">MON TBIB</h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">Smart Clinique</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Menu Principal</p>
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.to || (pathname.startsWith(item.to) && item.to !== "/dashboard");
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-bold rounded-lg ${
                    isActive ? "bg-emerald-600/10 text-emerald-400" : "hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-900">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <UserCircle className="h-8 w-8 text-zinc-600" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-300 truncate">{userEmail.split('@')[0]}</p>
                <p className="text-[9px] font-bold uppercase text-emerald-500">Praticien</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 flex-shrink-0 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center px-8 sticky top-0 z-40 print:hidden">
            <div className="flex-1">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <span>{menu.find(m => pathname.startsWith(m.to))?.label || "Session"}</span>
            </div>
          </header>
          
          <main className="p-8 lg:p-12 flex-1">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>

        {/* TOAST NOTIFICATION CONTAINER */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </ToastContext.Provider>
  );
}