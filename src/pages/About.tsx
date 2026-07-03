import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Zap, History, ShieldCheck, Globe, Cpu, 
  Database, Award, Users, Lock, Search, Heart, 
  Share2, Scale 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const ICONS = [Target, Zap, ShieldCheck, Globe, Cpu, Database, Award, Users, Lock, Search, Heart, Share2, Scale, History];

const About = () => {
  const { t } = useLanguage();
  const points = (t('about.points') as { title: string; desc: string }[]).map((p, i) => ({
    ...p,
    icon: ICONS[i] || Target,
  }));

  return (
    <div className="container mx-auto px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-24"
      >
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter italic uppercase">
          {t('about.titlePrefix')} <span className="text-brand-azure">ARES</span> {t('about.titleSuffix')}
        </h1>
        <p className="text-xl opacity-70 leading-relaxed font-medium">
          {t('about.intro')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
        {points.map((point, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-brand-card p-8 rounded-3xl border border-brand-border hover:border-brand-azure/50 transition-all group"
          >
            <point.icon className="w-10 h-10 text-brand-azure mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-3 uppercase tracking-tight">{point.title}</h3>
            <p className="text-sm opacity-60 leading-relaxed">{point.desc}</p>
          </motion.div>
        ))}
      </div>

      <section className="space-y-12 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <History className="w-8 h-8 text-brand-azure" />
          <h2 className="text-4xl font-black uppercase tracking-tighter">{t('about.originsTitle')}</h2>
        </div>
        <div className="prose prose-invert max-w-none opacity-70">
          <p className="text-lg leading-relaxed">
            {t('about.originsText')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
