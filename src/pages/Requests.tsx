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
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();
  const [appId, setAppId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  // Monitora in tempo reale lo stato dell'anti-flood cooldown (24 ore, max 2 richieste)
  useEffect(() => {
    const checkCooldown = async () => {
      const lastRequest = localStorage.getItem('ares_last_request_time');
      
      // Recupera utente corrente
      const userStr = localStorage.getItem('ares_discord_user');
      const userId = userStr ? JSON.parse(userStr)?.id : null;

      if (userId) {
        // Controlla quante richieste ha fatto nelle ultime 24 ore
        const { data: requestsCount } = await supabase
          .from('game_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 86400000).toISOString());

        setRequestCount(requestsCount?.count || 0);
      }

      if (lastRequest) {
        const elapsed = Date.now() - parseInt(lastRequest, 10);
        const cooldownDuration = 86400000; // 24 ore in millisecondi
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

    // Otteniamo l'utente corrente
    const userStr = localStorage.getItem('ares_discord_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (!currentUser?.id) {
      setSubmitStatus('error');
      setErrorMessage('You must be logged in to submit requests');
      return;
    }

    // ULTERIORE CONTROLLO SERVER-SIDE PER RATE LIMIT (24 ore, max 2 richieste)
    try {
      const { data: canRequest, error: rpcError } = await supabase.rpc('check_request_rate_limit', {
        p_user_id: currentUser.id
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);
      }

      if (canRequest === false) {
        setSubmitStatus('error');
        setErrorMessage('You have reached the maximum of 2 requests per 24 hours. Please wait before submitting another.');
        return;
      }
    } catch (err) {
      console.error('Rate limit check failed:', err);
    }

    // Fallback: controllo client-side (24 ore)
    const lastRequest = localStorage.getItem('ares_last_request_time');
    if (lastRequest) {
      const elapsed = Date.now() - parseInt(lastRequest, 10);
      const cooldownDuration = 86400000; // 24 ore in millisecondi
      if (elapsed < cooldownDuration) {
        setSubmitStatus('error');
        const hoursLeft = Math.ceil((cooldownDuration - elapsed) / (1000 * 60 * 60));
        setErrorMessage(`You must wait ${hoursLeft} hours before submitting another request`);
        return;
      }
    }

    // Controlla numero massimo di richieste (max 2 nelle ultime 24h)
    if (requestCount >= 2) {
      setSubmitStatus('error');
      setErrorMessage('You have reached the maximum of 2 requests per 24 hours.');
      return;
    }

    if (!appId || !title) {
      setSubmitStatus('error');
      setErrorMessage(t('requests.errFillFields'));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('game_requests')
        .insert([
          {
            user_id: currentUser.id,
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
      
      // Aggiorna il contatore
      setRequestCount(prev => prev + 1);
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || t('requests.errGeneric'));
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
          {t('requests.title')}
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          {t('requests.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-2xl p-6 md:p-8 shadow-xl relative">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Send className="w-5 h-5 text-brand-azure" />
            {t('requests.formTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Steam AppID Input */}
            <div>
              <label htmlFor="appId" className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                <SteamIcon className="w-3.5 h-3.5" />
                {t('requests.appIdLabel')} <span className="text-brand-azure">*</span>
              </label>
              <input
                id="appId"
                type="text"
                placeholder={t('requests.appIdPlaceholder')}
                value={appId}
                onChange={handleAppIdInput}
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-azure transition-colors"
                required
                disabled={cooldownTimeLeft > 0}
              />
              <p className="text-[10px] text-gray-500 mt-1.5">
                {t('requests.appIdHelp')}
              </p>
              {appId && (
                <a
                  href={`https://store.steampowered.com/app/${appId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-azure mt-2 hover:underline"
                >
                  {t('requests.verifyOnSteam')} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Game Title Input */}
            <div>
              <label htmlFor="title" className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                {t('requests.titleLabel')} <span className="text-brand-azure">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder={t('requests.titlePlaceholder')}
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
                {t('requests.discordLabel')}
              </label>
              <input
                id="discordTag"
                type="text"
                placeholder={t('requests.discordPlaceholder')}
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-azure transition-colors"
                disabled={cooldownTimeLeft > 0}
              />
              <p className="text-[10px] text-gray-500 mt-1.5">
                {t('requests.discordHelp')}
              </p>
            </div>

            {/* Additional Preservation Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                {t('requests.notesLabel')}
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder={t('requests.notesPlaceholder')}
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
                  <h4 className="font-bold text-sm text-white">{t('requests.rateLimitTitle')}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('requests.rateLimitText', { seconds: cooldownTimeLeft })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Requests remaining today: <span className="text-white font-bold">{2 - requestCount}</span>/2
                  </p>
                </div>
              </div>
            )}

            {/* Avviso Max Requests Raggiunto */}
            {requestCount >= 2 && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl animate-fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Maximum Requests Reached</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    You have used your maximum allowance of 2 requests in the last 24 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting || cooldownTimeLeft > 0 || requestCount >= 2}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-azure hover:bg-brand-azure/80 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('requests.submitting')}
                </>
              ) : cooldownTimeLeft > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  {t('requests.waitCooldown', { seconds: cooldownTimeLeft })}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('requests.submit')}
                </>
              )}
            </button>

            {/* Inline Feedback States */}
            {submitStatus === 'success' && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">{t('requests.successTitle')}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('requests.successText')}
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="space-y-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{t('requests.errorTitle')}</h4>
                    <p className="text-xs text-gray-400 mt-1">{errorMessage}</p>
                  </div>
                </div>

                {/* Se l'errore è dovuto alla tabella mancante, mostra le istruzioni SQL */}
                {errorMessage.includes('does not exist') && (
                  <div className="mt-3 p-3 bg-brand-dark border border-brand-border rounded-lg">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      {t('requests.dbAdminTitle')}
                    </p>
                    <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                      {t('requests.dbAdminText')}
                    </p>
                    <pre className="text-[10px] bg-brand-card p-2 rounded text-gray-300 font-mono overflow-x-auto select-all">
{`CREATE TABLE game_requests (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id),
  steam_appid bigint not null,
  title text not null,
  notes text,
  discord_tag text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX idx_game_requests_user_id ON game_requests(user_id);
CREATE INDEX idx_game_requests_status ON game_requests(status);`}
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
              {t('requests.guidelinesTitle')}
            </h2>
            <ul className="space-y-3.5 text-xs text-gray-400 leading-relaxed list-disc list-inside">
              {(t('requests.guidelines') as { strong: string; text: string }[]).map((g, i) => (
                <li key={i}>
                  <strong className="text-white">{g.strong}</strong> {g.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-azure" />
              {t('requests.howToTitle')}
            </h2>
            <ol className="space-y-4 text-xs text-gray-400 leading-relaxed list-decimal list-inside">
              <li>
                {(t('requests.howToSteps') as string[])[0]}
              </li>
              <li>
                {(t('requests.howToSteps') as string[])[1]}
                <div className="bg-brand-dark p-2 rounded-lg text-[10px] font-mono text-gray-300 mt-2 break-all border border-brand-border select-all">
                  https://store.steampowered.com/app/<span className="text-brand-azure font-black">1245620</span>/Elden_Ring/
                </div>
              </li>
              <li>
                {(t('requests.howToSteps') as string[])[2].split('{code}')[0]}
                <code className="text-brand-azure font-mono">/app/</code>
                {(t('requests.howToSteps') as string[])[2].split('{code}')[1]}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;