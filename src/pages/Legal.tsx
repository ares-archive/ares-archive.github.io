import React, { useState } from 'react';
import { 
  Scale, 
  ShieldAlert, 
  FileText, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check 
} from 'lucide-react';

export default function Legal() {
  const [copied, setCopied] = useState(false);
  const email = "ares.digital.preservation@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Scale className="w-4 h-4" />
            <span>Legal &amp; Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            NORMATIVA LEGALE E DMCA
          </h1>
        </div>

        {/* 1. Dichiarazione */}
        <section className="bg-[#0c0f17] border border-slate-800/80 rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sky-400 shrink-0 mt-0.5">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-wide">
                1. DICHIARAZIONE DI NON COMMERCIALITÀ E PRESERVAZIONE
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                ARES Archive è un progetto hobbistico personale, non commerciale e senza scopo di lucro, dedicato esclusivamente alla preservazione digitale e all'archiviazione storica di software, arte interattiva e storia digitale.
              </p>
              <p className="text-sm leading-relaxed text-slate-400">
                In linea con gli standard internazionali di preservazione e le iniziative delle biblioteche digitali, il nostro obiettivo primario è prevenire la perdita permanente di media digitali, artefatti software moderni e rilasci esclusivamente digitali contemporanei a rischio di diventare inaccessibili nel tempo. Tutti i materiali ospitati in questo archivio sono destinati esclusivamente a scopi di archiviazione, storici ed educativi. Non monetizziamo, vendiamo, né traiamo alcun beneficio economico dai file catalogati qui.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Politica Copyright */}
        <section className="bg-[#0c0f17] border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sky-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-wide">
                2. POLITICA SUL COPYRIGHT DMCA E RIMOZIONE CONTENUTI
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                ARES Archive rispetta i diritti di proprietà intellettuale di sviluppatori, publisher e creatori di software. Ci atteniamo alle disposizioni del <strong className="text-slate-200">Digital Millennium Copyright Act (DMCA)</strong> (17 U.S.C. § 512).
              </p>
              <p className="text-sm leading-relaxed text-slate-400">
                Se sei il titolare di un copyright, o sei autorizzato ad agire per suo conto, e ritieni che un materiale catalogato sul nostro sito violi il tuo copyright, puoi inviare una richiesta formale scritta di rimozione al nostro agente designato. Una volta ricevuta una notifica valida e pienamente conforme, agiremo tempestivamente per rimuovere o disabilitare l'accesso al materiale contestato.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Requisiti DMCA */}
        <section className="bg-[#0c0f17] border border-slate-800/80 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sky-400 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                3. REQUISITI PER UNA NOTIFICA DMCA CONFORME
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Per garantire l'elaborazione immediata della tua richiesta, la notifica scritta deve includere tutti i seguenti elementi, come richiesto dal 17 U.S.C. § 512(c)(3):
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-12 pt-2">
            {[
              { id: "01", title: "Firma Autorizzata:", desc: "Una firma fisica o elettronica di una persona autorizzata ad agire per conto del titolare di un diritto esclusivo presumibilmente violato." },
              { id: "02", title: "Identificazione dell'Opera:", desc: "Identificazione dell'opera protetta da copyright che si presume sia stata violata, o, in caso di più opere coperte da un'unica notifica, un elenco rappresentativo di tali opere." },
              { id: "03", title: "Identificazione del Materiale in Violazione:", desc: "Identificazione del materiale ritenuto in violazione o oggetto di attività illecita, incluso l'URL esatto sul nostro sito dove si trova il materiale." },
              { id: "04", title: "Informazioni di Contatto:", desc: "Informazioni ragionevolmente sufficienti a permetterci di contattarti, incluso un indirizzo, un numero di telefono e, se disponibile, un indirizzo e-mail attivo." },
              { id: "05", title: "Dichiarazione di Buona Fede:", desc: "Una dichiarazione secondo cui ritieni in buona fede che l'uso del materiale contestato non sia autorizzato dal titolare del copyright, dal suo agente o dalla legge." },
              { id: "06", title: "Dichiarazione di Accuratezza:", desc: "Una dichiarazione che le informazioni nella notifica sono accurate e, sotto pena di pergiuro, che sei autorizzato ad agire per conto del titolare di un diritto esclusivo presumibilmente violato." }
            ].map((item) => (
              <div key={item.id} className="bg-[#080a10] border border-slate-800/60 rounded-lg p-3.5 flex gap-3">
                <span className="text-xs font-mono font-bold text-sky-500/80 bg-sky-950/40 border border-sky-800/30 rounded px-1.5 py-0.5 h-fit">
                  {item.id}
                </span>
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-slate-200 block">{item.title}</span>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Agente Designato */}
        <section className="bg-sky-950/10 border border-sky-900/40 rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-sky-900/20 border border-sky-800/50 rounded-lg text-sky-400 shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-4 w-full">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  4. INFORMAZIONI DI CONTATTO DELL'AGENTE DESIGNATO
                </h2>
                <span className="text-[10px] font-mono uppercase bg-sky-900/30 border border-sky-700/40 text-sky-400 px-2 py-0.5 rounded">
                  SLA: 24 - 48 ORE
                </span>
              </div>
              
              <p className="text-sm text-slate-400">
                Invia tutte le notifiche DMCA conformi direttamente al nostro indirizzo e-mail designato. Esaminiamo ed elaboriamo tutte le richieste valide entro <strong className="text-slate-200">da 24 a 48 ore</strong>.
              </p>

              <div className="bg-[#05070c] border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Indirizzo Email</span>
                  <span className="font-mono text-sm font-semibold text-sky-400">{email}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "COPIATO" : "COPIA EMAIL"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Contronotifica */}
        <section className="bg-[#0c0f17] border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sky-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-wide">
                5. PROCEDURA DI CONTRONOTIFICA
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Se ritieni che il tuo materiale sia stato rimosso o disabilitato per errore o erronea identificazione, puoi inviare una contronotifica scritta al nostro agente designato.
              </p>
              <p className="text-sm leading-relaxed text-slate-400">
                Ai sensi del DMCA, una contronotifica conforme deve includere la tua firma fisica/elettronica, l'identificazione del materiale rimosso, una dichiarazione sotto pena di pergiuro che ritieni la rimozione un errore e le tue informazioni di contatto. Una volta ricevuta, inoltreremo la contronotifica alla parte richiedente originale.
              </p>
            </div>
          </div>
        </section>

        {/* Avviso Legale Finale */}
        <div className="bg-[#080a10] border border-slate-800/50 rounded-lg p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Questo documento è redatto per garantire la massima conformità formale internazionale con il sistema di rimozione DMCA ed è perfettamente riconoscibile dai legali e dai detentori di copyright in tutto il mondo.
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-600 uppercase shrink-0 hidden sm:inline">
            FIRMA: ARES ARCHIVE
          </span>
        </div>

      </div>
    </div>
  );
}
