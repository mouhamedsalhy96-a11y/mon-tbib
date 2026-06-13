"use client";

import { useState } from "react";
import { Send, AlertCircle, CheckCircle2, LifeBuoy } from "lucide-react";

export default function SupportPage() {
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(event.target);
    
   
    formData.append("access_key", "a6cb9622-d3ef-4bb9-8c03-3c3f407d41ed");
    // ------------------------------------------------

    // Optional: Add a subject line for your emails
    formData.append("subject", "Nouveau ticket de support - Mon Tbib");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        setStatus("success");
        event.target.reset();
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-white border border-zinc-200 shadow-sm p-10 relative overflow-hidden">
        {/* Decorative Background Icon */}
        <div className="absolute right-[-5%] top-[-5%] text-zinc-50 opacity-50 pointer-events-none">
          <LifeBuoy className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 mb-2">Contacter l&apos;Assistance</h1>
          <p className="text-sm text-zinc-500 mb-8 font-medium">
            Vous rencontrez un problème technique ou avez une suggestion ? Envoyez un message directement à l&apos;équipe de développement.
          </p>

          {status === "success" && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest">Message Envoyé</h3>
                <p className="text-xs text-emerald-600 mt-1">L&apos;équipe technique a reçu votre demande et vous contactera sous peu.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest">Erreur d&apos;envoi</h3>
                <p className="text-xs text-red-600 mt-1">Une erreur s&apos;est produite. Veuillez réessayer ultérieurement.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nom de la clinique / Docteur</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Ex: Cabinet Dr. Youssef"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Email de contact</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Niveau d&apos;urgence</label>
              <select 
                name="urgence" 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="Basse (Question / Suggestion)">Basse - Question générale ou suggestion</option>
                <option value="Moyenne (Problème mineur)">Moyenne - Problème d&apos;affichage ou bug mineur</option>
                <option value="Haute (Bloquant)">Haute - Impossible d&apos;utiliser l&apos;application (Bloquant)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Description du problème</label>
              <textarea 
                name="message" 
                required 
                rows="5"
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y"
                placeholder="Décrivez en détail le problème que vous rencontrez..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Envoi en cours..." : "Envoyer la demande"}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}