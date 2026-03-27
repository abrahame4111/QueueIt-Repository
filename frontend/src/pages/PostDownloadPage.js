import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, Rocket, MonitorDown, ArrowDown } from 'lucide-react';

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const WINDOWS_URL = `${BACKEND}/api/download/windows`;

const PostDownloadPage = () => {
  const [os, setOs] = useState('Windows');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Mac') !== -1) setOs('Mac');
    else if (/Android/i.test(ua)) setOs('Android');
    else if (/iPhone|iPad|iPod/i.test(ua)) setOs('iOS');

    // Auto-trigger download for Windows
    if (ua.indexOf('Win') !== -1) {
      const timer = setTimeout(() => {
        window.location.href = WINDOWS_URL;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = {
    Windows: [
      {
        num: '01',
        title: 'Open',
        desc: 'Open the QueueIt Setup.exe file from the downloads bar at the bottom of your browser.',
        hint: "Can't find it? Check your Downloads folder.",
        color: 'var(--primary)',
      },
      {
        num: '02',
        title: 'Allow',
        desc: 'If Windows SmartScreen appears, click "More info" then "Run anyway" to proceed.',
        hint: 'This is normal for new apps.',
        color: 'var(--cyan)',
      },
      {
        num: '03',
        title: 'Launch',
        desc: 'The installer will finish in seconds. QueueIt will open automatically when done.',
        hint: 'Login with your admin password to get started.',
        color: '#1DB954',
      },
    ],
    Mac: [
      {
        num: '01',
        title: 'Open',
        desc: 'Open the QueueIt.dmg file from your Downloads folder.',
        hint: 'Double-click the downloaded file.',
        color: 'var(--primary)',
      },
      {
        num: '02',
        title: 'Drag',
        desc: 'Drag QueueIt into the Applications folder in the window that appears.',
        hint: 'Standard macOS installation.',
        color: 'var(--cyan)',
      },
      {
        num: '03',
        title: 'Launch',
        desc: 'Open QueueIt from Applications. If blocked, go to System Preferences > Security to allow it.',
        hint: 'Right-click > Open also works.',
        color: '#1DB954',
      },
    ],
    Android: [
      {
        num: '01',
        title: 'Open',
        desc: 'Visit queueit.live/admin in Chrome on your Android device.',
        hint: 'Use Chrome browser for best results.',
        color: 'var(--primary)',
      },
      {
        num: '02',
        title: 'Install',
        desc: 'Tap the menu (3 dots) and select "Add to Home Screen" or "Install App".',
        hint: 'Chrome may show an install banner automatically.',
        color: 'var(--cyan)',
      },
      {
        num: '03',
        title: 'Launch',
        desc: 'Open QueueIt from your home screen. It works like a native app — no browser bar.',
        hint: 'Login with your admin password.',
        color: '#1DB954',
      },
    ],
    iOS: [
      {
        num: '01',
        title: 'Open',
        desc: 'Visit queueit.live/admin in Safari on your iPhone or iPad.',
        hint: 'Must use Safari — not Chrome or Firefox.',
        color: 'var(--primary)',
      },
      {
        num: '02',
        title: 'Share',
        desc: 'Tap the Share button (square with arrow) at the bottom of Safari.',
        hint: 'Scroll down in the share menu if needed.',
        color: 'var(--cyan)',
      },
      {
        num: '03',
        title: 'Add',
        desc: 'Tap "Add to Home Screen" and confirm. QueueIt appears as an app on your home screen.',
        hint: 'Login with your admin password.',
        color: '#1DB954',
      },
    ],
  };

  const currentSteps = steps[os] || steps.Windows;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="glass-panel">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline">
            <img src="/queueit-icon.png" alt="" className="w-7 h-7" />
            <span className="font-cyber text-lg font-bold text-white">QUEUE<span className="text-[var(--primary)]">IT</span></span>
          </a>
          <a href="/downloads" className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-[0.1em] no-underline hover:text-[var(--cyan)] transition-colors">
            Other platforms
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--cyan)]/5 via-transparent to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 max-w-[600px] mx-auto">
          {/* Icon with pulse */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-[var(--cyan)]/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-full h-full border-2 border-[var(--cyan)] flex items-center justify-center bg-[var(--bg)]">
              <ArrowDown className="w-10 h-10 text-[var(--cyan)]" />
            </div>
          </div>

          <h1 className="font-cyber font-black text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
            <span className="text-[var(--primary)]">Thanks</span> for<br />downloading!
          </h1>
          <p className="font-cyber text-xl md:text-2xl text-white/80 mb-6">Just a few steps left</p>

          <div className="font-mono text-sm text-[var(--text-muted)] space-y-1">
            <p>
              Your download will begin automatically. If it didn't start,{' '}
              <a href={WINDOWS_URL} className="text-[var(--cyan)] underline hover:text-[var(--primary)] transition-colors">
                download manually
              </a>.
            </p>
            <p>
              Need a different version?{' '}
              <a href="/downloads#download" className="text-[var(--cyan)] underline hover:text-[var(--primary)] transition-colors">
                Find QueueIt for other platforms
              </a>.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="px-6 pb-24 md:pb-32 max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)]">
          {currentSteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              className="bg-[var(--surface)] p-8 relative group hover:bg-[var(--surface-elevated)] transition-colors"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: step.color }} />

              <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: step.color }}>
                STEP {step.num}
              </div>

              <h3 className="font-cyber text-3xl font-bold mb-4">{step.title}</h3>

              <p className="font-mono text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                {step.desc}
              </p>

              <p className="font-mono text-xs transition-colors" style={{ color: step.color }}>
                {step.hint}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center">
        <p className="font-mono text-xs text-[var(--text-muted)]">&copy; 2026 QueueIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PostDownloadPage;
