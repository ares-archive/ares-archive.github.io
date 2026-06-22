import React from 'react';

const Privacy = () => {
  const privacyPoints = [
    { 
      title: "Zero Tracking Policy", 
      content: "ARES does not use tracking pixels, marketing cookies, or browser fingerprinting scripts. Your browsing habits within the archive are never recorded or analyzed for commercial purposes." 
    },
    { 
      title: "Discord Identity Sync", 
      content: "When you connect via Discord, we only store your unique Discord ID and username. This data is used solely to synchronize your identity across the ARES network and manage your contributions." 
    },
    { 
      title: "Local-Only Preferences", 
      content: "Your UI preferences, such as theme settings and search history, are stored exclusively in your browser's LocalStorage. This data never leaves your device and is never uploaded to our servers." 
    },
    { 
      title: "IP Address Masking", 
      content: "Our decentralized retrieval nodes are configured to mask user IP addresses. When you download an archive, the network sees a distributed request rather than a single identifiable user." 
    },
    { 
      title: "Instant Data Purge", 
      content: "Users have the right to be forgotten. You can purge your identity data and contribution history instantly through your account settings, removing all traces of your account from the active index." 
    },
    { 
      title: "No Third-Party Sharing", 
      content: "ARES has never and will never sell, rent, or share user data with advertising networks, data brokers, or any third-party commercial entities. Our mission is preservation, not data mining." 
    },
    { 
      title: "Advanced Encryption", 
      content: "All session tokens and authentication data are encrypted using industry-standard AES-256 encryption. We prioritize the security of your connection to the ARES protocol at all times." 
    },
    { 
      title: "Transparent Audit Logs", 
      content: "Administrative actions within the database are logged for security and accountability. These logs are transparent to the community but are stripped of any personally identifiable information (PII)." 
    },
    { 
      title: "Public Record Nature", 
      content: "While user data is private, archive contributions (metadata, links) are part of the public historical record. We encourage the use of pseudonyms for users who wish to remain anonymous contributors." 
    },
    { 
      title: "Functional Cookies Only", 
      content: "We only use essential functional cookies required for the authentication flow. These cookies are temporary and are used strictly to maintain your secure session while you explore the database." 
    },
    { 
      title: "Protection of Minors", 
      content: "ARES does not knowingly collect or store data from users under the age of 13. If we become aware of such data, it is immediately purged from our identity synchronization layers." 
    },
    { 
      title: "Breach Notification", 
      content: "In the unlikely event of a security compromise, ARES will notify the community through the ARES protocol's broadcast layer within 24 hours, ensuring complete transparency about the incident." 
    },
    { 
      title: "Data Portability", 
      content: "You own your contributions. ARES provides tools for users to export their entire contribution history and metadata in a standardized JSON format for use in other preservation projects." 
    },
    { 
      title: "Policy Commit History", 
      content: "Changes to this privacy protocol are committed to our public ARES-LEGAL repository. Every version of this policy is archived, allowing users to track how our privacy standards evolve over time." 
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter">Privacy Protocol</h1>
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
