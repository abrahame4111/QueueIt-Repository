import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, QrCode, Printer } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const QRCodeGenerator = () => {
  const [venueName, setVenueName] = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);
  const customerUrl = `${BACKEND_URL}/`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerUrl);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 1024;
    canvas.width = size; canvas.height = size + 120;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const p = 80; ctx.drawImage(img, p, p, size - p * 2, size - p * 2);
      ctx.fillStyle = '#00F0FF'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
      ctx.fillText(venueName || 'SCAN TO REQUEST SONGS', size / 2, size + 20);
      ctx.fillStyle = '#666'; ctx.font = '24px monospace'; ctx.fillText('POWERED BY QUEUEIT', size / 2, size + 60);
      const link = document.createElement('a');
      link.download = `queueit-qr${venueName ? '-' + venueName.toLowerCase().replace(/\s+/g, '-') : ''}.png`;
      link.href = canvas.toDataURL('image/png'); link.click();
      toast.success('QR code downloaded');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>QueueIt QR</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:monospace;background:#050505;color:#00F0FF;">
      <h1 style="font-size:48px;margin-bottom:8px;">${venueName || 'REQUEST A SONG'}</h1>
      <p style="font-size:24px;color:#666;margin-bottom:40px;">Scan the QR code below</p>${svgData}
      <p style="font-size:18px;color:#666;margin-top:40px;">POWERED BY QUEUEIT</p></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="cyber-card hud-corners" data-testid="qr-code-generator">
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-[var(--cyan)]" />
          <span className="font-cyber text-lg font-bold text-white">QR GENERATOR</span>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Preview */}
          <div className="flex flex-col items-center gap-4">
            <div ref={qrRef} className="bg-[var(--bg)] p-6 border border-[var(--border)]" data-testid="qr-code-preview">
              <QRCodeSVG value={customerUrl} size={200} level="H" includeMargin={false} fgColor="#00F0FF" bgColor="#050505" />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center max-w-[240px] break-all font-mono">{customerUrl}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 block">Venue Name</label>
              <input
                placeholder="// e.g. BACKPACKER'S LOUNGE"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full bg-black border border-[var(--border)] text-white placeholder:text-white/20 p-3 font-mono text-sm focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
                data-testid="venue-name-input"
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button onClick={handleDownloadQR} className="neon-button w-full h-12" data-testid="download-qr-button">
                <span className="flex items-center justify-center gap-2"><Download className="w-4 h-4" /> DOWNLOAD PNG</span>
              </button>
              <button onClick={handlePrint} className="border border-[var(--border)] text-white hover:bg-white/5 w-full h-12 font-mono text-xs uppercase tracking-wider transition-colors duration-200" data-testid="print-qr-button">
                <span className="flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> PRINT</span>
              </button>
              <button onClick={handleCopyLink} className="border border-[var(--border)] text-white hover:bg-white/5 w-full h-12 font-mono text-xs uppercase tracking-wider transition-colors duration-200" data-testid="copy-link-button">
                <span className="flex items-center justify-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'COPIED!' : 'COPY LINK'}
                </span>
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-mono mt-2 opacity-50">
              Display this QR at your venue. Customers scan to request songs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
