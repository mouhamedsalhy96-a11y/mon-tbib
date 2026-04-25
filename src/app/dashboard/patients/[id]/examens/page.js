"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Upload, Trash2, ExternalLink, File } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";

export default function PatientDocuments() {
  const params = useParams();
  const patientId = params.id;
  const [patient, setPatient] = useState(null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // We use this trigger to refresh the data after an upload or deletion
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: p } = await supabase.from('patients').select('*').eq('id', patientId).single();
        setPatient(p);

        const { data: d } = await supabase.from('patient_documents').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
        setDocs(d || []);
      } catch (err) {
        console.error("Erreur de chargement des documents:", err);
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      fetchData();
    }
  }, [patientId, refreshTrigger]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single();

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      await supabase.from('patient_documents').insert([{
        patient_id: patientId,
        clinic_id: profile.clinic_id,
        name: file.name,
        category: 'Document', 
        file_path: filePath
      }]);

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert("Erreur d'upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (doc) => {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await supabase.storage.from('patient-files').remove([doc.file_path]);
      await supabase.from('patient_documents').delete().eq('id', doc.id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert("Erreur de suppression.");
    }
  };

  if (loading) return <div className="p-10 text-center text-sm font-medium text-zinc-500">Chargement des documents...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/patients/${patientId}`} className="flex h-8 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Examens & Analyses</h1>
        </div>
        
        <label className="bg-zinc-900 text-white px-6 py-2.5 text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-emerald-600 transition-colors shadow-sm">
          <Upload className="h-4 w-4" />
          {uploading ? "Transfert..." : "Ajouter un fichier"}
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      <div className="bg-zinc-900 p-8 text-white border-b-4 border-emerald-500">
         <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Dossier Patient</p>
         <h2 className="text-2xl font-bold">{patient?.first_name} {patient?.last_name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.length === 0 && (
          <div className="col-span-full py-20 border border-dashed border-zinc-300 bg-white text-center text-zinc-400 italic text-sm">
            {/* FIX: Use curly braces for the string to avoid the quote error */}
            {"Aucun document n'a été ajouté."}
          </div>
        )}

        {docs.map((doc) => (
          <div key={doc.id} className="border border-zinc-200 bg-white p-5 flex items-center gap-4 group transition-all hover:border-zinc-300 shadow-sm">
            <div className="p-3 bg-zinc-100 text-zinc-500">
              <File className="h-6 w-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate">{doc.name}</p>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mt-0.5">
                Ajouté le {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/patient-files/${doc.file_path}`} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button onClick={() => deleteDoc(doc)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}