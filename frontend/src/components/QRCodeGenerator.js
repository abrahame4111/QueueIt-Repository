import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, QrCode, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 1024;
    canvas.width = size;
    canvas.height = size + 120;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code centered
      const padding = 80;
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

      // Add venue name or "QueueIt" below
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(venueName || 'Scan to Request Songs', size / 2, size + 20);

      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('Powered by QueueIt', size / 2, size + 60);

      const link = document.createElement('a');
      link.download = `queueit-qr${venueName ? '-' + venueName.toLowerCase().replace(/\s+/g, '-') : ''}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>QueueIt QR Code</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;">
          <h1 style="font-size:48px;margin-bottom:8px;">${venueName || 'Request a Song'}</h1>
          <p style="font-size:24px;color:#666;margin-bottom:40px;">Scan the QR code below</p>
          ${svgData}
          <p style="font-size:18px;color:#999;margin-top:40px;">Powered by QueueIt</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="bg-surface border-white/10" data-testid="qr-code-generator">
      <CardHeader>
        <CardTitle className="uppercase tracking-wider flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR CODE GENERATOR
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Preview */}
          <div className="flex flex-col items-center gap-4">
            <div
              ref={qrRef}
              className="bg-white p-6 rounded-xl"
              data-testid="qr-code-preview"
            >
              <QRCodeSVG
                value={customerUrl}
                size={220}
                level="H"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <p className="text-xs text-neutral-500 text-center max-w-[260px] break-all font-mono">
              {customerUrl}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">
                Venue Name (optional)
              </label>
              <Input
                placeholder="e.g. Backpacker's Lounge"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                data-testid="venue-name-input"
              />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <Button
                onClick={handleDownloadQR}
                className="neon-button w-full h-12"
                data-testid="download-qr-button"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  DOWNLOAD PNG
                </span>
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 w-full h-12"
                data-testid="print-qr-button"
              >
                <Printer className="w-4 h-4 mr-2" />
                PRINT QR CODE
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 w-full h-12"
                data-testid="copy-link-button"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'COPIED!' : 'COPY CUSTOMER LINK'}
              </Button>
            </div>

            <p className="text-xs text-neutral-600 mt-2">
              Print this QR code and display it at your venue. When customers scan it, they'll be taken directly to the song request page.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
