"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setLoading(true);
    setError(null);

    // Ask Supabase to check the credentials
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      setLoading(false);
    } else {
      // Success! Send them to the dashboard
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Mon Tbib</h1>
          <p className="mt-2 text-sm text-slate-500">
            Connectez-vous à votre espace sécurisé
          </p>
        </div>

        {/* We added an onSubmit handler to the form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="docteur@clinique.tn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>

          {/* This section displays a red error message if login fails */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-sky-400"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
           <p className="text-xs text-slate-400">Accès restreint au personnel autorisé.</p>
        </div>

      </div>
    </div>
  );
}