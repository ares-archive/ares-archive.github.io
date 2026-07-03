import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ShieldAlert, Mail, FileText, Copyright, ArrowLeft, Info, ShieldCheck } from 'lucide-react'; // <-- Aggiunto ShieldCheck qui!
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const Legal: React.FC = () => {
  const { t } = useLanguage();
  const s3items = t('legal.s3items') as { strong: string; text: string }[];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="container mx-auto px-4 py-16 max-w-5xl"
    >
      {/* Intestazione */}
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-azure font-bold mb-6 hover:translate-x-[-4px] transition-transform">
          <ArrowLeft className="w-4 h-4" />
          {t('legal.back')}
        </Link>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
          <Scale className="w-10 h-10 text-brand-azure" />
          {t('legal.title')}
        </h1>
        <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">
          {t('legal.updated')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contenuto Principale */}
        <div className="lg:col-span-8 space-y-12 text-gray-300 leading-relaxed text-sm md:text-base">
          
          {/* Sezione Disclaimer */}
          <section className="bg-brand-card/40 border border-brand-border p-8 rounded-3xl space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-azure" />
              {t('legal.s1Title')}
            </h2>
            <p>{t('legal.s1p1')}</p>
            <p>{t('legal.s1p2')}</p>
          </section>

          {/* Sezione DMCA */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Copyright className="w-6 h-6 text-brand-azure" />
              {t('legal.s2Title')}
            </h2>
            <p>
              {t('legal.s2p1Pre')} <strong>{t('legal.s2p1Strong')}</strong> {t('legal.s2p1Post')}
            </p>
            <p>{t('legal.s2p2')}</p>
          </section>

          {/* Come fare la richiesta */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-azure" />
              {t('legal.s3Title')}
            </h3>
            <p>{t('legal.s3p1')}</p>
            <ul className="list-decimal list-inside pl-4 space-y-3 text-gray-400">
              {s3items.map((item, i) => (
                <li key={i}>
                  <strong className="text-white">{item.strong}</strong> {item.text}
                </li>
              ))}
            </ul>
          </section>

          {/* Contatti */}
          <section className="bg-brand-azure/10 border border-brand-azure/30 p-8 rounded-3xl space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-azure animate-pulse" />
              {t('legal.s4Title')}
            </h3>
            <p>
              {t('legal.s4p1Pre')} <strong>{t('legal.s4p1Strong')}</strong>{t('legal.s4p1Post')}
            </p>
            <div className="bg-brand-dark p-4 rounded-xl border border-brand-border inline-block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">{t('legal.emailLabel')}</span>
              <span className="text-brand-azure font-black font-mono text-sm md:text-base">ares.digital.preservation@gmail.com</span>
            </div>
            <p className="text-xs text-gray-500 italic">
              {t('legal.adminNote')}
            </p>
          </section>

          {/* Counter notice */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              {t('legal.s5Title')}
            </h3>
            <p>{t('legal.s5p1')}</p>
            <p>{t('legal.s5p2')}</p>
          </section>

        </div>

        {/* Sidebar Informativa */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <div className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-6">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-red animate-pulse" />
                {t('legal.sidebarTitle')}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('legal.sidebarText')}
              </p>
              <div className="pt-4 border-t border-brand-border">
                <span className="text-[10px] text-gray-600 font-bold block uppercase tracking-wider mb-2">{t('legal.sidebarSignature')}</span>
                <p className="text-[10px] text-gray-500 font-mono leading-none">
                  ARES-LEGAL-SEC-0x99A8B
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Legal;
