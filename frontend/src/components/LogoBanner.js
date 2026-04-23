const LogoBanner = ({ size = 'md', variant = 'dark', className = '' }) => {
  const sizes = {
    xs: { text: 'text-sm', tracking: 'tracking-[2px]', pad: 'px-1 py-0.5' },
    sm: { text: 'text-lg', tracking: 'tracking-[3px]', pad: 'px-1.5 py-0.5' },
    md: { text: 'text-2xl', tracking: 'tracking-[4px]', pad: 'px-2 py-1' },
    lg: { text: 'text-4xl', tracking: 'tracking-[6px]', pad: 'px-2.5 py-1' },
    xl: { text: 'text-5xl', tracking: 'tracking-[8px]', pad: 'px-3 py-1.5' },
  };

  const s = sizes[size] || sizes.md;
  const isDark = variant === 'dark';

  return (
    <span className={`font-cyber font-black inline-flex items-baseline ${s.text} ${s.tracking} ${className}`} data-testid="logo-banner">
      <span className={isDark ? 'text-[#FCE300]' : 'text-[#0a0a0a]'}>QUEUE</span>
      <span className={`${s.pad} bg-[#00f0ff] text-[#0a0a0a] shadow-[0_0_12px_rgba(0,240,255,0.4)]`}>IT</span>
    </span>
  );
};

export default LogoBanner;
