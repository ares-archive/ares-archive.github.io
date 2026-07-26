import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  ShieldAlert, 
  Mail, 
  FileText, 
  Copyright, 
  ArrowLeft, 
  Info, 
  ShieldCheck, 
  Copy, 
  Check, 
  Gavel,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const Legal: React.FC = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const contactEmail = 'ares.digital.preservation@gmail.com';

  const s3items = (t('legal.s3items') as unknown as { strong: string; text: string }[]) || [];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8 text-gray-200 overflow-hidden">
      {/* Elementi Decorativi di Sfondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-azure/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Top Navigation & Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-card/60 border border-brand-border text-brand-azure text-xs font-mono uppercase tracking-wider hover:border-brand-azure/50 hover:bg-brand-azure/10 transition-all duration-300 group mb-8"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t('legal.back')}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-border/60">
            <div>
              <div className="inline-flex items-center gap-2 text-brand-azure text-xs font-mono font-bold uppercase tracking-widest mb-3 bg-brand-azure/10 px-3 py-1 rounded-md border border-brand-azure/20">
                <Gavel className="w-3.5 h-3.5" />
                <span>Legal & Compliance</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                {t('legal.title')}
              </h1>
            </div>
            
            <div className="text-left md:text-right shrink-0">
              <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest block">
                {t('legal.updated')}
              </span>
              <span className="text-xs font-mono text-brand-azure/80 font-bold">
                REF: ARES-LEGAL-SEC-0x99A8B
              </span>
            </div>
          </div>
        </motion.div>

        {/* Layout Principale */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >

          {/* 1. Dichiarazione di Non Commercialità */}
          <section className="relative overflow-hidden rounded-3xl bg-brand-card/40 border border-brand-border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-brand-azure/40">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
              <Info className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-azure/10 border border-brand-azure/20 text-brand-azure">
                  <Info className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  {t('legal.s1Title')}
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed pt-2 border-t border-brand-border/40">
                <p>{t('legal.s1p1')}</p>
                <p>{t('legal.s1p2')}</p>
              </div>
            </div>
          </section>

          {/* 2. Politica Copyright DMCA */}
          <section className="rounded-3xl bg-brand-card/40 border border-brand-border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-brand-azure/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-azure/10 border border-brand-azure/20 text-brand-azure">
                <Copyright className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                {t('legal.s2Title')}
              </h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed pt-2 border-t border-brand-border/40">
              <p>
                {t('legal.s2p1Pre')} <strong className="text-white font-semibold">{t('legal.s2p1Strong')}</strong> {t('legal.s2p1Post')}
              </p>
              <p>{t('legal.s2p2')}</p>
            </div>
          </section>

          {/* 3. Requisiti per Notifica Conforme */}
          <section className="rounded-3xl bg-brand-card/40 border border-brand-border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-brand-azure/40 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-azure/10 border border-brand-azure/20 text-brand-azure">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                {t('legal.s3Title')}
              </h2>
            </div>
            
            <p className="text-sm sm:text-base text-gray-300 border-t border-brand-border/40 pt-4">
              {t('legal.s3p1')}
            </p>

            <div className="grid grid-cols-1 gap-3">
              {Array.isArray(s3items) && s3items.map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-brand-dark/50 border border-brand-border/60 hover:border-brand-azure/30 transition-colors"
                >
                  <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-brand-azure/10 border border-brand-azure/30 text-brand-azure font-mono font-bold text-xs">
                    0{i + 1}
                  </span>
                  <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white font-semibold block mb-0.5">{item.strong}</strong>
                    <span>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Contatti Agente Designato (Highlight Card) */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-azure/15 to-brand-card/60 border border-brand-azure/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-azure text-brand-dark font-bold shadow-lg shadow-brand-azure/20">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  {t('legal.s4Title')}
                </h2>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-brand-azure/20 border border-brand-azure/30 text-brand-azure font-semibold uppercase">
                SLA: 24 - 48 Ore
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {t('legal.s4p1Pre')} <strong className="text-white">{t('legal.s4p1Strong')}</strong>{t('legal.s4p1Post')}
            </p>

            {/* Email Copiabile Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-dark/90 border border-brand-azure/30">
              <div className="space-y-1 overflow-hidden">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  {t('legal.emailLabel')}
                </span>
                <span className="text-brand-azure font-mono font-black text-sm sm:text-base break-all block">
                  {contactEmail}
                </span>
              </div>
              
              <button
                onClick={handleCopyEmail}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-azure hover:bg-brand-azure/90 text-brand-dark font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copia Email</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 italic">
              {t('legal.adminNote')}
            </p>
          </section>

          {/* 5. Procedura di Contronotifica */}
          <section className="rounded-3xl bg-brand-card/40 border border-brand-border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-brand-azure/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                {t('legal.s5Title')}
              </h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed pt-2 border-t border-brand-border/40">
              <p>{t('legal.s5p1')}</p>
              <p>{t('legal.s5p2')}</p>
            </div>
          </section>

          {/* Banner Finale Disclaimer Rapido */}
          <div className="rounded-2xl bg-brand-card/20 border border-brand-border/60 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t('legal.sidebarTitle')}
                </h4>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  {t('legal.sidebarText')}
                </p>
              </div>
            </div>
            <div className="text-[10px] font-mono text-gray-500 shrink-0 border-t md:border-t-0 md:border-l border-brand-border pt-2 md:pt-0 md:pl-4">
              {t('legal.sidebarSignature')}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Legal;
