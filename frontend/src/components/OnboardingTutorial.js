import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, QrCode, List, Wifi, ArrowRight, X, CheckCircle, Smartphone, Download, Share2 } from 'lucide-react';

const STEPS_DESKTOP = [
  { icon: Music2, title: 'WELCOME TO QUEUEIT', desc: 'The smart music queue system for your venue. Let your guests request songs while you stay in control.', color: 'var(--cyan)' },
  { icon: Wifi, title: 'CONNECT SPOTIFY', desc: 'Link your Spotify Premium account to control playback. Click the connect button on the dashboard.', color: '#1DB954' },
  { icon: QrCode, title: 'GENERATE QR CODES', desc: 'Create a QR code for your venue and print it out. Guests scan it to browse and request songs.', color: 'var(--primary)' },
  { icon: List, title: 'MANAGE THE QUEUE', desc: 'Songs appear in your queue as guests request them. Skip, remove, or purge — you control the vibe.', color: 'var(--accent)' },
  { icon: CheckCircle, title: 'SYSTEM READY', desc: 'That\'s everything. Display your QR, connect Spotify, and let your guests DJ their experience.', color: 'var(--cyan)' },
];

const STEPS_MOBILE_ANDROID = [
  { icon: Music2, title: 'WELCOME TO QUEUEIT', desc: 'The smart music queue system for your venue. Manage everything from your phone.', color: 'var(--cyan)' },
  { icon: Download, title: 'INSTALL THE APP', desc: 'Tap the browser menu (3 dots at top right) and select "Add to Home Screen" or "Install App". QueueIt will appear as a native app.', color: 'var(--primary)' },
  { icon: Wifi, title: 'CONNECT SPOTIFY', desc: 'Go to Settings tab (gear icon) and tap "Connect Spotify". Login with your Spotify Premium account.', color: '#1DB954' },
  { icon: QrCode, title: 'GENERATE QR CODE', desc: 'Go to QR tab and generate a code for your venue. Download or print it. Guests scan it to request songs at queueit.live/request.', color: 'var(--primary)' },
  { icon: Smartphone, title: 'CONTROL FROM ANYWHERE', desc: 'Use the Player tab to control playback, Queue tab to manage requests, and Settings to switch Spotify accounts anytime.', color: 'var(--cyan)' },
  { icon: CheckCircle, title: 'ALL SET!', desc: 'Display your QR code at the venue, keep QueueIt open on your phone, and let your guests set the vibe.', color: 'var(--cyan)' },
];

const STEPS_MOBILE_IOS = [
  { icon: Music2, title: 'WELCOME TO QUEUEIT', desc: 'The smart music queue system for your venue. Manage everything from your iPhone.', color: 'var(--cyan)' },
  { icon: Share2, title: 'INSTALL THE APP', desc: 'Tap the Share button (square with arrow at the bottom of Safari) then scroll down and tap "Add to Home Screen". QueueIt will appear as an app.', color: 'var(--primary)' },
  { icon: Wifi, title: 'CONNECT SPOTIFY', desc: 'Go to Settings tab (gear icon) and tap "Connect Spotify". Login with your Spotify Premium account.', color: '#1DB954' },
  { icon: QrCode, title: 'GENERATE QR CODE', desc: 'Go to QR tab and generate a code for your venue. Download or print it. Guests scan it to request songs at queueit.live/request.', color: 'var(--primary)' },
  { icon: Smartphone, title: 'CONTROL FROM ANYWHERE', desc: 'Use the Player tab to control playback, Queue tab to manage requests, and Settings to switch Spotify accounts anytime.', color: 'var(--cyan)' },
  { icon: CheckCircle, title: 'ALL SET!', desc: 'Display your QR code at the venue, keep QueueIt open on your phone, and let your guests set the vibe.', color: 'var(--cyan)' },
];

const OnboardingTutorial = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState(STEPS_DESKTOP);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setSteps(STEPS_MOBILE_IOS);
      } else {
        setSteps(STEPS_MOBILE_ANDROID);
      }
    } else {
      setSteps(STEPS_DESKTOP);
    }
  }, []);

  const s = steps[step];
  const Icon = s.icon;
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const next = () => {
    if (isLast) {
      localStorage.setItem('queueit_onboarding_done', 'true');
      onComplete();
    } else {
      setStep(p => p + 1);
    }
  };

  const skip = () => {
    localStorage.setItem('queueit_onboarding_done', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(16px)' }} data-testid="onboarding-overlay">
      <div className="relative w-full max-w-md mx-4">
        <button onClick={skip} className="absolute -top-12 right-0 text-[var(--text-muted)] hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1" data-testid="onboarding-skip">
          SKIP <X className="w-4 h-4" />
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="cyber-card hud-corners p-8 text-center">
            {/* Progress */}
            <div className="h-0.5 bg-white/10 mb-8 overflow-hidden">
              <motion.div className="h-full" style={{ background: s.color }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            {/* Step counter */}
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
              STEP {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </div>
            {/* Icon */}
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 border" style={{ borderColor: `${s.color}30`, background: `${s.color}10` }}>
              <Icon className="w-10 h-10" style={{ color: s.color }} />
            </div>
            {/* Content */}
            <h2 className="font-cyber text-xl sm:text-2xl font-bold text-white mb-3">{s.title}</h2>
            <p className="text-[var(--text-muted)] font-mono text-sm leading-relaxed mb-8">{s.desc}</p>
            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <div key={i} className="h-0.5 transition-all duration-300" style={{ width: i === step ? '24px' : '8px', background: i === step ? s.color : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            {/* CTA */}
            <button onClick={next} className="neon-button w-full h-14 text-base font-bold" data-testid="onboarding-next">
              <span className="flex items-center justify-center gap-2">
                {isLast ? 'GET STARTED' : 'NEXT'}
                {!isLast && <ArrowRight className="w-5 h-5" />}
              </span>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
