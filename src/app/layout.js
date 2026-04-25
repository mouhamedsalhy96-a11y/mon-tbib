import "./globals.css";

export const metadata = {
  title: "Mon Tbib",
  description: "Dossier médical privé - Espace sécurisé",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}