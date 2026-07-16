import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Video, 
  Image as ImageIcon, 
  X, 
  Pencil, 
  Save, 
  Upload, 
  Sparkles, 
  LogOut,
  Megaphone,
  Gamepad2,
  ExternalLink,
  Shield,
  Clock,
  Check,
  XCircle
} from 'lucide-react';
import { supabase } from '../supabase'; 
import { Game } from '../types/game';
import { Session } from '@supabase/supabase-js';

const emptyGame: Partial<Game> = {
  title: '',
  description: '',
  developer: '',
  buzzheavierLink: '', 
  bannerImage: '',
  steamScreenshots: [],
  videoUrl: '',
  releaseDate: '', 
  isUpcoming: false, 
  steamUrl: '',
  gogUrl: '',
  epicUrl: '',
  goldbergUrl: '', 
  minimumRequirements: '', 
  recommendedRequirements: '', 
  crackedBy: '', 
  tags: [],
  genres: [],
  platforms: ['windows']
};

const AVAILABLE_GENRES = [
  "Action", "Adventure", "RPG", "Strategy", "Shooter", "Simulation",
  "Survival", "Horror", "Platformer", "Racing", "Sports", "Fighting",
  "Indie", "Puzzle", "Preservation", "Emulator", "Crack/Bypass"
];

// Mappa dei colori per gli avvisi/annunci
const PRESET_COLORS = [
  { id: 'red', name: 'Rosso (Errore/Critico)', textClass: 'text-red-500', borderClass: 'border-red-500/30', bgClass: 'bg-red-500/10' },
  { id: 'amber', name: 'Arancione (Attenzione)', textClass: 'text-amber-500', borderClass: 'border-amber-500/30', bgClass: 'bg-amber-500/10' },
  { id: 'azure', name: 'Azzurro (Info)', textClass: 'text-brand-azure', borderClass: 'border-brand-azure/30', bgClass: 'bg-brand-azure/10' },
  { id: 'emerald', name: 'Verde (Successo)', textClass: 'text-emerald-500', borderClass: 'border-emerald-500/30', bgClass: 'bg-emerald-500/10' }
];

interface Announcement {
  id: string;
  message: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

interface GameRequest {
  id: string;
  steam_appid: number;
  title: string;
  notes: string | null;
  discord_tag: string | null;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  // Stati di navigazione e sessione
  const [activeTab, setActiveTab] = useState<'games' | 'announcements' | 'requests'>('games');
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Stati della gestione GIOCHI
  const [games, setGames] = useState<Game[]>([]);
  const [screenshotInput, setScreenshotInput] = useState('');
  const [activeGame, setActiveGame] = useState<Partial<Game>>(emptyGame);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fetchingRawg, setFetchingRawg] = useState(false);

  // Stati della gestione ANNUNCI
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementColor, setAnnouncementColor] = useState('red');
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // Stati della gestione RICHIESTE
  const [requests, setRequests] = useState<GameRequest[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchAllData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          resetForm();
          setAnnouncements([]);
          setRequests([]);
        } else {
          fetchAllData();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Ricarica tutti i dati in background
  const fetchAllData = () => {
    fetchGames();
    fetchAnnouncements();
    fetchRequests();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert('Credenziali non valide: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- LOGICA GIOCHI ---
  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Errore nel caricamento dei giochi:", error);
    } else if (data) {
      const mappedGames: Game[] = data.map(dbGame => ({
        id: dbGame.id.toString(),
        title: dbGame.title || '',
        description: dbGame.description || '',
        developer: dbGame.developer || '',
        buzzheavierLink: dbGame.pearcrypt_url || '', 
        bannerImage: dbGame.banner_url || '',
        videoUrl: dbGame.video_url || '',
        steamScreenshots: dbGame.screenshots || [],
        releaseDate: dbGame.release_date || '',
        isUpcoming: dbGame.is_upcoming || false, 
        steamUrl: dbGame.steam_url || '',
        gogUrl: dbGame.gog_url || '',
        epicUrl: dbGame.epic_url || '',
        goldbergUrl: dbGame.goldberg_url || '', 
        minimumRequirements: dbGame.minimum_requirements || '', 
        recommendedRequirements: dbGame.recommended_requirements || '', 
        crackedBy: dbGame.cracked_by || '', 
        tags: ['New'],
        genres: dbGame.genre ? [dbGame.genre] : [], 
        platforms: ['windows'],
      }));
      setGames(mappedGames);
    }
  };

  const handleFetchRawgData = async () => {
    const query = activeGame.title?.trim();
    if (!query) {
      alert("Scrivi prima il titolo del gioco nel campo 'Game Title' per cercarlo su RAWG!");
      return;
    }

    setFetchingRawg(true);
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY || '';
      const searchRes = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=1`);
      const searchData = await searchRes.json() as any;

      if (!searchData.results || searchData.results.length === 0) {
        alert("Nessun gioco trovato su RAWG con questo titolo.");
        setFetchingRawg(false);
        return;
      }

      const foundGame = searchData.results[0];
      const gameId = foundGame.id;

      const detailRes = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`);
      const detailData = await detailRes.json() as any;

      const developerNames = detailData.developers 
        ? detailData.developers.map((d: any) => d.name).join(', ') 
        : '';

      const screenshotsUrls = foundGame.short_screenshots
        ? foundGame.short_screenshots.map((s: any) => s.image).filter((img: string) => !img.includes('placeholder'))
        : [];

      let steamLink = '';
      let gogLink = '';
      let epicLink = '';

      if (detailData.stores && Array.isArray(detailData.stores)) {
        detailData.stores.forEach((s: any) => {
          const slug = s.store?.slug;
          if (slug === 'steam') steamLink = s.url || '';
          if (slug === 'gog') gogLink = s.url || '';
          if (slug === 'epic-games') epicLink = s.url || '';
        });
      }

      let autoGenres: string[] = [];
      let steamMinReqs = '';
      let steamRecReqs = '';

      if (steamLink) {
        const match = steamLink.match(/\/app\/(\d+)/);
        if (match && match[1]) {
          const steamId = match[1];
          try {
            const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamId}&l=italian`);
            if (response.ok) {
              const steamData = await response.json() as any;
              if (steamData[steamId] && steamData[steamId].success) {
                const sInfo = steamData[steamId].data;
                
                if (sInfo.genres) {
                  const steamGenres = sInfo.genres as { id: string; description: string }[];
                  for (const g of steamGenres) {
                    const desc = g.description.toLowerCase();
                    if (desc.includes('horror')) autoGenres = ['Horror'];
                    else if (desc.includes('survival') || desc.includes('sopravvivenza')) autoGenres = ['Survival'];
                    else if (desc.includes('rpg') || desc.includes('ruolo') || desc.includes('role')) autoGenres = ['RPG'];
                    else if (desc.includes('strateg') || desc.includes('strategy')) autoGenres = ['Strategy'];
                    else if (desc.includes('corsa') || desc.includes('racing') || desc.includes('automobilismo')) autoGenres = ['Racing'];
                    else if (desc.includes('sport')) autoGenres = ['Sports'];
                    else if (desc.includes('combattimento') || desc.includes('fighting')) autoGenres = ['Fighting'];
                    else if (desc.includes('simulaz') || desc.includes('simulation')) autoGenres = ['Simulation'];
                    else if (desc.includes('rompicapo') || desc.includes('puzzle')) autoGenres = ['Puzzle'];
                    else if (desc.includes('platform') || desc.includes('piattaforme')) autoGenres = ['Platformer'];
                    else if (desc.includes('azion') || desc.includes('action') || desc.includes('sparatutto') || desc.includes('shooter')) autoGenres = ['Action'];
                    else if (desc.includes('avventur') || desc.includes('adventure')) autoGenres = ['Adventure'];
                  }
                  if (autoGenres.length === 0 && steamGenres.some(g => g.description.toLowerCase().includes('indie'))) {
                    autoGenres = ['Indie'];
                  }
                }

                if (sInfo.pc_requirements) {
                  steamMinReqs = sInfo.pc_requirements.minimum || '';
                  steamRecReqs = sInfo.pc_requirements.recommended || '';
                }
              }
            }
          } catch (err) {
            console.error("Errore nel recupero specifico da Steam API:", err);
          }
        }
      }

      if (autoGenres.length === 0 && foundGame.genres && foundGame.genres.length > 0) {
        const rawgGenre = foundGame.genres[0].name.toLowerCase();
        if (rawgGenre.includes('action')) autoGenres = ['Action'];
        else if (rawgGenre.includes('adventure')) autoGenres = ['Adventure'];
        else if (rawgGenre.includes('rpg')) autoGenres = ['RPG'];
        else if (rawgGenre.includes('strategy')) autoGenres = ['Strategy'];
        else if (rawgGenre.includes('shooter')) autoGenres = ['Action'];
        else if (rawgGenre.includes('puzzle')) autoGenres = ['Puzzle'];
        else if (rawgGenre.includes('racing')) autoGenres = ['Racing'];
        else if (rawgGenre.includes('sports')) autoGenres = ['Sports'];
        else if (rawgGenre.includes('platformer')) autoGenres = ['Platformer'];
        else if (rawgGenre.includes('simulation')) autoGenres = ['Simulation'];
        else if (rawgGenre.includes('fighting')) autoGenres = ['Fighting'];
        else if (rawgGenre.includes('indie')) autoGenres = ['Indie'];
      }

      setActiveGame(prev => ({
        ...prev,
        title: foundGame.name || prev.title,
        description: detailData.description_raw || detailData.description?.replace(/<[^>]*>/g, '') || prev.description,
        developer: developerNames || prev.developer,
        releaseDate: foundGame.released || prev.releaseDate,
        bannerImage: foundGame.background_image || prev.bannerImage,
        steamScreenshots: screenshotsUrls.length > 0 ? screenshotsUrls : prev.steamScreenshots,
        steamUrl: steamLink,
        gogUrl: gogLink,
        epicUrl: epicLink,
        genres: autoGenres.length > 0 ? autoGenres : prev.genres,
        minimumRequirements: steamMinReqs || prev.minimumRequirements,
        recommendedRequirements: steamRecReqs || prev.recommendedRequirements
      }));

      let autoFillMessage = `Dati per "${foundGame.name}" caricati con successo!`;
      if (steamMinReqs || steamRecReqs) {
        autoFillMessage += ` Rilevati anche i requisiti di sistema.`;
      }
      alert(autoFillMessage);

    } catch (err) {
      console.error("Errore RAWG/Steam Sync:", err);
      alert("Errore durante il caricamento automatico.");
    } finally {
      setFetchingRawg(false);
    }
  };

  const resetForm = () => {
    setActiveGame(emptyGame);
    setEditingId(null);
    setScreenshotInput('');
  };

  const handleEditGame = (game: Game) => {
    setEditingId(game.id);
    setActiveGame({
      title: game.title,
      description: game.description,
      developer: game.developer,
      buzzheavierLink: game.buzzheavierLink,
      bannerImage: game.bannerImage,
      videoUrl: game.videoUrl,
      steamScreenshots: [...(game.steamScreenshots || [])],
      releaseDate: game.releaseDate,
      isUpcoming: game.isUpcoming,
      steamUrl: game.steamUrl,
      gogUrl: game.gogUrl,
      epicUrl: game.epicUrl,
      goldbergUrl: game.goldbergUrl || '', 
      minimumRequirements: game.minimumRequirements || '', 
      recommendedRequirements: game.recommendedRequirements || '', 
      crackedBy: game.crackedBy || '', 
      tags: [...(game.tags || [])],
      genres: [...(game.genres || [])],
      platforms: [...(game.platforms || [])]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const singleGenreString = activeGame.genres && activeGame.genres.length > 0 
      ? activeGame.genres[0] 
      : null;

    const payload = {
      title: activeGame.title?.trim() || 'Untitled Game',
      description: activeGame.description || '',
      developer: activeGame.developer || null,
      pearcrypt_url: activeGame.buzzheavierLink || '', 
      banner_url: activeGame.bannerImage || '',
      video_url: activeGame.videoUrl || null,
      screenshots: activeGame.steamScreenshots || [],
      release_date: activeGame.releaseDate && activeGame.releaseDate.trim() !== '' ? activeGame.releaseDate : null,
      is_upcoming: !!activeGame.isUpcoming,
      steam_url: activeGame.steamUrl || null,
      gog_url: activeGame.gogUrl || null,
      epic_url: activeGame.epicUrl || null,
      goldberg_url: activeGame.goldbergUrl || null,
      minimum_requirements: activeGame.minimumRequirements || null, 
      recommended_requirements: activeGame.recommendedRequirements || null, 
      cracked_by: activeGame.crackedBy || null, 
      genre: singleGenreString 
    };

    if (editingId) {
      const { error } = await supabase
        .from('games')
        .update(payload)
        .eq('id', editingId);
        
      if (error) {
        alert(`Errore modifica: ${error.message}`);
      } else {
        alert("Modifica salvata con successo!");
        fetchGames();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('games')
        .insert([payload]);

      if (error) {
        alert(`Errore salvataggio: ${error.message}`);
      } else {
        alert("Gioco aggiunto con successo!");
        fetchGames();
        resetForm();
      }
    }
  };

  const handleDeleteGame = async (id: string) => {
    const conferma = window.confirm("Sei sicuro di voler cancellare questo gioco?");
    if (!conferma) return;

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Errore durante l'eliminazione!");
    } else {
      fetchGames();
      if (editingId === id) resetForm();
    }
  };

  const addScreenshot = () => {
    if (screenshotInput) {
      setActiveGame({
        ...activeGame,
        steamScreenshots: [...(activeGame.steamScreenshots || []), screenshotInput]
      });
      setScreenshotInput('');
    }
  };

  const addUploadedScreenshots = async (files: FileList | null) => {
    if (!files?.length) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const dataUrls = await Promise.all(
      imageFiles.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }))
    );
    setActiveGame({
      ...activeGame,
      steamScreenshots: [...(activeGame.steamScreenshots || []), ...dataUrls]
    });
  };

  const removeScreenshot = (index: number) => {
    const filtered = (activeGame.steamScreenshots || []).filter((_, i) => i !== index);
    setActiveGame({ ...activeGame, steamScreenshots: filtered });
  };

  const getFormattedAdminDate = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === '') return 'TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'TBA';
      return d.toLocaleDateString('it-IT');
    } catch {
      return 'TBA';
    }
  };


  // --- LOGICA ANNUNCI ---
  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Errore recupero annunci:", error);
    } else if (data) {
      setAnnouncements(data);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;

    const payload = {
      message: announcementMsg.trim(),
      color: announcementColor,
      is_active: true
    };

    if (editingAnnId) {
      const { error } = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', editingAnnId);

      if (error) {
        alert("Errore aggiornamento annuncio: " + error.message);
      } else {
        alert("Annuncio aggiornato!");
        setEditingAnnId(null);
        setAnnouncementMsg('');
        fetchAnnouncements();
      }
    } else {
      const { error } = await supabase
        .from('announcements')
        .insert([payload]);

      if (error) {
        alert("Errore salvataggio annuncio: " + error.message);
      } else {
        alert("Nuovo annuncio aggiunto!");
        setAnnouncementMsg('');
        fetchAnnouncements();
      }
    }
  };

  const handleToggleAnnActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert("Impossibile aggiornare lo stato dell'annuncio");
    } else {
      fetchAnnouncements();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const conferma = window.confirm("Cancellare questo annuncio definitivamente?");
    if (!conferma) return;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Errore nell'eliminazione dell'annuncio");
    } else {
      fetchAnnouncements();
      if (editingAnnId === id) {
        setEditingAnnId(null);
        setAnnouncementMsg('');
      }
    }
  };


  // --- LOGICA RICHIESTE ---
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('game_requests')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Errore recupero richieste:", error);
    } else if (data) {
      setRequests(data);
    }
  };

  const handleUpdateRequestStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('game_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert("Errore durante l'aggiornamento della richiesta");
    } else {
      fetchRequests();
    }
  };

  const handleDeleteRequest = async (id: string) => {
    const conferma = window.confirm("Sei sicuro di voler eliminare questa richiesta?");
    if (!conferma) return;

    const { error } = await supabase
      .from('game_requests')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Errore durante l'eliminazione");
    } else {
      fetchRequests();
    }
  };

  // Importa i dettagli della richiesta dell'utente nel form dei Giochi
  const handleImportRequest = (req: GameRequest) => {
    setActiveGame({
      ...emptyGame,
      title: req.title,
      steamUrl: `https://store.steampowered.com/app/${req.steam_appid}`
    });
    setEditingId(null); // Assicuriamoci che stiamo inserendo un nuovo gioco
    setActiveTab('games'); // Sposta la scheda sul DB giochi
    
    // Mostriamo un feedback immediato
    alert(`Dati importati per "${req.title}". Clicca sul pulsante "Autofill" nel form dei giochi per caricare screenshot e dettagli da Steam!`);
  };


  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-brand-card p-8 rounded-3xl border border-brand-border w-full max-w-md">
          <div className="flex justify-center mb-6">
            <ShieldAlert className="w-12 h-12 text-brand-red" />
          </div>
          <h2 className="text-2xl font-black text-white text-center mb-8 uppercase">ARES Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Admin Email"
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-red outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-red outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="submit"
              className="w-full py-3 bg-brand-red text-white font-bold rounded-xl uppercase tracking-widest"
            >
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Pannello Admin */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">Database Management</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">ARES Terminal System v2.0</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-xs font-bold rounded-lg transition-all uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* SELETTORE DELLE SCHEDE (TABS) */}
      <div className="flex flex-wrap gap-2 border-b border-brand-border/60 pb-6 mb-12">
        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === 'games' 
              ? 'bg-brand-azure text-white shadow-lg' 
              : 'bg-brand-card hover:bg-brand-card/80 text-gray-400 hover:text-white border border-brand-border'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          Games & Hypervisor
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === 'announcements' 
              ? 'bg-brand-azure text-white shadow-lg' 
              : 'bg-brand-card hover:bg-brand-card/80 text-gray-400 hover:text-white border border-brand-border'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements ({announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === 'requests' 
              ? 'bg-brand-azure text-white shadow-lg' 
              : 'bg-brand-card hover:bg-brand-card/80 text-gray-400 hover:text-white border border-brand-border'
          }`}
        >
          <Clock className="w-4 h-4" />
          User Requests ({requests.filter(r => r.status === 'pending').length} pending)
        </button>
      </div>

      {/* --- SCHEDA 1: GIOCHI --- */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Form Inserimento / Modifica Gioco */}
          <div className="xl:col-span-5">
            <div className="bg-brand-card p-8 rounded-3xl border border-brand-border sticky top-28">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-brand-azure" />
                  {editingId ? 'Edit Record' : 'Add New Record'}
                </h3>
                {editingId && (
                  <button type="button" onClick={resetForm} className="text-xs font-black text-gray-500 hover:text-brand-red uppercase">
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveGame} className="space-y-4">
                
                <div className="flex gap-2">
                  <input 
                    placeholder="Game Title"
                    className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                    value={activeGame.title || ''}
                    onChange={e => setActiveGame({...activeGame, title: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleFetchRawgData}
                    disabled={fetchingRawg}
                    className="px-4 bg-brand-azure hover:brightness-110 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    title="Scarica dati, immagini e genere automaticamente da RAWG e Steam"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {fetchingRawg ? 'Fetching...' : 'Autofill'}
                  </button>
                </div>

                {/* Selettore Genere */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    Selected Genre
                  </label>
                  <select
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure cursor-pointer"
                    value={activeGame.genres && activeGame.genres.length > 0 ? activeGame.genres[0] : ''}
                    onChange={e => setActiveGame({...activeGame, genres: e.target.value ? [e.target.value] : []})}
                  >
                    <option value="">No Genre Selected (All)</option>
                    {AVAILABLE_GENRES.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <textarea 
                  placeholder="Description"
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm h-32"
                  value={activeGame.description || ''}
                  onChange={e => setActiveGame({...activeGame, description: e.target.value})}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder="Developer name"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                    value={activeGame.developer || ''}
                    onChange={e => setActiveGame({...activeGame, developer: e.target.value})}
                  />
                  
                  {/* Tag Cracked By / Scene Group */}
                  <div className="relative group">
                    <input
                      placeholder="Cracked By (e.g. DenuvOwO)"
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure pr-16"
                      value={activeGame.crackedBy || ''}
                      onChange={e => setActiveGame({...activeGame, crackedBy: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveGame({...activeGame, crackedBy: 'DenuvOwO'})}
                      className="absolute right-2 top-1.5 px-2 py-1.5 bg-brand-card hover:bg-brand-azure/20 text-brand-azure text-[8px] font-black rounded-lg border border-brand-border transition-all uppercase"
                      title="Imposta come rilascio DenuvOwO (Hypervisor)"
                    >
                      🛡️ H-Vis
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pl-1 py-1">
                  <input 
                    type="checkbox"
                    id="is_upcoming_checkbox"
                    className="w-4 h-4 rounded border-brand-border bg-brand-dark text-brand-azure focus:ring-brand-azure cursor-pointer"
                    checked={activeGame.isUpcoming || false}
                    onChange={e => setActiveGame({...activeGame, isUpcoming: e.target.checked})}
                  />
                  <label htmlFor="is_upcoming_checkbox" className="text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer select-none">
                    Mark as Upcoming Game (In Arrivo)
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    Release Date
                  </label>
                  <input 
                    type="date"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                    value={activeGame.releaseDate || ''}
                    onChange={e => setActiveGame({...activeGame, releaseDate: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    Game Link (FileDitch)
                  </label>
                  <div className="flex gap-2">
                    <input
                      placeholder="FileDitch Link (URL)"
                      className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                      value={activeGame.buzzheavierLink || ''}
                      onChange={e => setActiveGame({...activeGame, buzzheavierLink: e.target.value})}
                      required={!activeGame.isUpcoming}
                    />
                    <a
                      href="https://new.fileditch.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </a>
                  </div>
                </div>

                {/* STORE & PRESERVATION LINKS */}
                <div className="space-y-2 pt-2 border-t border-brand-border/40">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">Store & Emulator Links (Optional)</span>
                  <input 
                    placeholder="Steam Store URL"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                    value={activeGame.steamUrl || ''}
                    onChange={e => setActiveGame({...activeGame, steamUrl: e.target.value})}
                  />
                  <input 
                    placeholder="Goldberg Emulator URL (Leave empty for default)"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                    value={activeGame.goldbergUrl || ''}
                    onChange={e => setActiveGame({...activeGame, goldbergUrl: e.target.value})}
                  />
                  <input 
                    placeholder="GOG Store URL"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                    value={activeGame.gogUrl || ''}
                    onChange={e => setActiveGame({...activeGame, gogUrl: e.target.value})}
                  />
                  <input 
                    placeholder="Epic Games Store URL"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                    value={activeGame.epicUrl || ''}
                    onChange={e => setActiveGame({...activeGame, epicUrl: e.target.value})}
                  />
                </div>

                {/* REQUISITI DI SISTEMA */}
                <div className="space-y-2 pt-2 border-t border-brand-border/40">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">System Requirements (Optional)</span>
                  <textarea 
                    placeholder="Minimum Requirements (HTML from Steam or Plain Text)"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm h-24 resize-none"
                    value={activeGame.minimumRequirements || ''}
                    onChange={e => setActiveGame({...activeGame, minimumRequirements: e.target.value})}
                  />
                  <textarea 
                    placeholder="Recommended Requirements (HTML from Steam or Plain Text)"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm h-24 resize-none"
                    value={activeGame.recommendedRequirements || ''}
                    onChange={e => setActiveGame({...activeGame, recommendedRequirements: e.target.value})}
                  />
                </div>

                <div className="flex gap-2">
                  <input 
                    placeholder="Banner Image URL"
                    className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                    value={activeGame.bannerImage || ''}
                    onChange={e => setActiveGame({...activeGame, bannerImage: e.target.value})}
                  />
                  <div className="w-12 h-12 bg-brand-dark border border-brand-border rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input 
                    placeholder="Video URL (.mp4)"
                    className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                    value={activeGame.videoUrl || ''}
                    onChange={e => setActiveGame({...activeGame, videoUrl: e.target.value})}
                  />
                  <div className="w-12 h-12 bg-brand-dark border border-brand-border rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      placeholder="Screenshot URL"
                      className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                      value={screenshotInput}
                      onChange={e => setScreenshotInput(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={addScreenshot}
                      className="px-4 bg-brand-azure text-white rounded-xl font-bold hover:brightness-110"
                    >
                      ADD
                    </button>
                  </div>
                  <label className="flex items-center justify-center gap-2 border border-dashed border-brand-border rounded-xl px-4 py-3 text-sm font-bold text-gray-400 hover:border-brand-azure hover:text-brand-azure cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload screenshots
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        void addUploadedScreenshots(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(activeGame.steamScreenshots || []).map((ss, i) => (
                      <div key={i} className="relative group">
                        <img src={ss} className="w-16 h-10 object-cover rounded border border-brand-border" alt="" />
                        <button 
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          className="absolute -top-1 -right-1 bg-brand-red text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-4 bg-brand-azure text-white font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:brightness-110">
                  {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingId ? 'Save Changes' : 'Commit to Archive'}
                </button>
              </form>
            </div>
          </div>

          {/* Elenco dei Giochi Archiviati */}
          <div className="xl:col-span-7">
            <div className="space-y-4">
              {games.map(game => {
                const isHypervisor = game.crackedBy?.toLowerCase() === 'denuvowo';
                return (
                  <div key={game.id} className="bg-brand-card p-6 rounded-2xl border border-brand-border flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={game.bannerImage || 'https://via.placeholder.com/150'} className="w-24 h-14 object-cover rounded-lg" alt="" />
                      <div>
                        <h4 className="text-white font-bold flex items-center gap-2 flex-wrap">
                          {game.title}
                          {game.isUpcoming && (
                            <span className="text-[9px] bg-brand-azure/20 text-brand-azure px-2 py-0.5 rounded font-black uppercase tracking-wider">Upcoming</span>
                          )}
                          {isHypervisor && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
                              <Shield className="w-2.5 h-2.5" />
                              Hypervisor
                            </span>
                          )}
                        </h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          <span className="text-[10px] text-gray-500">{game.steamScreenshots?.length || 0} Screenshots</span>
                          {game.videoUrl && <span className="text-[10px] text-brand-azure font-bold">VIDEO ACTIVE</span>}
                          <span className="text-[10px] text-gray-500">Date: {getFormattedAdminDate(game.releaseDate)}</span>
                          {game.genres && game.genres.length > 0 && (
                            <span className="text-[10px] bg-brand-dark border border-brand-border text-gray-400 px-2 rounded uppercase font-black tracking-wider">
                              {game.genres[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="p-3 text-brand-azure hover:bg-brand-azure/10 rounded-xl transition-colors"
                        aria-label={`Edit ${game.title}`}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-3 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
                        aria-label={`Delete ${game.title}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- SCHEDA 2: ANNUNCI E MESSAGGI --- */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Form Creazione Annuncio */}
          <div className="xl:col-span-5">
            <div className="bg-brand-card p-8 rounded-3xl border border-brand-border sticky top-28">
              <h3 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-azure" />
                {editingAnnId ? 'Edit Announcement' : 'Publish Alert'}
              </h3>
              
              <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    Announcement Message
                  </label>
                  <textarea
                    placeholder="Scrivi qui l'avviso per il sito..."
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm h-32 focus:outline-none focus:border-brand-azure mt-1"
                    value={announcementMsg}
                    onChange={e => setAnnouncementMsg(e.target.value)}
                    required
                  />
                </div>

                {/* Selezione Colore dell'Alert */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    Alert Level / Color
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setAnnouncementColor(color.id)}
                        className={`p-3 rounded-xl border text-[10px] font-black uppercase text-left transition-all ${
                          announcementColor === color.id 
                            ? `${color.bgClass} ${color.borderClass} ${color.textClass} ring-2 ring-brand-azure`
                            : 'bg-brand-dark border-brand-border text-gray-400'
                        }`}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full py-4 bg-brand-azure text-white font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:brightness-110">
                  {editingAnnId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingAnnId ? 'Save Changes' : 'Broadcast Message'}
                </button>

                {editingAnnId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAnnId(null);
                      setAnnouncementMsg('');
                    }}
                    className="w-full text-center text-xs font-black text-gray-500 hover:text-white uppercase transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Lista degli Annunci Pubblicati */}
          <div className="xl:col-span-7">
            <div className="space-y-4">
              <h3 className="text-white font-black uppercase text-sm pl-1 tracking-wider">Active Broadcasts</h3>
              {announcements.length === 0 ? (
                <div className="p-8 text-center bg-brand-card rounded-2xl border border-dashed border-brand-border text-gray-500 text-sm">
                  Nessun annuncio o messaggio di avviso configurato nel database.
                </div>
              ) : (
                announcements.map(ann => {
                  const design = PRESET_COLORS.find(c => c.id === ann.color) || PRESET_COLORS[0];
                  return (
                    <div 
                      key={ann.id} 
                      className={`p-6 rounded-2xl border transition-all ${design.bgClass} ${design.borderClass} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                    >
                      <div className="space-y-2 flex-1">
                        <p className={`text-sm font-bold leading-relaxed text-white`}>
                          {ann.message}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span>Color: <strong className={design.textClass}>{ann.color}</strong></span>
                          <span>•</span>
                          <span>Published: {new Date(ann.created_at).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle Attivo / Inattivo */}
                        <button
                          onClick={() => handleToggleAnnActive(ann.id, ann.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                            ann.is_active 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' 
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                          }`}
                        >
                          {ann.is_active ? 'Active' : 'Muted'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingAnnId(ann.id);
                            setAnnouncementMsg(ann.message);
                            setAnnouncementColor(ann.color);
                          }}
                          className="p-2 text-brand-azure hover:bg-brand-azure/10 rounded-lg transition-colors"
                          title="Modifica"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2 text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SCHEDA 3: RICHIESTE DEGLI UTENTI --- */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pl-1">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">User Game Requests</h3>
              <p className="text-gray-500 text-xs mt-1">Richieste inviate tramite il form di conservazione da parte degli utenti.</p>
            </div>
            <button 
              onClick={fetchRequests} 
              className="px-4 py-2 bg-brand-card hover:bg-brand-card/80 border border-brand-border rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Refresh List
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center bg-brand-card rounded-3xl border border-dashed border-brand-border text-gray-500">
              Nessuna richiesta utente attualmente memorizzata nel database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map(req => (
                <div 
                  key={req.id} 
                  className={`bg-brand-card border rounded-2xl p-6 transition-all relative overflow-hidden flex flex-col justify-between ${
                    req.status === 'pending' ? 'border-brand-border' : 
                    req.status === 'completed' ? 'border-emerald-500/30 bg-emerald-950/10' : 
                    'border-red-500/20 bg-red-950/5'
                  }`}
                >
                  <div className="space-y-4">
                    {/* ID Steam e Stato */}
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1 bg-brand-dark px-2 py-1 rounded">
                        AppID: {req.steam_appid}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Titolo e dettagli */}
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1 leading-snug">{req.title}</h4>
                      {req.discord_tag && (
                        <p className="text-[10px] text-brand-azure font-bold uppercase tracking-wider">
                          Req by: @{req.discord_tag}
                        </p>
                      )}
                    </div>

                    {/* Note dell'utente */}
                    {req.notes && (
                      <div className="bg-brand-dark p-3 rounded-lg border border-brand-border/40">
                        <p className="text-[11px] text-gray-400 italic">"{req.notes}"</p>
                      </div>
                    )}

                    {/* Link Steam Store */}
                    <a
                      href={`https://store.steampowered.com/app/${req.steam_appid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-azure transition-colors font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verify on Steam Store
                    </a>
                  </div>

                  {/* Azioni sulla Richiesta */}
                  <div className="mt-6 pt-4 border-t border-brand-border/50 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] text-gray-600 font-medium">
                      {new Date(req.created_at).toLocaleDateString('it-IT')}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Pulsante Importa */}
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleImportRequest(req)}
                          className="px-3 py-1.5 bg-brand-azure text-white text-[10px] font-black rounded-lg hover:brightness-110 flex items-center gap-1 uppercase transition-all"
                          title="Importa dettagli nel form di inserimento"
                        >
                          <Plus className="w-3 h-3" />
                          Import
                        </button>
                      )}

                      {/* Approva */}
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'completed')}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                          title="Segna come Rilasciato / Completato"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {/* Rifiuta / Ripristina in pending */}
                      {req.status !== 'pending' ? (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'pending')}
                          className="px-2.5 py-1.5 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 text-[9px] font-bold rounded-lg transition-colors uppercase"
                        >
                          Reset to Pending
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="Rifiuta Richiesta"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Elimina */}
                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-1.5 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white rounded-lg transition-all"
                        title="Rimuovi definitivamente dal Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;