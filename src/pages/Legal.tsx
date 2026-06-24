import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ShieldAlert, Mail, FileText, Copyright, ArrowLeft, Info, ShieldCheck } from 'lucide-react'; // <-- Aggiunto ShieldCheck qui!
import { Link } from 'react-router-dom';

const Legal: React.FC = () => {
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
          BACK TO DATABASE
        </Link>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
          <Scale className="w-10 h-10 text-brand-azure" />
          Legal & DMCA Policy
        </h1>
        <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">
          ARES DIGITAL PRESERVATION ARCHIVE • LAST UPDATED: JUNE 2026
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contenuto Principale */}
        <div className="lg:col-span-8 space-y-12 text-gray-300 leading-relaxed text-sm md:text-base">
          
          {/* Sezione Disclaimer */}
          <section className="bg-brand-card/40 border border-brand-border p-8 rounded-3xl space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-azure" />
              1. Non-Commercial & Preservation Disclaimer
            </h2>
            <p>
              ARES Archive is a non-commercial, non-profit personal hobby project dedicated strictly to the digital preservation and historical archiving of software, interactive art, and digital history. 
            </p>
            <p>
              Consistent with international preservation standards and digital library initiatives, our primary goal is to prevent the permanent loss of digital media, modern software artifacts, and contemporary digital-only releases that risk becoming inaccessible over time. All materials hosted in this archive are intended solely for archival, historical, and educational purposes. We do not monetize, sell, or benefit financially from any of the files cataloged here.
            </p>
          </section>

          {/* Sezione DMCA */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Copyright className="w-6 h-6 text-brand-azure" />
              2. DMCA Copyright Policy & Takedown
            </h2>
            <p>
              ARES Archive respects the intellectual property rights of software developers, publishers, and creators. We comply with the provisions of the <strong>Digital Millennium Copyright Act (DMCA)</strong> (17 U.S.C. § 512). 
            </p>
            <p>
              If you are a copyright owner, or authorized to act on behalf of one, and you believe that any material cataloged on our site infringes upon your copyright, you may submit a formal written takedown notice to our designated agent. Upon receipt of a valid and fully compliant notification, we will act expeditiously to remove or disable access to the disputed material.
            </p>
          </section>

          {/* Come fare la richiesta */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-azure" />
              3. Requirements for a Compliant DMCA Notice
            </h3>
            <p>
              To ensure your request is processed immediately, your written notification must include all of the following elements as required by 17 U.S.C. § 512(c)(3):
            </p>
            <ul className="list-decimal list-inside pl-4 space-y-3 text-gray-400">
              <li>
                <strong className="text-white">Authorized Signature:</strong> A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
              </li>
              <li>
                <strong className="text-white">Identification of Work:</strong> Identification of the copyrighted work claimed to have been infringed, or, if multiple works are covered by a single notification, a representative list of such works.
              </li>
              <li>
                <strong className="text-white">Identification of Infringing Material:</strong> Identification of the material that is claimed to be infringing or to be the subject of infringing activity, including the exact URL(s) on our site where the material is located.
              </li>
              <li>
                <strong className="text-white">Contact Information:</strong> Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an active e-mail address.
              </li>
              <li>
                <strong className="text-white">Good Faith Statement:</strong> A statement that you have a good faith belief that use of the disputed material is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong className="text-white">Accuracy Statement:</strong> A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
              </li>
            </ul>
          </section>

          {/* Contatti */}
          <section className="bg-brand-azure/10 border border-brand-azure/30 p-8 rounded-3xl space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-azure animate-pulse" />
              4. Designated Agent Contact Information
            </h3>
            <p>
              Please send all compliant DMCA notifications directly to our designated email address. We review and process all valid requests within <strong>24 to 48 hours</strong>.
            </p>
            <div className="bg-brand-dark p-4 rounded-xl border border-brand-border inline-block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">EMAIL ADDRESS</span>
              <span className="text-brand-azure font-black font-mono text-sm md:text-base">ares.digital.preservation@gmail.com</span>
            </div>
            <p className="text-xs text-gray-500 italic">
              *Nota per l'amministratore: puoi sostituire questo indirizzo e-mail con il tuo indirizzo ProtonMail o con quello del tuo dominio per ricevere direttamente le richieste [1].
            </p>
          </section>

          {/* Counter notice */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              5. Counter-Notification Procedure
            </h3>
            <p>
              If you believe that your material was removed or disabled by mistake or misidentification, you may submit a written counter-notification to our designated agent. 
            </p>
            <p>
              Pursuant to the DMCA, a compliant counter-notification must include your physical/electronic signature, identification of the removed material, a statement under penalty of perjury that you believe the removal was a mistake, and your contact information. Once received, we will forward the counter-notice to the original complaining party.
            </p>
          </section>

        </div>

        {/* Sidebar Informativa */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <div className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-6">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-red animate-pulse" />
                Legal Notice
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Questo documento è redatto in lingua inglese per garantire la massima conformità formale internazionale con il sistema di rimozione DMCA e per essere perfettamente riconoscibile dai legali e dai detentori di copyright in tutto il mondo [1].
              </p>
              <div className="pt-4 border-t border-brand-border">
                <span className="text-[10px] text-gray-600 font-bold block uppercase tracking-wider mb-2">ARES ARCHIVE SIGNATURE</span>
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