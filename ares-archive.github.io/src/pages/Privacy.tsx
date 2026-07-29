import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const Privacy = () => {
  const { t } = useLanguage();
  const privacyPoints = t('privacy.points') as { title: string; content: string }[];

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter">{t('privacy.title')}</h1>
      <div className="space-y-12">
        {privacyPoints.map((point, i) => (
          <section key={i} className="border-l-2 border-brand-green pl-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest flex items-center gap-4">
              <span className="text-brand-green opacity-50">{String(i + 1).padStart(2, '0')}</span>
              {point.title}
            </h2>
            <p className="opacity-60 leading-relaxed">{point.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Privacy;
