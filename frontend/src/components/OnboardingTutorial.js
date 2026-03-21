import { useState } from 'react';
import { Music2, QrCode, ListMusic, Wifi, ArrowRight, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: Music2,
    title: 'Welcome to QueueIt',
    description: 'The smart music queue system for your venue. Let your guests request songs while you stay in control.',
    accent: '#00F0FF',
  },
  {
    icon: Wifi,
    title: 'Connect Spotify',
    description: 'Link your Spotify Premium account to control playback. Click "Login with Spotify" on the dashboard to get started.',
    accent: '#1DB954',
  },
  {
    icon: QrCode,
    title: 'Generate QR Codes',
    description: 'Create a QR code for your venue and print it out. When guests scan it, they can browse and request songs instantly.',
    accent: '#00F0FF',
  },
  {
    icon: ListMusic,
    title: 'Manage the Queue',
    description: 'Songs appear in your queue as guests request them. Skip, remove, or clear — you\'re always in control of the vibe.',
    accent: '#FF6B6B',
  },
  {
    icon: CheckCircle,
    title: 'You\'re All Set!',
    description: 'That\'s everything you need. Display your QR code, connect Spotify, and let your guests DJ their experience.',
    accent: '#00F0FF',
  },
];

const OnboardingTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('queueit_onboarding_done', 'true');
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('queueit_onboarding_done', 'true');
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      data-testid="onboarding-overlay"
    >
      <div className="relative w-full max-w-md mx-4">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-neutral-500 hover:text-white transition-colors flex items-center gap-1 text-sm"
          data-testid="onboarding-skip"
        >
          Skip tutorial <X className="w-4 h-4" />
        </button>

        {/* Card */}
        <div
          className="bg-surface border border-white/10 rounded-2xl p-8 text-center"
          style={{ boxShadow: `0 0 60px ${step.accent}15` }}
        >
          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: step.accent }}
            />
          </div>

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}30` }}
          >
            <Icon className="w-10 h-10" style={{ color: step.accent }} />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
          <p className="text-neutral-400 leading-relaxed mb-8">{step.description}</p>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentStep ? '24px' : '8px',
                  background: i === currentStep ? step.accent : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <Button
            onClick={handleNext}
            className="w-full h-14 text-base font-bold"
            style={{
              background: step.accent,
              color: '#000',
            }}
            data-testid="onboarding-next"
          >
            <span className="flex items-center justify-center gap-2">
              {isLastStep ? 'GET STARTED' : 'NEXT'}
              {!isLastStep && <ArrowRight className="w-5 h-5" />}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
