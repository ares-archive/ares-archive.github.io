import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Zap, History, ShieldCheck, Globe, Cpu, 
  Database, Award, Users, Lock, Search, Heart, 
  Share2, Scale 
} from 'lucide-react';

const About = () => {
  const points = [
    { 
      icon: Target, 
      title: "Cultural Preservation", 
      desc: "We treat digital media as high-value cultural artifacts, ensuring that the artistic and technical achievements of developers are documented for future scholars and enthusiasts." 
    },
    { 
      icon: Zap, 
      title: "Decentralized Storage", 
      desc: "By utilizing advanced peer-to-peer networks and IPFS protocols, we ensure that the archive is not dependent on a single server, creating a redundant and permanent digital memory." 
    },
    { 
      icon: ShieldCheck, 
      title: "Cryptographic Trust", 
      desc: "Every entry in our database is signed with SHA-256 verification hashes. This guarantees that the software you access is bit-perfect and hasn't been tampered with since its original release." 
    },
    { 
      icon: Globe, 
      title: "Global Access", 
      desc: "Digital history should have no borders. ARES works to bypass regional restrictions and 'geofencing' that often leads to software becoming inaccessible in specific parts of the world." 
    },
    { 
      icon: Cpu, 
      title: "Hardware Agnostic", 
      desc: "We support the documentation of both original hardware specifications and modern emulation layers, ensuring software can be executed regardless of the physical machine's era." 
    },
    { 
      icon: Database, 
      title: "Metadata Standards", 
      desc: "ARES adheres to a strict, custom-built JSON metadata schema that records everything from compiler versions to original retail distribution methods for every archived title." 
    },
    { 
      icon: Award, 
      title: "Quality Assurance", 
      desc: "Our team of digital librarians manually verifies every byte committed to the archive, checking for data rot, malware, and completeness of the documentation package." 
    },
    { 
      icon: Users, 
      title: "Community Driven", 
      desc: "Built by a global collective of historians, programmers, and enthusiasts, ARES is a grassroots initiative that values the collective knowledge of the gaming community." 
    },
    { 
      icon: Lock, 
      title: "Privacy First", 
      desc: "We believe in the right to explore history privately. ARES maintains a strict zero-tracking policy, ensuring that your research and interests remain your own business." 
    },
    { 
      icon: Search, 
      title: "Deep Indexing", 
      desc: "Our advanced search algorithms go beyond titles, indexing technical features, obscure developers, and engine types to help researchers find specific historical milestones." 
    },
    { 
      icon: Heart, 
      title: "Non-Profit Mission", 
      desc: "ARES operates solely for the benefit of digital history. We have no shareholders and no commercial interests; our only 'profit' is the successful preservation of a game." 
    },
    { 
      icon: Share2, 
      title: "Open Protocol", 
      desc: "The ARES protocol is an open standard. We encourage other archives to adopt our metadata and verification systems to create a unified global network of digital history." 
    },
    { 
      icon: Scale, 
      title: "Ethical Archiving", 
      desc: "We navigate the complex intersection of copyright and history with an ethics-first approach, prioritizing the survival of the medium while respecting the rights of creators." 
    },
    { 
      icon: History, 
      title: "Temporal Integrity", 
      desc: "We don't just save the 'final' version. ARES maintains a complete version history of software revisions, patches, and regional variations to show how a project evolved." 
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-24"
      >
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter italic uppercase">
          The <span className="text-brand-azure">ARES</span> Initiative
        </h1>
        <p className="text-xl opacity-70 leading-relaxed font-medium">
          ARES is a next-generation digital preservation platform dedicated to securing the legacy of interactive media through decentralized storage and cryptographic verification.
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
          <h2 className="text-4xl font-black uppercase tracking-tighter">Our Origins</h2>
        </div>
        <div className="prose prose-invert max-w-none opacity-70">
          <p className="text-lg leading-relaxed">
            Founded in 2026, ARES emerged from the collective need of historians and enthusiasts who witnessed the rapid disappearance of digital-only titles. We believe that games are more than just software—they are cultural artifacts that deserve the same protection as literature and film. Our mission is to ensure that the "Digital Dark Age" does not claim the interactive masterpieces of the 21st century.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
