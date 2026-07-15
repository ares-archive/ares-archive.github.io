import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Calendar,
  Layers,
  Code2,
  Play,
  Loader2,
  Clock,
  MessageSquare,
  Send,
  Cpu,
  Flag
} from 'lucide-react';
import { supabase } from '../supabase';
import { Game } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';
import { MediaCarousel, MediaItem } from '../components/MediaCarousel';
import DOMPurify from 'dompurify';

const SteamIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
    <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048" />
  </svg>
);

const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const CsRinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="8" cy="10" r="1" fill="currentColor" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
  </svg>
);

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?vq=hd1080&rel=0`;
  }
  return null;
};

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchComments = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('game_id', parseInt(id, 10))
      .order('created_at', { ascending: false });
    if (error) console.error("Errore nel recupero dei commenti:", error);
    else if (data) setComments(data);
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase.from('games').select('*').eq('id', parseInt(id, 10)).single();
      if (error) {
        console.error("Errore nel recupero del dettaglio:", error);
        setGame(null);
      } else if (data) {
        let formattedReleaseDate = 'TBA';
        if (data.release_date && data.release_date.trim() !== '') {
          try {
            const parsedDate = new Date(data.release_date);
            if (!isNaN(parsedDate.getTime())) {
              formattedReleaseDate = parsedDate.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              });
            }
          } catch {
            formattedReleaseDate = 'TBA';
          }
        }
        const mappedGame: Game = {
          id: data.id.toString(), title: data.title || '', description: data.description || '',
          developer: data.developer || '', buzzheavierLink: data.buzzheavier_url || data.pearcrypt_url || '',
          bannerImage: data.banner_url || '', videoUrl: data.video_url || '',
          steamScreenshots: data.screenshots || [], isUpcoming: data.is_upcoming || false,
          steamUrl: data.steam_url || '', gogUrl: data.gog_url || '', epicUrl: data.epic_url || '',
          goldbergUrl: data.goldberg_url || '', minimumRequirements: data.minimum_requirements || '',
          recommendedRequirements: data.recommended_requirements || '', tags: ['New'],
          genres: data.genre ? [data.genre] : [], platforms: ['windows'], releaseDate: formattedReleaseDate,
        };
        setGame(mappedGame);
        const items: MediaItem[] = [];
        if (mappedGame.videoUrl) items.push({ type: 'video', url: mappedGame.videoUrl });
        if (mappedGame.steamScreenshots && mappedGame.steamScreenshots.length > 0) {
          mappedGame.steamScreenshots.forEach(imgUrl => items.push({ type: 'image', url: imgUrl }));
        }
        if (items.length === 0) items.push({ type: 'image', url: mappedGame.bannerImage });
        setMediaItems(items);
      }
      setLoading(false);
    };
    const userStr = localStorage.getItem('ares_discord_user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
    fetchGameDetails();
    fetchComments();
    window.scrollTo(0, 0);
  }, [id, lang]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !id) return;
    setSubmittingComment(true);
    
    // SANITIZE comment prima di inviare
    const cleanComment = DOMPurify.sanitize(newComment.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });

    const { error } = await supabase.from('comments').insert([
      {
        game_id: parseInt(id, 10),
        user_id: currentUser.id, // IMPORTANTE: passa user_id per RLS
        username: currentUser.globalName || currentUser.username,
        avatar_url: currentUser.avatar,
        comment_text: cleanComment
      }
    ]);
    
    if (error) {
      console.error("Errore durante l'invio del commento:", error);
      alert(t('gameDetails.commentError'));
    } else {
      setNewComment('');
      fetchComments();
    }
    setSubmittingComment(false);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !id) return;
    
    // Verifica rate limit server-side via RPC (opzionale)
    // const { data: canReport } = await supabase.rpc('check_report_rate_limit', {
    //   p_game_id: parseInt(id, 10),
    //   p_user_id: currentUser?.id
    // });
    // if (!canReport) { alert('Rate limit exceeded'); return; }
    
    setSubmittingReport(true);
    const { error } = await supabase.from('reports').insert([
      {
        user_id: currentUser?.id || null,
        game_id: parseInt(id, 10),
        reason: reportReason,
        description: reportDescription
      }
    ]);
    if (error) {
      console.error("Errore durante l'invio del report:", error);
      alert('Error submitting report');
    } else {
      alert('Report submitted successfully');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    }
    setSubmittingReport(false);
  };

  const renderRequirements = (reqHtml: string) => {
    if (!reqHtml || reqHtml.trim() === '') {
      return <span className="text-gray-500 italic">{t('gameDetails.noSpecs')}</span>;
    }
    
    // Sanitize HTML con DOMPurify
    const safeHTML = DOMPurify.sanitize(reqHtml, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li', 'p'],
      ALLOWED_ATTR: [],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover']
    });

    if (/<[a-z][\s\S]*>/i.test(reqHtml)) {
      return (
        <div 
          className="text-xs text-gray-400 space-y-1.5 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:text-white [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: safeHTML }}
        />
      );
    }
    return <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{safeHTML}</p>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-brand-azure animate-spin mb-4" />
        <p className="text-gray-400">{t('gameDetails.loading')}</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        {t('gameDetails.notFound')}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
      {/* BANNER DI SFONDO */}
      <div className="theme-preserve-contrast relative h-[65vh] min-h-[500px] border-b border-brand-border/60 overflow-hidden">
        <img src={game.bannerImage} className="w-full h-full object-cover animate-fade-in" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-10">
          <div className="container mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-brand-azure font-bold mb-8 hover:translate-x-[-4px] transition-transform drop-shadow-lg">
              <ArrowLeft className="w-4 h-4" />
              {t('gameDetails.back')}
            </Link>
            <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none drop-shadow-2xl">
              {game.title}
            </h1>
            <div className="flex flex-wrap gap-3">
              {(game.tags || []).map(tag => (
                <span key={tag} className="px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20 shadow-lg">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-16">
            
            {/* CAROUSEL */}
            {mediaItems.length > 0 && (
              <MediaCarousel
                items={mediaItems}
                title={game.title}
                fallbackBanner={game.bannerImage}
              />
            )}

            <section className="space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-1.5 bg-brand-azure rounded-full" />
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">{t('gameDetails.overview')}</h2>
                </div>
                <p className="text-xl leading-relaxed text-gray-400 font-medium max-w-3xl">
                  {game.description}
                </p>
              </div>

              <div className="pt-10 border-t border-brand-border space-y-8 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Cpu className="w-8 h-8 text-brand-azure" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t('gameDetails.systemRequirements')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-brand-card/45 border border-brand-border rounded-[2rem] p-8 space-y-4 hover:border-brand-azure/30 transition-colors shadow-xl">
                    <h4 className="text-sm font-black uppercase text-brand-azure tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-azure rounded-full" />
                      {t('gameDetails.minimumRequirements')}
                    </h4>
                    <div className="font-medium">{renderRequirements(game.minimumRequirements || '')}</div>
                  </div>
                  <div className="bg-brand-card/45 border border-brand-border rounded-[2rem] p-8 space-y-4 hover:border-[#00ffcc]/30 transition-colors shadow-xl">
                    <h4 className="text-sm font-black uppercase text-[#00ffcc] tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00ffcc] rounded-full" />
                      {t('gameDetails.recommendedRequirements')}
                    </h4>
                    <div className="font-medium">{renderRequirements(game.recommendedRequirements || '')}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* COMMENTI */}
            <section className="pt-12 border-t border-brand-border">
              <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-brand-azure" />
                {t('gameDetails.discussion')} ({comments.length})
              </h3>
              {currentUser ? (
                <form onSubmit={handleAddComment} className="flex gap-4 mb-10 bg-brand-card p-6 rounded-2xl border border-brand-border">
                  <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-brand-azure object-cover shrink-0" />
                  <div className="flex-1 space-y-3">
                    <textarea 
                      placeholder={t('gameDetails.commentPlaceholder')}
                      required rows={3}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-azure resize-none"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button type="submit" disabled={submittingComment || !newComment.trim()} className="px-5 py-2.5 bg-brand-azure hover:brightness-110 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50">
                        <Send className="w-3.5 h-3.5" />
                        {submittingComment ? t('gameDetails.sending') : t('gameDetails.sendComment')}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 bg-brand-card/50 rounded-2xl border border-dashed border-brand-border mb-10">
                  <p className="text-gray-400 text-sm mb-3">{t('gameDetails.connectToComment')}</p>
                </div>
              )}
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-brand-card/30 p-5 rounded-2xl border border-brand-border/60 flex gap-4">
                    <img src={comment.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png"} alt="Avatar" className="w-8 h-8 rounded-full border border-brand-azure object-cover" />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black text-white">{comment.username}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(comment.created_at).toLocaleString('it-IT')}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.comment_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 shadow-2xl">
                {game.isUpcoming ? (
                  <button disabled className="w-full py-6 bg-brand-border text-gray-500 font-black rounded-2xl flex items-center justify-center gap-3 text-lg border border-dashed border-gray-600">
                    <Clock className="w-6 h-6" />
                    {t('gameDetails.comingSoon')}
                  </button>
                ) : (
                  <a href={game.buzzheavierLink} target="_blank" rel="noopener noreferrer" className="w-full py-6 bg-brand-azure hover:bg-brand-azure/90 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-azure/20 group text-lg">
                    <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                    {t('gameDetails.downloadNow')}
                  </a>
                )}
                
                <div className="mt-12 space-y-8">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> {game.isUpcoming ? t('gameDetails.expected') : t('gameDetails.released')}</span>
                    <span className="text-white font-black">{game.releaseDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-500 flex items-center gap-2"><Code2 className="w-4 h-4" /> {t('gameDetails.developer')}</span>
                    <span className="text-white font-black">{game.developer}</span>
                  </div>

                  <button onClick={() => setShowReportModal(true)} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
                    <Flag className="w-4 h-4" />
                    Report Broken Game
                  </button>

                  {/* ... resto della sidebar senza cambiamenti ... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-brand-card border border-brand-border rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-black text-white mb-6 uppercase">Report Broken Game</h3>
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-400 mb-2 block">Reason</label>
                  <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-azure" required>
                    <option value="">Select a reason</option>
                    <option value="Link not working">Download link not working</option>
                    <option value="Wrong file">Wrong file uploaded</option>
                    <option value="Missing files">Missing files</option>
                    <option value="Corrupted file">Corrupted file</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 mb-2 block">Description (optional)</label>
                  <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-azure h-32 resize-none" placeholder="Provide more details about the issue..." />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-brand-border text-gray-400 font-black rounded-xl hover:bg-gray-700 transition-all">Cancel</button>
                  <button type="submit" disabled={submittingReport} className="flex-1 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all disabled:opacity-50">{submittingReport ? 'Submitting...' : 'Submit Report'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameDetails;