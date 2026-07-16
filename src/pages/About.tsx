import React from 'react';
import { motion } from 'framer-motion';
import { 
  Library,
  Network,
  ShieldCheck,
  Globe,
  Cpu,
  FileJson,
  ClipboardCheck,
  Users,
  Lock,
  Search,
  Heart,
  Share2,
  Scale,
  History,
  Compass,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// Mappatura ordinata delle icone logiche per i 14 punti del database
const ICONS = [
  Library,          // [01] Preservazione Culturale
  Network,          // [02] Storage Decentralizzato
  ShieldCheck,      // [03] Fiducia Crittografica
  Globe,            // [04] Accesso Globale
  Cpu,              // [05] Agnostico rispetto all'Hardware
  FileJson,         // [06] Standard di Metadati
  ClipboardCheck,   // [07] Controllo Qualità
  Users,            // [08] Guidati dalla Community
  Lock,             // [09] Privacy al Primo Posto
  Search,           // [10] Indicizzazione Approfondita
  Heart,            // [11] Missione Non-Profit
  Share2,           // [12] Protocollo Aperto
  Scale,            // [13] Aspetto Legale / Etica
  History           // [14] Storia / Origini
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const About = () => {
  const { t } = useLanguage();
  
  const points = (t('about.points') as { title: string; desc: string }[]).map((p, i) => ({
    ...p,
    icon: ICONS[i] || Library,
  }));

  return (
    <div className="container mx-auto px-4 py-20 relative overflow-hidden">
      
      {/* Elementi Decorativi di Sfondo (Neon Glow Globes) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-azure/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/3 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Sezione Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto text-center mb-28 relative z-10"
      >
        <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter italic uppercase leading-none text-white">
          {t('about.titlePrefix')} <span className="text-brand-azure relative">ARES</span> {t('about.titleSuffix')}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-medium max-w-2xl mx-auto">
          {t('about.intro')}
        </p>
      </motion.div>

      {/* Griglia delle Caratteristiche / Punti Chiave */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-36 relative z-10"
      >
        {points.map((point, i) => {
          const PointIcon = point.icon;
          const formattedIndex = String(i + 1).padStart(2, '0');
          
          return (
            <motion.div 
              key={i}
              variants={itemVariants}
              className="bg-brand-card/60 backdrop-blur-md p-8 rounded-2xl border border-brand-border hover:border-brand-azure/40 hover:bg-brand-card/90 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-brand-azure transition-all duration-300" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-brand-dark/50 border border-brand-border group-hover:border-brand-azure/30 rounded-xl transition-all duration-300">
                  <PointIcon className="w-6 h-6 text-brand-azure group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-[11px] font-mono font-bold text-gray-600 group-hover:text-brand-azure/60 transition-colors">
                  [{formattedIndex}]
                </span>
              </div>

              <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-white group-hover:text-brand-azure transition-colors">
                {point.title}
              </h3>
              
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                {point.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sezione Origini / Storia */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <div className="bg-brand-card/40 backdrop-blur-md border border-brand-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 border-l border-b border-brand-border rounded-bl-xl bg-brand-dark/20 text-[9px] font-mono font-bold text-gray-600 flex items-center gap-1.5 uppercase tracking-widest select-none">
            <Calendar className="w-3.5 h-3.5" />
            Project Archive
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-brand-azure/10 border border-brand-azure/20 rounded-lg text-brand-azure shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                {t('about.originsTitle')}
              </h2>
            </div>
          </div>

          <div className="border-l-2 border-brand-azure/40 pl-6 md:pl-8 py-1 ml-1.5">
            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-medium italic">
              {t('about.originsText')}
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;