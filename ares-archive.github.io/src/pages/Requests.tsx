import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; 
import { Link } from 'react-router-dom';
import { 
  Send, 
  HelpCircle, 
  Loader2, 
  ArchiveRestore, // Sostituito Gamepad2 con ArchiveRestore
  Info, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Clock,
  LogOut,
  User,
  ShieldCheck,
  XCircle,
  Shield,
  Layers
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// Lista dei contatti sviluppatore autorizzati (sia username di sistema che nomi visualizzati)
const DEVELOPERS_LIST = [
  "ildenteproibito",
  "shadow_eddyx",
  "shadoweddyx12",
  "🥏lukinok🥏",
  "lukinok"
];

// Helper per verificare se l'utente Discord è uno sviluppatore di ARES
const checkIsDeveloper = (username: string): boolean => {
  if (!username) return false;
  // Converte in minuscolo e rimuove tutti gli spazi interni per un confronto a prova d'errore
  // (es. "IL DENTE PROIBITO" diventa "ildenteproibito" e coincide al 100% con l'username di sistema)
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  
  return DEVELOPERS_LIST.some(dev => {
    const cleanDev = dev.trim().toLowerCase().replace(/\s+/g, '');
    return cleanUsername === cleanDev || cleanUsername.includes(cleanDev) || cleanDev.includes(cleanUsername);
  });
};

// Icona Steam ufficiale vettoriale
const SteamIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    {...props}
  >
    <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
    <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048" />
  </svg>
);

// Icona Discord SVG ufficiale per il pulsante di login
const DiscordIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 127.14 96.36" fill="currentColor" {...props}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83,96.67,96.67,0,0,0-22,.06A73.34,73.34,0,0,0,48.58,0,105.4,105.4,0,0,0,18.07,8.07C1.79,32.42-2.72,56.12,1.21,89.28a105.82,105.82,0,0,0,32,16.15,79,77,0,0,0,6.57-10.66,68.86,68.86,0,0,1-10-4.78c.85-.63,1.66-1.3,2.44-2a75.52,75.52,0,0,0,60.82,0c.79.7,1.6,1.37,2.44,2a67.37,67.37,0,0,1-10,4.77,75.36,75.36,0,0,0,6.58,10.67,105.13,105.13,0,0,0,32-16.15C130.66,50.55,125.71,27.14,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
  </svg>
);

const Requests: React.FC = () => {
  const { t, lang } = useLanguage();
  const [appId, setAppId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

  // Stati del Tracciamento Richieste ed Autenticazione Discord
  const [user, setUser] = useState<any>(null);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [loadingUserRequests, setLoadingUserRequests] = useState(false);

  // Stato per l'interruttore della coda globale (solo visibile agli Sviluppatori)
  const [showAllRequests, setShowAllRequests] = useState(true);

  // Gestione sessione utente e callback al caricamento con controllo del provider
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isDiscordProvider = session?.user?.app_metadata?.provider === 'discord';
      if (session?.user && isDiscordProvider) {
        setUser(session.user);
        fetchUserRequests(session.user, showAllRequests);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isDiscordProvider = session?.user?.app_metadata?.provider === 'discord';
      if (session?.user && isDiscordProvider) {
        setUser(session.user);
        fetchUserRequests(session.user, showAllRequests);
      } else {
        setUser(null);
        setUserRequests([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [showAllRequests]);

  // Monitora in tempo reale lo stato dell'anti-flood cooldown (24 ore)
  useEffect(() => {
    const checkCooldown = () => {
      const lastRequest = localStorage.getItem('ares_last_request_time');
      if (lastRequest) {
        const elapsed = Date.now() - parseInt(lastRequest, 10);
        const cooldownDuration = 86400000; // 24 ore
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

  // Estrae in modo sicuro il tag o l'username dal metadata di Discord
  const getDiscordUsername = (userObj: any): string => {
    if (!userObj) return '';
    const metadata = userObj.user_metadata;
    return metadata.preferred_username || metadata.full_name || metadata.name || '';
  };

  // Compila e blocca automaticamente il tag Discord se l'utente è loggato con Discord
  useEffect(() => {
    if (user) {
      setDiscordTag(getDiscordUsername(user));
    } else {
      setDiscordTag('');
    }
  }, [user]);

  // Recupera le richieste. Se l'utente è Sviluppatore, può scegliere di caricarle tutte
  const fetchUserRequests = async (currentUser: any, allReqs: boolean) => {
    if (!currentUser) return;
    setLoadingUserRequests(true);
    const tag = getDiscordUsername(currentUser);
    const isDev = checkIsDeveloper(tag);
    
    if (tag) {
      let query = supabase.from('game_requests').select('*');
      
      // Se NON è sviluppatore, o se lo sviluppatore decide di vedere solo le sue
      if (!isDev || !allReqs) {
        query = query.ilike('discord_tag', `%${tag}%`);
      }

      const { data, error } = await query.order('id', { ascending: false });

      if (!error && data) {
        setUserRequests(data);
      }
    }
    setLoadingUserRequests(false);
  };

  // Handler per autenticazione OAuth tramite Discord su Supabase
  const handleDiscordLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin + '/requests', // ritorna direttamente su questa pagina
      }
    });
    if (error) {
      alert("Errore connessione Discord: " + error.message);
    }
  };

  // Log-out dell'account
  const handleDiscordLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRequests([]);
  };

  // Rileva automaticamente l'AppID se l'utente incolla un URL completo di Steam
  const handleAppIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const steamUrlRegex = /store\.steampowered\.com\/app\/(\d+)/i;
    const match = rawVal.match(steamUrlRegex);

    if (match && match[1]) {
      setAppId(match[1]);
    } else {
      const digits = rawVal.replace(/\D/g, '');
      setAppId(digits);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUserDeveloper = checkIsDeveloper(discordTag);

    // I DEVs saltano il controllo del cooldown
    if (!isUserDeveloper) {
      const lastRequest = localStorage.getItem('ares_last_request_time');
      if (lastRequest) {
        const elapsed = Date.now() - parseInt(lastRequest, 10);
        const cooldownDuration = 86400000; 
        if (elapsed < cooldownDuration) {
          setSubmitStatus('error');
          const hoursLeft = Math.ceil((cooldownDuration - elapsed) / (1000 * 60 * 60));
          setErrorMessage(`You must wait ${hoursLeft} hours before submitting another request`);
          return;
        }
      }
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
      localStorage.setItem('ares_last_request_time', Date.now().toString());

      setAppId('');
      setTitle('');
      setNotes('');
      
      if (user) {
        fetchUserRequests(user, showAllRequests);
      }
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || t('requests.errGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Traduzioni locali per il modulo di tracciamento e della dashboard sviluppatori
  const textTrackTitle = lang === 'it' ? 'Traccia le Tue Richieste' : 'Track Your Requests';
  const textTrackDesc = lang === 'it' ? 'Collega il tuo account Discord per verificare lo stato di approvazione delle tue richieste in tempo reale.' : 'Connect your Discord account to view the real-time status of your requests.';
  const textLoginBtn = lang === 'it' ? 'Accedi con Discord' : 'Login with Discord';
  const textLogoutBtn = lang === 'it' ? 'Disconnetti' : 'Disconnect';
  const textLoadingReqs = lang === 'it' ? 'Recupero richieste...' : 'Retrieving requests...';
  const textNoReqs = lang === 'it' ? 'Nessuna richiesta di preservazione trovata a tuo nome.' : 'No preservation requests found for your Discord username.';

  // Variabili Sviluppatore
  const userDiscordTag = user ? getDiscordUsername(user) : '';
  const isCurrentUserDeveloper = checkIsDeveloper(userDiscordTag);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Page Header */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tight mb-3 flex items-center justify-center md:justify-start gap-3">
          <ArchiveRestore className="w-10 h-10 text-brand-azure" /> {/* Sostituito Gamepad2 con ArchiveRestore */}
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
                disabled={cooldownTimeLeft > 0 && !isCurrentUserDeveloper}
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
                disabled={cooldownTimeLeft > 0 && !isCurrentUserDeveloper}
              />
            </div>

            {/* Discord Tag Input */}
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
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-azure transition-colors disabled:opacity-50"
                disabled={(cooldownTimeLeft > 0 && !isCurrentUserDeveloper) || !!user} 
              />
              <p className="text-[10px] text-gray-500 mt-1.5">
                {user ? (
                  <span className="text-brand-azure font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Collegato con successo al tuo profilo Discord attivo.
                  </span>
                ) : (
                  t('requests.discordHelp')
                )}
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
                disabled={cooldownTimeLeft > 0 && !isCurrentUserDeveloper}
              />
            </div>

            {/* Avviso Cooldown Attivo */}
            {cooldownTimeLeft > 0 && !isCurrentUserDeveloper && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl animate-fade-in">
                <Clock className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm text-white">{t('requests.rateLimitTitle')}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('requests.rateLimitText', { seconds: cooldownTimeLeft })}
                  </p>
                </div>
              </div>
            )}

            {/* Avviso Developer Privilegi Attivi */}
            {isCurrentUserDeveloper && (
              <div className="flex items-start gap-3 p-4 bg-brand-azure/10 border border-brand-azure/20 text-brand-azure rounded-xl animate-fade-in">
                <Shield className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm text-white">Developer Mode Bypass</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Sei loggato come Sviluppatore. Il limite di flood di 24 ore è disabilitato sul tuo account.
                  </p>
                </div>
              </div>
            )}

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting || (cooldownTimeLeft > 0 && !isCurrentUserDeveloper)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-azure hover:bg-brand-azure/80 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('requests.submitting')}
                </>
              ) : (cooldownTimeLeft > 0 && !isCurrentUserDeveloper) ? (
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

        {/* Guidelines & Live Status Tracking Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SEZIONE 1: TRACCIAMENTO LIVE RICHIESTE DISCORD */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Sfumatura soffusa neon blu stile Discord */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-[#5865F2] rounded-full blur-[40px] opacity-10 pointer-events-none" />

            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-azure" />
              {textTrackTitle}
            </h2>

            {!user ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  {textTrackDesc}
                </p>
                <button
                  type="button"
                  onClick={handleDiscordLogin}
                  className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#5865F2]/20 transform hover:-translate-y-0.5"
                >
                  <DiscordIcon className="w-4 h-4 text-white" />
                  {textLoginBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Dettagli Profilo Discord Collegato */}
                <div className="flex flex-col gap-3 p-3.5 bg-brand-dark/60 border border-brand-border rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.user_metadata?.avatar_url ? (
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="" 
                          className="w-9 h-9 rounded-full border border-brand-border shadow-inner"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-azure/10 flex items-center justify-center font-bold text-brand-azure text-xs">
                          {getDiscordUsername(user).substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white leading-tight flex items-center gap-1.5 flex-wrap">
                          @{getDiscordUsername(user)}
                          {isCurrentUserDeveloper && (
                            <span className="text-[8px] bg-brand-azure/20 text-brand-azure border border-brand-azure/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-0.5">
                              <Shield className="w-2 h-2" />
                              Dev
                            </span>
                          )}
                        </p>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Connected</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDiscordLogout}
                      className="text-[10px] font-black uppercase text-brand-red hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      {textLogoutBtn}
                    </button>
                  </div>

                  {/* Interruttore Monitoraggio Globale (Solo per Sviluppatori) */}
                  {isCurrentUserDeveloper && (
                    <div className="border-t border-brand-border/40 pt-2.5 flex items-center justify-between gap-4">
                      <span className="text-[9px] text-gray-500 uppercase font-mono font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3 text-brand-azure" />
                        Developer Monitor Queue
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAllRequests(prev => !prev)}
                        className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider border transition-all ${
                          showAllRequests 
                            ? 'bg-brand-azure/20 text-brand-azure border-brand-azure/30' 
                            : 'bg-brand-dark text-gray-500 border-brand-border'
                        }`}
                      >
                        {showAllRequests ? 'All Requests' : 'My Reqs Only'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Lista scorrevole delle richieste */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {loadingUserRequests ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <Loader2 className="w-4 h-4 text-brand-azure animate-spin" />
                      <span className="text-xs text-gray-500">{textLoadingReqs}</span>
                    </div>
                  ) : userRequests.length === 0 ? (
                    <div className="text-center py-8 bg-brand-dark/20 border border-dashed border-brand-border/40 rounded-xl">
                      <p className="text-[11px] text-gray-500 italic px-4">
                        {textNoReqs}
                      </p>
                    </div>
                  ) : (
                    userRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className={`p-3.5 bg-brand-dark/40 border rounded-xl text-xs flex flex-col gap-2 transition-all hover:bg-brand-dark/60 ${
                          req.status === 'completed' ? 'border-emerald-500/20 bg-emerald-950/5 text-emerald-400' :
                          req.status === 'rejected' ? 'border-red-500/10 bg-red-950/5 text-red-400' :
                          'border-brand-border/60 text-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-1 truncate">
                            <span className="font-bold text-white truncate max-w-[150px]">{req.title}</span>
                            {/* Se lo sviluppatore sta vedendo la coda globale, mostra il mittente di ogni richiesta */}
                            {isCurrentUserDeveloper && showAllRequests && (
                              <span className="text-[9px] text-brand-azure font-medium">
                                By: @{req.discord_tag || 'Guest'}
                              </span>
                            )}
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                            req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {req.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                            {req.status === 'completed' && <CheckCircle className="w-2.5 h-2.5" />}
                            {req.status === 'rejected' && <XCircle className="w-2.5 h-2.5" />}
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-brand-border/20 pt-2 font-mono">
                          <span>AppID: {req.steam_appid}</span>
                          <span>{new Date(req.created_at).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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