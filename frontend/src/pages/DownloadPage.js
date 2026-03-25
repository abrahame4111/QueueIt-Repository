import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, QrCode, Music, List, Smartphone, Monitor, Zap, ArrowRight } from 'lucide-react';

const WINDOWS_URL = 'https://customer-assets.emergentagent.com/job_9c6655a5-05ad-4cc4-9871-fac4b6808ff6/artifacts/holfx7kt_QueueIt%20Setup%201.0.0.exe';
const MAC_URL = 'https://customer-assets.emergentagent.com/job_03179c1a-c1e0-4037-a646-0831b4343a5e/artifacts/2cdxlpcy_QueueIt-1.0.0-universal.dmg';

const DownloadPage = () => {
  const [os, setOs] = useState('Unknown');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Mac') !== -1) setOs('Mac');
    else if (ua.indexOf('Win') !== -1) setOs('Windows');
    else if (/Android/i.test(ua)) setOs('Android');
    else if (/iPhone|iPad|iPod/i.test(ua)) setOs('iOS');
    else if (ua.indexOf('Linux') !== -1) setOs('Linux');
  }, []);

  const handleHeroDownload = () => {
    if (os === 'Windows') window.location.href = WINDOWS_URL;
    else if (os === 'Mac') window.location.href = MAC_URL;
    else if (os === 'Android' || os === 'iOS') window.location.href = '/admin';
    else window.location.href = WINDOWS_URL;
  };

  const heroText = {
    Windows: { btn: 'DOWNLOAD FOR WINDOWS', sub: 'Windows 10/11 \u2022 64-bit' },
    Mac: { btn: 'DOWNLOAD FOR MAC', sub: 'macOS Universal \u2022 Intel & Apple Silicon' },
    Android: { btn: 'INSTALL ON ANDROID', sub: 'PWA \u2022 No app store needed' },
    iOS: { btn: 'INSTALL ON IPHONE', sub: 'PWA \u2022 Add to Home Screen' },
    Linux: { btn: 'DOWNLOAD FOR LINUX', sub: 'Linux build coming soon' },
    Unknown: { btn: 'DOWNLOAD QUEUEIT', sub: 'Available for all platforms' },
  }[os];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline">
            <img src="/queueit-icon.png" alt="" className="w-7 h-7" />
            <span className="font-cyber text-lg font-bold text-white">QUEUE<span className="text-[var(--primary)]">IT</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-[0.1em] no-underline hover:text-[var(--cyan)] transition-colors">Features</a>
            <a href="#how-it-works" className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-[0.1em] no-underline hover:text-[var(--cyan)] transition-colors">Protocol</a>
            <a href="#download" className="neon-button px-5 py-2.5 text-xs no-underline">DOWNLOAD</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-20 relative text-center scanlines">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--cyan)]/5 via-transparent to-[var(--bg)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-[800px]">
          <div className="inline-block border border-[var(--border)] px-4 py-1.5 mb-8">
            <span className="font-mono text-[0.65rem] text-[var(--cyan)] uppercase tracking-[0.2em]">// MUSIC QUEUE SYSTEM v1.0</span>
          </div>
          <h1 className="font-cyber font-black text-[clamp(2.5rem,7vw,6rem)] leading-none mb-6 tracking-tight">
            <span className="glitch-text" data-text="LET YOUR">LET YOUR</span><br />
            <span>GUESTS </span><span className="text-[var(--primary)]">DJ</span>
          </h1>
          <p className="font-mono text-[var(--text-muted)] text-base md:text-lg leading-relaxed mb-10 max-w-[600px] mx-auto">
            The smart music queue for hostels, bars, and caf&eacute;s.<br />QR scan. Request. Queue. Vibe.
          </p>
          <button onClick={handleHeroDownload} className="neon-button h-16 px-10 text-base mx-auto" data-testid="hero-download-btn">
            <span className="flex items-center gap-3">
              <Download className="w-5 h-5" />
              {heroText.btn}
            </span>
          </button>
          <p className="font-mono text-xs text-[var(--text-muted)] mt-4 opacity-50">{heroText.sub}</p>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32 px-6 max-w-[1200px] mx-auto">
        <div className="font-mono text-[0.65rem] text-[var(--cyan)] uppercase tracking-[0.25em] mb-4">// FEATURES</div>
        <h2 className="font-cyber font-bold text-[clamp(2rem,4vw,3rem)] mb-16 leading-tight">BUILT FOR THE<br />NIGHT SHIFT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
          {[
            { icon: Music, title: 'SPOTIFY INTEGRATION', desc: 'Connect your Spotify Premium and control playback directly from the admin console.' },
            { icon: QrCode, title: 'QR CODE ACCESS', desc: 'Generate a unique QR code. Guests scan it to browse and request songs instantly.' },
            { icon: List, title: 'QUEUE CONTROL', desc: 'Full admin power. Skip, remove, or purge the queue. You decide what plays.' },
            { icon: Zap, title: 'REAL-TIME SYNC', desc: 'Live queue updates. Guests see changes instantly. No refresh needed.' },
            { icon: Smartphone, title: 'MOBILE ADMIN', desc: 'Full admin console on your phone. Install as a PWA \u2014 no app store required.' },
            { icon: Monitor, title: 'DESKTOP APP', desc: 'Native Windows app with Spotify menu bar. Login, logout, switch accounts seamlessly.' },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-[var(--surface)] p-8 md:p-10 hover:bg-[var(--surface-elevated)] transition-colors group">
              <div className="w-12 h-12 border border-[var(--border)] flex items-center justify-center mb-6 group-hover:border-[var(--cyan)] group-hover:shadow-[0_0_10px_var(--cyan)] transition-all">
                <f.icon className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h3 className="font-cyber text-base font-bold mb-3">{f.title}</h3>
              <p className="font-mono text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 max-w-[900px] mx-auto">
        <div className="font-mono text-[0.65rem] text-[var(--cyan)] uppercase tracking-[0.25em] mb-4">// PROTOCOL</div>
        <h2 className="font-cyber font-bold text-[clamp(2rem,4vw,3rem)] mb-16 leading-tight">HOW IT WORKS</h2>
        <div className="flex flex-col">
          {[
            { num: '01', title: 'DOWNLOAD & INSTALL', desc: 'Get QueueIt for your platform. Launch the app and login to the admin console.' },
            { num: '02', title: 'CONNECT SPOTIFY', desc: 'Link your Spotify Premium account. QueueIt takes control of your active device.' },
            { num: '03', title: 'GENERATE QR CODE', desc: 'Create a unique QR code for your venue. Print it and display it where guests can see.' },
            { num: '04', title: 'GUESTS SCAN & REQUEST', desc: 'Guests scan the QR, search for songs, and add to the queue. You approve what plays.' },
          ].map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex gap-6 md:gap-8 py-8 border-b border-[var(--border)] items-start">
              <span className="font-cyber text-4xl md:text-5xl font-black text-[var(--primary)] leading-none min-w-[60px] md:min-w-[80px]">{s.num}</span>
              <div>
                <h3 className="font-cyber text-lg md:text-xl font-bold mb-2">{s.title}</h3>
                <p className="font-mono text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-24 md:py-32 px-6 text-center">
        <div className="max-w-[900px] mx-auto">
          <div className="font-mono text-[0.65rem] text-[var(--cyan)] uppercase tracking-[0.25em] mb-4">// DOWNLOAD</div>
          <h2 className="font-cyber font-bold text-[clamp(2rem,4vw,3rem)] mb-4 leading-tight">GET QUEUEIT</h2>
          <p className="font-mono text-sm text-[var(--text-muted)] mb-12">Choose your platform and start setting the vibe.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] max-w-[900px] mx-auto">
            {[
              { os: 'Windows', info: 'EXE Installer', sub: 'Win 10/11 64-bit', action: () => window.location.href = WINDOWS_URL, ready: true },
              { os: 'macOS', info: 'DMG Installer', sub: 'Universal (Intel & Apple Silicon)', action: () => window.location.href = MAC_URL, ready: true },
              { os: 'Android', info: 'PWA Install', sub: 'Chrome Browser', action: () => window.location.href = '/admin', ready: true },
              { os: 'iOS', info: 'PWA Install', sub: 'Safari Browser', action: () => window.location.href = '/admin', ready: true },
            ].map((d, i) => (
              <motion.button key={d.os} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                onClick={d.action}
                className={`bg-[var(--surface)] p-6 md:p-8 text-left hover:bg-[var(--surface-elevated)] transition-all border-none cursor-pointer group ${d.ready ? '' : 'opacity-60'}`}
                data-testid={`download-${d.os.toLowerCase()}`}>
                <h3 className="font-cyber text-xl font-bold mb-1 group-hover:text-[var(--cyan)] transition-colors">{d.os}</h3>
                <p className="font-mono text-xs text-[var(--text-muted)]">{d.info}</p>
                <p className="font-mono text-[10px] text-[var(--text-muted)] opacity-50 mt-1">{d.sub}</p>
                {d.ready && <ArrowRight className="w-4 h-4 text-[var(--cyan)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </motion.button>
            ))}
          </div>

          <p className="font-mono text-xs text-[var(--text-muted)] mt-8 opacity-40">Free to use &bull; No credit card &bull; 5-minute setup</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center">
        <p className="font-mono text-xs text-[var(--text-muted)]">&copy; 2026 QueueIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DownloadPage;
