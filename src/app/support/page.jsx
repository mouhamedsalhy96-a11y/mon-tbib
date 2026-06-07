export default function SupportPage() {
  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "a6cb9622-d3ef-4bb9-8c03-3c3f407d41ed");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      alert("Message envoyé à l'assistance !");
      event.target.reset();
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Contacter l&apos;assistance</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" name="name" placeholder="Votre Nom" required className="border p-2 rounded" />
        <input type="email" name="email" placeholder="Votre Email" required className="border p-2 rounded" />
        <input type="tel" name="phone" placeholder="Numéro de téléphone" className="border p-2 rounded" />
        
        <select name="urgency" className="border p-2 rounded">
          <option value="Non Urgent">Non Urgent (Question générale)</option>
          <option value="Urgent">Urgent (Problème technique / Blocage)</option>
        </select>
        
        <textarea name="message" placeholder="Décrivez votre problème..." rows="4" required className="border p-2 rounded"></textarea>
        
        <button type="submit" className="bg-black text-white p-3 rounded font-bold">
          Envoyer la demande
        </button>
      </form>
    </div>
  );
}