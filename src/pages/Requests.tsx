import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; 
import { Link } from 'react-router-dom';
import { 
  Send, 
  HelpCircle, 
  Loader2, 
  Gamepad2, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Clock
} from 'lucide-react';

// Icona Steam ufficiale vettoriale
const SteamIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    {...props}
  >
    <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
    <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048" />
  </svg>
);

const Requests: React.FC = () => {
  const [appId, setAppId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

  // Monitora in tempo reale lo stato dell'anti-flood cooldown (1 minuto)
  useEffect(() => {
    const checkCooldown = () => {
      const lastRequest = localStorage.getItem('ares_last_request_time');
      if (lastRequest) {
        const elapsed = Date.now() - parseInt(lastRequest, 10);
        const cooldownDuration = 60000; // 1 minuto in millisecondi
        if (elapsed < cooldownDuration) {
          setCooldownTimeLeft(Math.ceil((cooldownDuration - elapsed) / 1000));
        } else {
          setCooldownTimeLeft(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rileva automaticamente l'AppID se l'utente incolla un URL completo di Steam
  const handleAppIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const steamUrlRegex = /store\.steampowered\.com\/app\/(\d+)/i;
    const match = rawVal.match(steamUrlRegex);

    if (match && match[1]) {
      setAppId(match[1]);
    } else {
      // Consente solo caratteri numerici se non è un link
      const digits = rawVal.replace(/\D/g, '');
      setAppId(digits);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ulteriore controllo di sicurezza anti-flood sul client
    const lastRequest = localStorage.getItem('ares_last_request_time');
    if (lastRequest) {
      const elapsed = Date.now() - parseInt(lastRequest, 10);
      if (elapsed < 60000) {
        setSubmitStatus('error');
        setErrorMessage(`Anti-spam cooling down. Please wait ${Math.ceil((60000 - elapsed) / 1000)} seconds.`);
        return;
      }
    }

    if (!appId || !title) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in both the Steam AppID and the Game Title.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('game_requests')
        .insert([
          {
            steam_appid: parseInt(appId, 10),
            title: title,
            notes: notes || null,
            discord_tag: discordTag || null,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        throw error;
      }

      setSubmitStatus('success');
      
      // Salva l'ora corrente come marcatore dell'ultimo invio riuscito per l'anti-flood
      localStorage.setItem('ares_last_request_time', Date.now().toString());

      // Pulisce i campi in caso di successo
      setAppId('');
      setTitle('');
      setNotes('');
      setDiscordTag('');
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || 'Failed to submit request. Please ensure the database schema is configured.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Page Header */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tight mb-3 flex items-center justify-center md:justify-start gap-3">
          <Gamepad2 className="w-10 h-10 text-brand-azure" />
          Game Preservation Queue
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Submit missing titles to our digital preservation database. Provide the correct Steam AppID to guarantee precise metadata archiving.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-2xl p-6 md:p-8 shadow-xl relative">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Send className="w-5 h-5 text-brand-azure" />
            Submit Preservation Request
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Steam AppID Input */}
            <div>
              <label htmlFor="appId" className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                <SteamIcon className="w-3.5 h-3.5" />
                Steam AppID or Store URL <span className="text-brand-azure">*</span>
              </label>
              <input
                id="appId"
                type="text"
                placeholder="Paste Steam game link or enter AppID (e.g. 1245620)"
                value={appId}
                onChange={handleAppIdInput}
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-azure transition-colors"
                required
                disabled={cooldownTimeLeft > 0}
              />
              <p className="text-[10px] text-gray-500 mt-1.5">
                We automatically parse full Steam links. If valid, the AppID is extracted instantly.
              </p>
              {appId && (
                <a
                  href={`https://store.steampowered.com/app/${appId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-azure mt-2 hover:underline"
                >
                  Verify AppID on Steam <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Game Title Input */}
            <div>
              <label htmlFor="title" className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                Game Title <span className="text-brand-azure">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter exact game title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-azure transition-colors"
                required
                disabled={cooldownTimeLeft > 0}
              />
            </div>

            {/* Optional Discord Tag */}
            <div>
              <label htmlFor="discordTag" className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                Discord Username (Optional)
              </label>
              <input
                id="discordTag"
                type="text"
                placeholder="e.g. username"
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-azure transition-colors"
                disabled={cooldownTimeLeft > 0}
              />
              <p className="text-[10px] text-gray-500 mt-1.5">
                We use this to credit your request or ping you on the ARES server once archived.
              </p>
            </div>

            {/* Additional Preservation Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                Preservation Notes / Context (Optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Detail why this game requires preservation (e.g. digital-only release, DRM concerns, delisting alert, DLCs details)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-azure transition-colors resize-none"
                disabled={cooldownTimeLeft > 0}
              />
            </div>

            {/* Avviso Cooldown Attivo */}
            {cooldownTimeLeft > 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl animate-fade-in">
                <Clock className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm text-white">Rate Limit Active</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    To prevent spam and server flooding, you must wait {cooldownTimeLeft} more seconds before submitting another request.
                  </p>
                </div>
              </div>
            )}

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting || cooldownTimeLeft > 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-azure hover:bg-brand-azure/80 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Request...
                </>
              ) : cooldownTimeLeft > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  Wait {cooldownTimeLeft}s (Cooldown Active)
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit to Preservation Queue
                </>
              )}
            </button>

            {/* Inline Feedback States */}
            {submitStatus === 'success' && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Request Submitted!</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Your request was added to the queue. Please wait at least 1 minute before submitting any further requests.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="space-y-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Submission Failed</h4>
                    <p className="text-xs text-gray-400 mt-1">{errorMessage}</p>
                  </div>
                </div>

                {/* Se l'errore è dovuto alla tabella mancante, mostra le istruzioni SQL */}
                {errorMessage.includes('does not exist') && (
                  <div className="mt-3 p-3 bg-brand-dark border border-brand-border rounded-lg">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Database Administrator Instructions:
                    </p>
                    <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                      Run this query in your Supabase SQL Editor to create the necessary table:
                    </p>
                    <pre className="text-[10px] bg-brand-card p-2 rounded text-gray-300 font-mono overflow-x-auto select-all">
{`CREATE TABLE game_requests (
  id bigint generated by default as identity primary key,
  steam_appid bigint not null,
  title text not null,
  notes text,
  discord_tag text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Guidelines Side panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-azure" />
              Preservation Guidelines
            </h2>
            <ul className="space-y-3.5 text-xs text-gray-400 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">Recent Releases Focus:</strong> ARES prioritizes archiving recent digital-only files and rare media.
              </li>
              <li>
                <strong className="text-white">Accurate Steam ID:</strong> Always fetch the ID from Steam to allow automated importing of 4K trailers, high-quality original screenshots, and direct database population.
              </li>
              <li>
                <strong className="text-white">Duplication Check:</strong> Please search our existing archive database before submitting a request.
              </li>
              <li>
                <strong className="text-white">No Copyright Concerns:</strong> This is a metadata preservation and archiving project dedicated to community access.
              </li>
            </ul>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-azure" />
              How to find a Steam AppID?
            </h2>
            <ol className="space-y-4 text-xs text-gray-400 leading-relaxed list-decimal list-inside">
              <li>
                Open the Steam Store in your browser and search for your chosen title.
              </li>
              <li>
                Look at the page URL. It follows this structure:
                <div className="bg-brand-dark p-2 rounded-lg text-[10px] font-mono text-gray-300 mt-2 break-all border border-brand-border select-all">
                  https://store.steampowered.com/app/<span className="text-brand-azure font-black">1245620</span>/Elden_Ring/
                </div>
              </li>
              <li>
                The numeric sequence directly following <code className="text-brand-azure font-mono">/app/</code> is your target AppID. Just copy the whole URL or the ID itself and paste it here!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;