import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, QrCode, List, Wifi, ArrowRight, X, CheckCircle, Smartphone, Download, Share2, Zap } from 'lucide-react';

const STEPS_DESKTOP = [
  { icon: Music2, title: 'WELCOME TO QUEUEIT', desc: 'The smart music queue system for your venue. Let your guests request songs while you stay in control.', color: 'var(--cyan)', target: null },
  { icon: Wifi, title: 'CONNECT SPOTIFY', desc: 'Link your Spotify Premium account to control playback. Click the Spotify status button in the header.', color: '#1DB954', target: '[data-testid="logout-button"]', position: 'below' },
  { icon: List, title: 'MANAGE THE QUEUE', desc: 'Songs appear in your queue as guests request them. Skip, remove, or purge — you control the vibe.', color: 'var(--accent)', target: '[data-testid="clear-queue-button"]', position: 'below' },
  { icon: QrCode, title: 'GENERATE QR CODES', desc: 'Create a QR code for your venue and print it out. Guests scan it to browse and request songs.', color: 'var(--primary)', target: '[data-testid="qr-code-generator"]', position: 'above' },
  { icon: CheckCircle, title: 'SYSTEM READY', desc: 'That\'s everything. Display your QR, connect Spotify, and let your guests DJ their experience.', color: 'var(--cyan)', target: null },
];

const STEPS_MOBILE = [
  { icon: Music2, title: 'WELCOME TO QUEUEIT', desc: 'The smart music queue system for your venue. Manage everything from your phone.', color: 'var(--cyan)', target: null },
  { icon: Download, title: 'INSTALL THE APP', desc: null, color: 'var(--primary)', target: null },
  { icon: Wifi, title: 'CONNECT SPOTIFY', desc: 'Go to the SYS tab and tap "Connect Spotify" to link your Spotify Premium account.', color: '#1DB954', target: '[data-testid="mobile-tab-settings"]', position: 'above' },
  { icon: List, title: 'MANAGE THE QUEUE', desc: 'Use the QUEUE tab to see and manage incoming song requests from your guests.', color: 'var(--accent)', target: '[data-testid="mobile-tab-queue"]', position: 'above' },
  { icon: QrCode, title: 'QR CODE', desc: 'Use the QR tab to generate a code for your venue. Guests scan it to request songs.', color: 'var(--primary)', target: '[data-testid="mobile-tab-qr"]', position: 'above' },
  { icon: CheckCircle, title: 'ALL SET!', desc: 'Display your QR code at the venue, keep QueueIt open, and let your guests set the vibe.', color: 'var(--cyan)', target: null },
];

const OnboardingTutorial = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState(null);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const steps = isMobile ? STEPS_MOBILE : STEPS_DESKTOP;
  const s = steps[step];
  const Icon = s.icon;
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const getInstallDesc = useCallback(() => {
    if (isIOS) return 'Tap the Share button (square with arrow at the bottom of Safari), then scroll down and tap "Add to Home Screen".';
    return 'Tap the browser menu (3 dots at top right) and select "Add to Home Screen" or "Install App".';
  }, [isIOS]);

  // Update spotlight position when step changes
  useEffect(() => {
    if (!s.target) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(s.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    } else {
      setSpotlightRect(null);
    }
  }, [step, s.target]);

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

  const desc = s.desc || (isMobile && s.title === 'INSTALL THE APP' ? getInstallDesc() : '');

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!spotlightRect) return {};
    const pad = 16;
    if (s.position === 'above') {
      return {
        position: 'fixed',
        bottom: window.innerHeight - spotlightRect.top + pad,
        left: Math.max(16, Math.min(spotlightRect.left + spotlightRect.width / 2 - 180, window.innerWidth - 376)),
        width: '360px',
        zIndex: 52,
      };
    }
    return {
      position: 'fixed',
      top: spotlightRect.top + spotlightRect.height + pad,
      left: Math.max(16, Math.min(spotlightRect.left + spotlightRect.width / 2 - 180, window.innerWidth - 376)),
      width: '360px',
      zIndex: 52,
    };
  };

  return (
    <div className="fixed inset-0 z-50" data-testid="onboarding-overlay">
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0" style={{ background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(8px)' }}>
        {spotlightRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute border-2 rounded"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              borderColor: s.color,
              boxShadow: `0 0 20px ${s.color}40, 0 0 60px ${s.color}20, inset 0 0 20px ${s.color}10`,
              background: `${s.color}08`,
            }}
          />
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={skip}
        className="fixed top-4 right-4 z-[53] text-[var(--text-muted)] hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1 px-3 py-2 border border-white/10 hover:border-white/30 transition-colors"
        data-testid="onboarding-skip"
      >
        SKIP <X className="w-4 h-4" />
      </button>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: spotlightRect ? 10 : 0, scale: spotlightRect ? 0.95 : 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          style={spotlightRect ? getTooltipStyle() : {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? 'calc(100% - 32px)' : '400px',
            maxWidth: '400px',
            zIndex: 52,
          }}
        >
          <div className="cyber-card hud-corners p-6" style={{ borderColor: `${s.color}40` }}>
            {/* Progress bar */}
            <div className="h-0.5 bg-white/10 mb-6 overflow-hidden">
              <motion.div className="h-full" style={{ background: s.color }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>

            {/* Step counter */}
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">
              STEP {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center border shrink-0" style={{ borderColor: `${s.color}30`, background: `${s.color}10` }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <h2 className="font-cyber text-lg font-bold text-white">{s.title}</h2>
            </div>

            {/* Description */}
            <p className="text-[var(--text-muted)] font-mono text-sm leading-relaxed mb-5 ml-[52px]">{desc}</p>

            {/* Dots + CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className="h-0.5 transition-all duration-300" style={{ width: i === step ? '20px' : '6px', background: i === step ? s.color : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
              <button onClick={next} className="neon-button px-6 py-2.5 text-sm font-bold" data-testid="onboarding-next">
                <span className="flex items-center gap-2">
                  {isLast ? <><Zap className="w-4 h-4" /> START</> : <>NEXT <ArrowRight className="w-4 h-4" /></>}
                </span>
              </button>
            </div>
          </div>

          {/* Arrow pointing to target */}
          {spotlightRect && (
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                [s.position === 'above' ? 'bottom' : 'top']: '-8px',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                [s.position === 'above' ? 'borderTop' : 'borderBottom']: `8px solid ${s.color}40`,
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTutorial;
