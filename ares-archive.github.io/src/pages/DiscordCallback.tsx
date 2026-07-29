import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const DiscordCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code) {
        console.error("Nessun codice trovato nell'URL.");
        navigate('/');
        return;
      }

      try {
        // Configurato l'URL di produzione fisso su Cloudflare Pages (non scade mai!)
        const response = await fetch('https://ares-2mf.pages.dev/api/discord-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            // Forziamo l'indirizzo esatto registrato sul pannello sviluppatori di Discord
            redirect_uri: "https://ares-archive.github.io/discord-callback"
          })
        });

        if (response.ok) {
          const user = await response.json();
          // 1. Salviamo i dati
          localStorage.setItem('ares_discord_user', JSON.stringify(user));
          
          // 2. Inviamo un evento personalizzato per svegliare l'Header all'istante
          window.dispatchEvent(new Event('ares-discord-login'));
        } else {
          console.error("Errore durante l'autenticazione con il server.");
        }
      } catch (err) {
        console.error("Errore di rete:", err);
      }

      navigate('/');
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 text-brand-azure animate-spin mb-4" />
      <p className="text-gray-400">Authenticating with Discord...</p>
    </div>
  );
};

export default DiscordCallback;