import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldAlert, CheckCircle2, Video, Image as ImageIcon, X, Pencil, Save, Upload, Sparkles, LogOut } from 'lucide-react';
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
  goldbergUrl: '', // Inizializzato
  minimumRequirements: '', // Inizializzato
  recommendedRequirements: '', // Inizializzato
  tags: [],
  genres: [],
  platforms: ['windows']
};

// Lista completa di tutti i generi gestiti dall'ecosistema ARES
const AVAILABLE_GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Shooter",
  "Simulation",
  "Survival",
  "Horror",
  "Platformer",
  "Racing",
  "Sports",
  "Fighting",
  "Indie",
  "Puzzle",
  "Preservation",
  "Emulator",
  "Crack/Bypass"
];

const AdminDashboard = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screenshotInput, setScreenshotInput] = useState('');
  const [activeGame, setActiveGame] = useState<Partial<Game>>(emptyGame);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fetchingRawg, setFetchingRawg] = useState(false);

  // Controllo della sessione all'avvio
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchGames();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) resetForm();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Login con Supabase Auth
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

  // Logout tramite Supabase
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
        releaseDate: dbGame.release_date || '', // Vuoto per permettere all'input di caricarlo correttamente
        isUpcoming: dbGame.is_upcoming || false, 
        steamUrl: dbGame.steam_url || '',
        gogUrl: dbGame.gog_url || '',
        epicUrl: dbGame.epic_url || '',
        goldbergUrl: dbGame.goldberg_url || '', // Recuperato dal DB
        minimumRequirements: dbGame.minimum_requirements || '', // Recuperato dal DB
        recommendedRequirements: dbGame.recommended_requirements || '', // Recuperato dal DB
        tags: ['New'],
        genres: dbGame.genre ? [dbGame.genre] : [], 
        platforms: ['windows'],
      }));
      setGames(mappedGames);
    }
  };

  // RILEVAMENTO GENERE AUTOMATICO POTENZIATO
  const fetchGenreFromSteam = async (steamUrl: string): Promise<string[]> => {
    try {
      const match = steamUrl.match(/\/app\/(\d+)/);
      if (!match) return [];
      
      const steamId = match[1];
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamId}&l=italian`);
      if (!response.ok) return [];

      const data = await response.json() as any;
      if (!data[steamId] || !data[steamId].success || !data[steamId].data.genres) return [];

      const steamGenres = data[steamId].data.genres as { id: string; description: string }[];
      
      // Controlliamo i generi combinando la stringa principale e quelle secondarie
      for (const g of steamGenres) {
        const desc = g.description.toLowerCase();
        if (desc.includes('horror')) return ['Horror'];
        if (desc.includes('survival') || desc.includes('sopravvivenza')) return ['Survival'];
        if (desc.includes('rpg') || desc.includes('ruolo') || desc.includes('role')) return ['RPG'];
        if (desc.includes('strateg') || desc.includes('strategy')) return ['Strategy'];
        if (desc.includes('corsa') || desc.includes('racing') || desc.includes('automobilismo')) return ['Racing'];
        if (desc.includes('sport')) return ['Sports'];
        if (desc.includes('combattimento') || desc.includes('fighting')) return ['Fighting'];
        if (desc.includes('simulaz') || desc.includes('simulation')) return ['Simulation'];
        if (desc.includes('rompicapo') || desc.includes('puzzle')) return ['Puzzle'];
        if (desc.includes('platform') || desc.includes('piattaforme')) return ['Platformer'];
        if (desc.includes('azion') || desc.includes('action') || desc.includes('sparatutto') || desc.includes('shooter')) return ['Action'];
        if (desc.includes('avventur') || desc.includes('adventure')) return ['Adventure'];
      }

      if (steamGenres.some(g => g.description.toLowerCase().includes('indie'))) return ['Indie'];
      
      return [];
    } catch (err) {
      console.error("Impossibile recuperare il genere da Steam:", err);
      return [];
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
      const apiKey = "ca55a690f85e47de9a466956ba72663d";
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
                
                // Estrazione Genere
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

                // Estrazione dei Requisiti di sistema completi
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

      // Se non trovato da Steam, proviamo una mappatura veloce da RAWG per il genere
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

      let autoFillMessage = `Dati, screenshot e link store per "${foundGame.name}" caricati con successo!`;
      if (steamMinReqs || steamRecReqs) {
        autoFillMessage += ` Rilevati anche i requisiti di sistema ufficiali direttamente da Steam.`;
      }
      alert(autoFillMessage);

    } catch (err) {
      console.error("Errore RAWG/Steam Sync:", err);
      alert("Errore durante il collegamento o l'elaborazione dei dati.");
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

    // Se la data inserita è vuota, viene inserita come NULL
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
      genre: singleGenreString 
    };

    if (editingId) {
      const { error } = await supabase
        .from('games')
        .update(payload)
        .eq('id', editingId);
        
      if (error) {
        console.error("Errore Supabase in UPDATE:", error);
        alert(`Errore durante la modifica: ${error.message}`);
      } else {
        alert("Modifica salvata con successo!");
        fetchGames();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('games')
        .insert([payload])
        .select();

      if (error) {
        console.error("Errore Supabase in INSERT:", error);
        alert(`Errore durante il salvataggio: ${error.message}`);
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

  // Helper sicuro per mostrare la data di rilascio o "TBA" nella lista di destra dell'Admin
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
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black text-white uppercase italic">Database Management</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-xs font-bold rounded-lg transition-all uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-5">
          <div className="bg-brand-card p-8 rounded-3xl border border-brand-border sticky top-28">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-black text-white uppercase">
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
              <input
                placeholder="Developer name"
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                value={activeGame.developer || ''}
                onChange={e => setActiveGame({...activeGame, developer: e.target.value})}
              />
              
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
                  Game Link (Buzzheavier)
                </label>
                <div className="flex gap-2">
                  <input 
                    placeholder="Buzzheavier Link (URL)"
                    className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                    value={activeGame.buzzheavierLink || ''}
                    onChange={e => setActiveGame({...activeGame, buzzheavierLink: e.target.value})}
                    required={!activeGame.isUpcoming} 
                  />
                  <a
                    href="https://buzzheavier.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
                    title="Apri Buzzheavier in una nuova scheda per l'upload"
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
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                  value={activeGame.steamUrl || ''}
                  onChange={e => setActiveGame({...activeGame, steamUrl: e.target.value})}
                />
                {/* Input per Goldberg Emulator URL personalizzato */}
                <input 
                  placeholder="Goldberg Emulator URL (Leave empty for default)"
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                  value={activeGame.goldbergUrl || ''}
                  onChange={e => setActiveGame({...activeGame, goldbergUrl: e.target.value})}
                />
                <input 
                  placeholder="GOG Store URL"
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                  value={activeGame.gogUrl || ''}
                  onChange={e => setActiveGame({...activeGame, gogUrl: e.target.value})}
                />
                <input 
                  placeholder="Epic Games Store URL"
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure"
                  value={activeGame.epicUrl || ''}
                  onChange={e => setActiveGame({...activeGame, epicUrl: e.target.value})}
                />
              </div>

              {/* REQUISITI DI SISTEMA (Sotto a Store & Emulator Links) */}
              <div className="space-y-2 pt-2 border-t border-brand-border/40">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">System Requirements (Optional)</span>
                <textarea 
                  placeholder="Minimum Requirements (HTML from Steam or Plain Text)"
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure h-24 resize-none"
                  value={activeGame.minimumRequirements || ''}
                  onChange={e => setActiveGame({...activeGame, minimumRequirements: e.target.value})}
                />
                <textarea 
                  placeholder="Recommended Requirements (HTML from Steam or Plain Text)"
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure h-24 resize-none"
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

        <div className="xl:col-span-7">
          <div className="space-y-4">
            {games.map(game => (
              <div key={game.id} className="bg-brand-card p-6 rounded-2xl border border-brand-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={game.bannerImage || 'https://via.placeholder.com/150'} className="w-24 h-14 object-cover rounded-lg" alt="" />
                  <div>
                    <h4 className="text-white font-bold">
                      {game.title}
                      {game.isUpcoming && (
                        <span className="ml-2 text-[9px] bg-brand-azure/20 text-brand-azure px-2 py-0.5 rounded font-black uppercase tracking-wider">Upcoming</span>
                      )}
                    </h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-gray-500">{game.steamScreenshots?.length || 0} Screenshots</span>
                      {game.videoUrl && <span className="text-[10px] text-brand-azure font-bold">VIDEO ACTIVE</span>}
                      {/* Mostra la data formattata o TBA nel riepilogo Admin di destra */}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;