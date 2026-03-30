import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, QrCode, List, Wifi, ArrowRight, X, CheckCircle, Download, Zap } from 'lucide-react';

const STEPS_DESKTOP = [
  { icon: Music2, title: 'WELCOME', desc: 'The smart music queue for your venue. Guests request songs while you stay in control.', color: 'var(--cyan)' },
  { icon: Wifi, title: 'CONNECT SPOTIFY', desc: 'Link your Spotify Premium account to control playback from the dashboard.', color: '#1DB954' },
  { icon: List, title: 'MANAGE QUEUE', desc: 'Songs appear as guests request them. Skip, remove, or clear the queue anytime.', color: 'var(--accent)' },
  { icon: QrCode, title: 'QR CODES', desc: 'Generate a QR code for your venue. Guests scan it to browse and request songs.', color: 'var(--primary)' },
  { icon: CheckCircle, title: 'ALL SET', desc: 'Display your QR, connect Spotify, and let your guests set the vibe.', color: 'var(--cyan)' },
];

const STEPS_MOBILE = [
  { icon: Music2, title: 'WELCOME', desc: 'The smart music queue for your venue. Manage everything from your phone.', color: 'var(--cyan)' },
  { icon: Download, title: 'INSTALL APP', desc: null, color: 'var(--primary)' },
  { icon: Wifi, title: 'CONNECT SPOTIFY', desc: 'Go to the SYS tab and tap Connect Spotify to link your account.', color: '#1DB954' },
  { icon: List, title: 'MANAGE QUEUE', desc: 'Use the QUEUE tab to manage incoming song requests.', color: 'var(--accent)' },
  { icon: QrCode, title: 'QR CODE', desc: 'Use the QR tab to generate a code for your venue.', color: 'var(--primary)' },
  { icon: CheckCircle, title: 'ALL SET', desc: 'Display your QR code and let guests set the vibe.', color: 'var(--cyan)' },
];

const OnboardingTutorial = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const steps = isMobile ? STEPS_MOBILE : STEPS_DESKTOP;
  const s = steps[step];
  const Icon = s.icon;
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const getInstallDesc = useCallback(() => {
    if (isIOS) return 'Tap the Share button at the bottom of Safari, then tap "Add to Home Screen".';
    return 'Tap the browser menu (3 dots) and select "Add to Home Screen" or "Install App".';
  }, [isIOS]);

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

  const desc = s.desc || (isMobile && s.title === 'INSTALL APP' ? getInstallDesc() : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="onboarding-overlay"
      style={{ background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(12px)' }}>

      {/* Skip button */}
      <button onClick={skip} data-testid="onboarding-skip"
        className="fixed top-3 right-3 z-[53] text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 px-2.5 py-1.5 border border-white/10 hover:border-white/30 transition-colors">
        SKIP <X className="w-3 h-3" />
      </button>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          <div className="cyber-card hud-corners p-5 sm:p-6" style={{ borderColor: `${s.color}40` }}>
            {/* Progress bar */}
            <div className="h-0.5 bg-white/10 mb-5 overflow-hidden">
              <motion.div className="h-full" style={{ background: s.color }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>

            {/* Step counter */}
            <div className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3">
              {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 flex items-center justify-center border shrink-0" style={{ borderColor: `${s.color}30`, background: `${s.color}10` }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <h2 className="font-cyber text-base sm:text-lg font-bold text-white">{s.title}</h2>
            </div>

            {/* Description */}
            <p className="text-white/50 font-mono text-xs sm:text-sm leading-relaxed mb-5 ml-12">{desc}</p>

            {/* Dots + CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className="h-0.5 transition-all duration-300"
                    style={{ width: i === step ? '16px' : '5px', background: i === step ? s.color : 'rgba(255,255,255,0.12)' }} />
                ))}
              </div>
              <button onClick={next} className="neon-button px-5 py-2 text-xs font-bold" data-testid="onboarding-next">
                <span className="flex items-center gap-1.5">
                  {isLast ? <><Zap className="w-3.5 h-3.5" /> START</> : <>NEXT <ArrowRight className="w-3.5 h-3.5" /></>}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTutorial;
