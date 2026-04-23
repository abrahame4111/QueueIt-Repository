import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Sticker, CreditCard, FileText, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CUSTOMER_URL = 'https://queueit.live/request';
const SITE_URL = 'https://queueit.live';

/* ═══════════════════════════════════════════
   SHARED STYLES & CONSTANTS
   ═══════════════════════════════════════════ */
const YELLOW = '#FCE300';
const BLACK = '#0a0a0a';
const CYAN = '#00f0ff';
const DARK = '#111';

const printStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @media print { body { margin: 0; } @page { margin: 0; } }
`;

/* ═══════════════════════════════════════════
   QR SVG GENERATOR (returns SVG string)
   ═══════════════════════════════════════════ */
const getQRSvgString = (size, fg, bg) => {
  const div = document.createElement('div');
  const { createRoot } = require('react-dom/client');
  // We'll use a data URL approach instead
  return null; // handled inline
};

/* ═══════════════════════════════════════════
   PRINT HELPERS
   ═══════════════════════════════════════════ */
const openPrintWindow = (html, title, pageSize = 'A4', orientation = 'portrait') => {
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>${printStyles}
    @page { size: ${pageSize} ${orientation}; margin: 0; }
    </style></head><body>${html}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
};

/* ═══════════════════════════════════════════
   STICKERS GENERATOR
   ═══════════════════════════════════════════ */
const printStickers = (venueName) => {
  const sticker = (i) => `
    <div style="width:240px;height:240px;background:${YELLOW};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;border:2px solid ${BLACK};position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${CYAN};box-shadow:0 0 8px ${CYAN};"></div>
      <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:${BLACK};letter-spacing:2px;margin-bottom:6px;">QUEUE<span style="color:${CYAN};text-shadow:0 0 4px ${CYAN};">IT</span></div>
      <div style="background:${BLACK};padding:10px;margin:4px 0;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(CUSTOMER_URL)}&bgcolor=0a0a0a&color=00f0ff&format=svg" width="140" height="140" />
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:${BLACK};font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;">${venueName || 'SCAN TO REQUEST SONGS'}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:5px;color:#333;letter-spacing:1px;margin-top:2px;">QUEUEIT.LIVE</div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${CYAN};box-shadow:0 0 8px ${CYAN};"></div>
    </div>`;

  const html = `
    <div style="width:210mm;min-height:297mm;padding:10mm;display:flex;flex-wrap:wrap;gap:8mm;justify-content:center;align-content:flex-start;background:white;">
      ${Array(9).fill(0).map((_, i) => sticker(i)).join('')}
      <div style="width:100%;text-align:center;margin-top:8mm;font-family:'JetBrains Mono',monospace;font-size:8px;color:#999;letter-spacing:2px;">CUT ALONG BORDERS &bull; QUEUEIT STARTER KIT</div>
    </div>`;
  openPrintWindow(html, 'QueueIt Stickers');
};

/* ═══════════════════════════════════════════
   STANDING CARD GENERATOR (Table Tent)
   ═══════════════════════════════════════════ */
const printStandingCard = (venueName) => {
  const cardSide = (isBack) => `
    <div style="width:148mm;height:105mm;background:${isBack ? BLACK : YELLOW};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:10mm;${isBack ? '' : 'border-bottom:1px dashed #ccc;'}">
      ${!isBack ? `
        <!-- FRONT -->
        <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${CYAN};box-shadow:0 0 12px ${CYAN};"></div>
        <div style="position:absolute;top:8mm;left:8mm;font-family:'JetBrains Mono',monospace;font-size:6px;color:#333;letter-spacing:3px;">SYS.ID://VENUE.REQUEST</div>
        <div style="position:absolute;top:8mm;right:8mm;width:8px;height:8px;background:${CYAN};"></div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:28px;color:${BLACK};letter-spacing:4px;margin-bottom:2mm;">QUEUE<span style="background:${CYAN};color:${BLACK};padding:0 4px;text-shadow:none;">IT</span></div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:#333;letter-spacing:4px;margin-bottom:5mm;text-transform:uppercase;">SCAN &bull; QUEUE &bull; VIBE</div>
        <div style="background:${BLACK};padding:12px;border:2px solid ${CYAN};box-shadow:0 0 20px ${CYAN}40;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(CUSTOMER_URL)}&bgcolor=0a0a0a&color=00f0ff&format=svg" width="160" height="160" />
        </div>
        <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;color:${BLACK};letter-spacing:2px;margin-top:4mm;text-transform:uppercase;">${venueName || 'REQUEST YOUR FAVORITE SONGS'}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:#555;margin-top:2mm;letter-spacing:1px;">QUEUEIT.LIVE/REQUEST</div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:${CYAN};box-shadow:0 0 12px ${CYAN};"></div>
      ` : `
        <!-- BACK -->
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${YELLOW};"></div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:20px;color:${YELLOW};letter-spacing:3px;">QUEUE<span style="color:${CYAN};">IT</span></div>
        <div style="width:40px;height:2px;background:${CYAN};margin:4mm 0;box-shadow:0 0 6px ${CYAN};"></div>
        <div style="font-family:'Rajdhani',sans-serif;font-weight:500;font-size:10px;color:#888;text-align:center;line-height:1.8;letter-spacing:1px;">
          1. SCAN THE QR CODE<br>2. SEARCH YOUR SONG<br>3. TAP ADD TO QUEUE<br>4. ENJOY THE MUSIC
        </div>
        <div style="margin-top:5mm;font-family:'JetBrains Mono',monospace;font-size:6px;color:#555;letter-spacing:2px;">POWERED BY QUEUEIT &bull; QUEUEIT.LIVE</div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${YELLOW};"></div>
      `}
    </div>`;

  const html = `
    <div style="width:148mm;min-height:210mm;margin:auto;">
      ${cardSide(false)}
      ${cardSide(true)}
      <div style="text-align:center;padding:3mm;font-family:'JetBrains Mono',monospace;font-size:7px;color:#999;letter-spacing:2px;">FOLD ALONG DASHED LINE &bull; STAND ON TABLE</div>
    </div>`;
  openPrintWindow(html, 'QueueIt Standing Card', 'A5', 'portrait');
};

/* ═══════════════════════════════════════════
   A4 POSTER GENERATOR
   ═══════════════════════════════════════════ */
const printPoster = (venueName) => {
  const html = `
    <div style="width:210mm;height:297mm;background:${YELLOW};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:15mm;">
      <!-- Grid overlay -->
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 29.5mm,${BLACK}10 29.5mm,${BLACK}10 30mm),repeating-linear-gradient(90deg,transparent,transparent 29.5mm,${BLACK}10 29.5mm,${BLACK}10 30mm);pointer-events:none;"></div>
      <!-- Top accent -->
      <div style="position:absolute;top:0;left:0;right:0;height:6px;background:${CYAN};box-shadow:0 0 20px ${CYAN};"></div>
      <!-- Corner markers -->
      <div style="position:absolute;top:8mm;left:8mm;width:20mm;height:20mm;border-top:3px solid ${BLACK};border-left:3px solid ${BLACK};"></div>
      <div style="position:absolute;top:8mm;right:8mm;width:20mm;height:20mm;border-top:3px solid ${BLACK};border-right:3px solid ${BLACK};"></div>
      <div style="position:absolute;bottom:8mm;left:8mm;width:20mm;height:20mm;border-bottom:3px solid ${BLACK};border-left:3px solid ${BLACK};"></div>
      <div style="position:absolute;bottom:8mm;right:8mm;width:20mm;height:20mm;border-bottom:3px solid ${BLACK};border-right:3px solid ${BLACK};"></div>
      <!-- System ID -->
      <div style="position:absolute;top:12mm;left:50%;transform:translateX(-50%);font-family:'JetBrains Mono',monospace;font-size:7px;color:#333;letter-spacing:4px;">SYS.PROTOCOL://MUSIC.REQUEST.V1</div>
      <!-- Logo -->
      <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:72px;color:${BLACK};letter-spacing:8px;line-height:1;margin-bottom:3mm;">
        QUEUE<span style="background:${CYAN};color:${BLACK};padding:0 8px;">IT</span>
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#333;letter-spacing:8px;text-transform:uppercase;margin-bottom:12mm;">THE SMART MUSIC QUEUE</div>
      <!-- Divider -->
      <div style="width:60mm;height:2px;background:${BLACK};margin-bottom:12mm;position:relative;">
        <div style="position:absolute;left:50%;top:-3px;transform:translateX(-50%);width:8px;height:8px;background:${CYAN};box-shadow:0 0 8px ${CYAN};"></div>
      </div>
      <!-- QR -->
      <div style="background:${BLACK};padding:16px;border:3px solid ${CYAN};box-shadow:0 0 30px ${CYAN}50;margin-bottom:8mm;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(CUSTOMER_URL)}&bgcolor=0a0a0a&color=00f0ff&format=svg" width="280" height="280" />
      </div>
      <!-- CTA -->
      <div style="background:${BLACK};padding:8px 24px;margin-bottom:6mm;">
        <div style="font-family:'Orbitron',sans-serif;font-weight:700;font-size:18px;color:${YELLOW};letter-spacing:4px;">SCAN TO REQUEST SONGS</div>
      </div>
      <!-- Venue name -->
      <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:16px;color:${BLACK};letter-spacing:3px;text-transform:uppercase;margin-bottom:4mm;">${venueName || ''}</div>
      <!-- Steps -->
      <div style="display:flex;gap:12mm;margin-top:4mm;">
        ${['SCAN QR', 'SEARCH SONG', 'ADD TO QUEUE'].map((step, i) => `
          <div style="text-align:center;">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:28px;color:${CYAN};text-shadow:0 0 6px ${CYAN};">${String(i+1).padStart(2,'0')}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:${BLACK};letter-spacing:2px;font-weight:700;margin-top:2px;">${step}</div>
          </div>
        `).join('')}
      </div>
      <!-- Footer -->
      <div style="position:absolute;bottom:12mm;font-family:'JetBrains Mono',monospace;font-size:7px;color:#555;letter-spacing:3px;">QUEUEIT.LIVE &bull; POWERED BY QUEUEIT</div>
      <!-- Bottom accent -->
      <div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:${CYAN};box-shadow:0 0 20px ${CYAN};"></div>
    </div>`;
  openPrintWindow(html, 'QueueIt A4 Poster');
};

/* ═══════════════════════════════════════════
   TRI-FOLD BROCHURE GENERATOR
   ═══════════════════════════════════════════ */
const printBrochure = (venueName) => {
  const panelW = '99mm';
  const panelH = '210mm';

  const outsideHtml = `
    <div style="width:297mm;height:210mm;display:flex;position:relative;overflow:hidden;page-break-after:always;">
      <!-- PANEL 1: Back panel (Scope & Limitations) -->
      <div style="width:${panelW};height:${panelH};background:${BLACK};padding:8mm 6mm;display:flex;flex-direction:column;position:relative;border-right:0.5px dashed #333;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${YELLOW};"></div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:800;font-size:11px;color:${YELLOW};letter-spacing:3px;margin-bottom:4mm;">SCOPE & LIMITS</div>
        <div style="width:15mm;height:1.5px;background:${CYAN};margin-bottom:4mm;box-shadow:0 0 4px ${CYAN};"></div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${CYAN};letter-spacing:2px;margin-bottom:2mm;font-weight:700;">WHAT'S INCLUDED</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:#ccc;line-height:1.6;margin-bottom:4mm;">
          &bull; Song search via Spotify catalog<br>
          &bull; Real-time queue management<br>
          &bull; Admin playback controls<br>
          &bull; QR code access for guests<br>
          &bull; Desktop & mobile admin apps<br>
          &bull; Analytics & request tracking
        </div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${CYAN};letter-spacing:2px;margin-bottom:2mm;font-weight:700;">REQUIREMENTS</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:#ccc;line-height:1.6;margin-bottom:4mm;">
          &bull; <span style="color:${YELLOW};font-weight:700;">Spotify Premium account</span> (required)<br>
          &bull; Active internet connection<br>
          &bull; Spotify app open on a device<br>
          &bull; Modern browser (Chrome/Safari)
        </div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${CYAN};letter-spacing:2px;margin-bottom:2mm;font-weight:700;">LIMITATIONS</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:#ccc;line-height:1.6;margin-bottom:4mm;">
          &bull; Spotify Free not supported<br>
          &bull; One admin per venue instance<br>
          &bull; Song availability depends on<br>&nbsp;&nbsp;Spotify regional catalog<br>
          &bull; Queue length: 100 songs max<br>
          &bull; Search limited to 10 results<br>&nbsp;&nbsp;(Spotify API constraint)
        </div>

        <div style="flex:1;"></div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:5.5px;color:#555;letter-spacing:1px;">v1.0 &bull; ${new Date().getFullYear()}</div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${YELLOW};"></div>
      </div>

      <!-- PANEL 2: Inside flap (Support & FAQ) -->
      <div style="width:${panelW};height:${panelH};background:${DARK};padding:8mm 6mm;display:flex;flex-direction:column;position:relative;border-right:0.5px dashed #333;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${CYAN};box-shadow:0 0 8px ${CYAN};"></div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:800;font-size:11px;color:${CYAN};letter-spacing:3px;margin-bottom:4mm;">SUPPORT</div>
        <div style="width:15mm;height:1.5px;background:${YELLOW};margin-bottom:5mm;"></div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${YELLOW};letter-spacing:2px;margin-bottom:2mm;font-weight:700;">COMMON ISSUES</div>

        <div style="margin-bottom:3mm;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:white;font-weight:700;margin-bottom:1mm;">Q: Songs won't play?</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#aaa;line-height:1.5;">Ensure Spotify is open on your device and the correct device is selected in the admin panel.</div>
        </div>

        <div style="margin-bottom:3mm;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:white;font-weight:700;margin-bottom:1mm;">Q: QR code not working?</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#aaa;line-height:1.5;">Check internet connection. The QR links to queueit.live/request which requires an active server.</div>
        </div>

        <div style="margin-bottom:3mm;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:white;font-weight:700;margin-bottom:1mm;">Q: Can guests see the queue?</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#aaa;line-height:1.5;">Yes. The QUEUE tab on the customer page shows all upcoming songs in real-time.</div>
        </div>

        <div style="margin-bottom:3mm;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:white;font-weight:700;margin-bottom:1mm;">Q: How to skip a song?</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#aaa;line-height:1.5;">Admin can press SKIP in the player panel or use NEXT in the queue section.</div>
        </div>

        <div style="margin-bottom:3mm;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:7.5px;color:white;font-weight:700;margin-bottom:1mm;">Q: Password lost?</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#aaa;line-height:1.5;">Default: hostel2024. Change it in Settings after login. Contact support if locked out.</div>
        </div>

        <div style="flex:1;"></div>

        <div style="background:${BLACK};border:1px solid ${CYAN};padding:4mm;text-align:center;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${CYAN};letter-spacing:2px;margin-bottom:2mm;">CUSTOMER SERVICE</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:9px;color:white;font-weight:700;letter-spacing:1px;">QUEUEIT.LIVE</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${CYAN};box-shadow:0 0 8px ${CYAN};"></div>
      </div>

      <!-- PANEL 3: FRONT COVER -->
      <div style="width:${panelW};height:${panelH};background:${YELLOW};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:8mm;">
        <!-- Grid -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 9.5mm,${BLACK}08 9.5mm,${BLACK}08 10mm),repeating-linear-gradient(90deg,transparent,transparent 9.5mm,${BLACK}08 9.5mm,${BLACK}08 10mm);pointer-events:none;"></div>
        <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${CYAN};box-shadow:0 0 12px ${CYAN};"></div>
        <!-- Corner marks -->
        <div style="position:absolute;top:5mm;left:5mm;width:10mm;height:10mm;border-top:2px solid ${BLACK};border-left:2px solid ${BLACK};"></div>
        <div style="position:absolute;top:5mm;right:5mm;width:10mm;height:10mm;border-top:2px solid ${BLACK};border-right:2px solid ${BLACK};"></div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:#333;letter-spacing:4px;margin-bottom:8mm;">STARTER KIT // V1.0</div>

        <div style="background:${BLACK};padding:3mm 5mm;margin-bottom:3mm;">
          <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:36px;color:${YELLOW};letter-spacing:4px;">QUEUE<span style="color:${CYAN};">IT</span></div>
        </div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:7px;color:${BLACK};letter-spacing:5px;margin-bottom:10mm;">THE SMART MUSIC QUEUE</div>

        <div style="background:${BLACK};padding:10px;border:2px solid ${CYAN};box-shadow:0 0 16px ${CYAN}40;margin-bottom:6mm;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(CUSTOMER_URL)}&bgcolor=0a0a0a&color=00f0ff&format=svg" width="120" height="120" />
        </div>

        <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:10px;color:${BLACK};letter-spacing:2px;">${venueName || 'YOUR VENUE NAME'}</div>

        <div style="flex:1;"></div>

        <div style="display:flex;gap:4mm;margin-bottom:3mm;">
          ${['SCAN', 'QUEUE', 'VIBE'].map(t => `<div style="font-family:'Orbitron',sans-serif;font-weight:700;font-size:8px;color:${BLACK};letter-spacing:2px;padding:2mm 3mm;border:1.5px solid ${BLACK};">${t}</div>`).join('')}
        </div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:5.5px;color:#555;letter-spacing:2px;">QUEUEIT.LIVE</div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:${CYAN};box-shadow:0 0 12px ${CYAN};"></div>
      </div>
    </div>`;

  const insideHtml = `
    <div style="width:297mm;height:210mm;display:flex;position:relative;overflow:hidden;">
      <!-- PANEL 4: How It Works (Flow Diagram) -->
      <div style="width:${panelW};height:${panelH};background:${YELLOW};padding:8mm 5mm;display:flex;flex-direction:column;position:relative;border-right:0.5px dashed #ccc;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${BLACK};"></div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:800;font-size:11px;color:${BLACK};letter-spacing:3px;margin-bottom:2mm;">HOW IT WORKS</div>
        <div style="width:15mm;height:1.5px;background:${CYAN};margin-bottom:4mm;box-shadow:0 0 4px ${CYAN};"></div>

        <!-- Flow Diagram -->
        ${[
          { icon: '[ QR ]', label: 'GUEST SCANS QR', desc: 'Opens queueit.live/request on their phone' },
          { icon: '[ SEARCH ]', label: 'BROWSE & SEARCH', desc: 'Searches Spotify catalog for any song' },
          { icon: '[ QUEUE ]', label: 'ADDED TO QUEUE', desc: 'Song enters the venue queue in real-time' },
          { icon: '[ CLOUD ]', label: 'SERVER PROCESSES', desc: 'QueueIt backend manages the playlist' },
          { icon: '[ ADMIN ]', label: 'ADMIN CONTROLS', desc: 'Admin approves, skips, or reorders' },
          { icon: '[ PLAY ]', label: 'SPOTIFY PLAYS', desc: 'Song plays on connected Spotify device' },
        ].map((step, i) => `
          <div style="display:flex;gap:3mm;align-items:flex-start;margin-bottom:${i < 5 ? '2mm' : '0'};">
            <div style="flex-shrink:0;width:14mm;text-align:center;">
              <div style="background:${BLACK};color:${CYAN};font-family:'JetBrains Mono',monospace;font-size:6px;padding:2mm 1mm;font-weight:700;letter-spacing:0.5px;">${step.icon}</div>
              ${i < 5 ? `<div style="width:1px;height:4mm;background:${BLACK};margin:0 auto;"></div>` : ''}
            </div>
            <div style="flex:1;padding-top:1mm;">
              <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:8px;color:${BLACK};letter-spacing:1px;">${step.label}</div>
              <div style="font-family:'Rajdhani',sans-serif;font-size:6.5px;color:#444;line-height:1.4;">${step.desc}</div>
            </div>
          </div>
        `).join('')}

        <div style="flex:1;"></div>
        <div style="background:${BLACK};padding:3mm;text-align:center;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:5.5px;color:${CYAN};letter-spacing:2px;">GUEST PHONE &rarr; CLOUD &rarr; ADMIN &rarr; SPOTIFY</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${BLACK};"></div>
      </div>

      <!-- PANEL 5: Setup Guide -->
      <div style="width:${panelW};height:${panelH};background:${BLACK};padding:8mm 6mm;display:flex;flex-direction:column;position:relative;border-right:0.5px dashed #333;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${YELLOW};"></div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:800;font-size:11px;color:${YELLOW};letter-spacing:3px;margin-bottom:2mm;">SETUP GUIDE</div>
        <div style="width:15mm;height:1.5px;background:${CYAN};margin-bottom:4mm;box-shadow:0 0 4px ${CYAN};"></div>

        ${[
          { n: '01', title: 'OPEN ADMIN PANEL', desc: 'Navigate to queueit.live/admin or open the QueueIt desktop app.' },
          { n: '02', title: 'LOGIN', desc: 'Enter admin password. Default: hostel2024. Change in Settings after first login.' },
          { n: '03', title: 'CONNECT SPOTIFY', desc: 'Click "Initialize Spotify" and authorize with a Spotify Premium account.' },
          { n: '04', title: 'SELECT DEVICE', desc: 'Ensure Spotify is open on your playback device (speaker, TV, etc.).' },
          { n: '05', title: 'DISPLAY QR CODE', desc: 'Print QR stickers/posters from the starter kit. Place around your venue.' },
          { n: '06', title: 'GO LIVE', desc: 'Guests scan the QR, search songs, and requests appear in your queue instantly.' },
        ].map((step, i) => `
          <div style="display:flex;gap:3mm;margin-bottom:3mm;align-items:flex-start;">
            <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:${CYAN};text-shadow:0 0 4px ${CYAN};flex-shrink:0;width:8mm;">${step.n}</div>
            <div>
              <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:8px;color:${YELLOW};letter-spacing:1.5px;">${step.title}</div>
              <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#999;line-height:1.5;margin-top:0.5mm;">${step.desc}</div>
            </div>
          </div>
        `).join('')}

        <div style="flex:1;"></div>

        <div style="border:1px solid ${YELLOW};padding:3mm;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${YELLOW};letter-spacing:1.5px;margin-bottom:1.5mm;">&#9888; IMPORTANT</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#ccc;line-height:1.5;">
            <span style="color:${YELLOW};font-weight:700;">Spotify Premium</span> is required for playback control. Free accounts cannot be used with QueueIt.
          </div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${YELLOW};"></div>
      </div>

      <!-- PANEL 6: Admin Features -->
      <div style="width:${panelW};height:${panelH};background:${DARK};padding:8mm 6mm;display:flex;flex-direction:column;position:relative;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${CYAN};box-shadow:0 0 8px ${CYAN};"></div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:800;font-size:11px;color:${CYAN};letter-spacing:3px;margin-bottom:2mm;">ADMIN TOOLS</div>
        <div style="width:15mm;height:1.5px;background:${YELLOW};margin-bottom:4mm;"></div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${YELLOW};letter-spacing:2px;margin-bottom:2mm;font-weight:700;">PLAYBACK CONTROLS</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#bbb;line-height:1.6;margin-bottom:4mm;">
          &bull; Play / Pause / Skip songs<br>
          &bull; Remove songs from queue<br>
          &bull; Reorder with "Play Next"<br>
          &bull; Clear entire queue
        </div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${YELLOW};letter-spacing:2px;margin-bottom:2mm;font-weight:700;">VENUE SETTINGS</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#bbb;line-height:1.6;margin-bottom:4mm;">
          &bull; Custom venue name<br>
          &bull; Change admin password<br>
          &bull; Switch Spotify account<br>
          &bull; View analytics & stats
        </div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:6px;color:${YELLOW};letter-spacing:2px;margin-bottom:2mm;font-weight:700;">ACCESS OPTIONS</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:7px;color:#bbb;line-height:1.6;margin-bottom:4mm;">
          &bull; Web: queueit.live/admin<br>
          &bull; Desktop: Win (.exe) / Mac (.dmg)<br>
          &bull; Mobile: Install as PWA app<br>
          &bull; All platforms sync in real-time
        </div>

        <div style="flex:1;"></div>

        <div style="background:${YELLOW};padding:4mm;text-align:center;">
          <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;color:${BLACK};letter-spacing:3px;">QUEUE<span style="color:${CYAN};">IT</span></div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:5.5px;color:#333;letter-spacing:2px;margin-top:1mm;">LET YOUR GUESTS DJ THE EXPERIENCE</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${CYAN};box-shadow:0 0 8px ${CYAN};"></div>
      </div>
    </div>`;

  const html = outsideHtml + insideHtml;
  openPrintWindow(html, 'QueueIt Tri-Fold Brochure', 'A4', 'landscape');
};


/* ═══════════════════════════════════════════
   STARTER KIT PAGE COMPONENT
   ═══════════════════════════════════════════ */
const StarterKit = () => {
  const [venueName, setVenueName] = useState('');
  const navigate = useNavigate();

  const materials = [
    { id: 'stickers', label: 'QR STICKERS', desc: '9 per sheet, cut-to-size', icon: Sticker, action: () => printStickers(venueName) },
    { id: 'standing', label: 'STANDING CARD', desc: 'Table tent, fold & stand', icon: CreditCard, action: () => printStandingCard(venueName) },
    { id: 'poster', label: 'A4 POSTER', desc: 'Full poster with QR', icon: FileText, action: () => printPoster(venueName) },
    { id: 'brochure', label: 'TRI-FOLD BROCHURE', desc: 'Setup guide, FAQ, specs', icon: BookOpen, action: () => printBrochure(venueName) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative" data-testid="starter-kit-page">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="text-[#888] hover:text-white transition-colors" data-testid="back-to-admin">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-cyber text-lg font-bold text-white tracking-wide">
                STARTER <span className="text-[#FCE300]">KIT</span>
              </h1>
              <p className="font-mono text-[9px] text-[#555] tracking-[0.2em]">PRINT MATERIALS GENERATOR</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src="/queueit-icon.png" alt="" className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Venue Name Input */}
        <div className="mb-8">
          <label className="font-mono text-[10px] text-[#00f0ff] uppercase tracking-[0.2em] mb-2 block">Venue Name (appears on all materials)</label>
          <input
            placeholder="// e.g. BACKPACKER'S LOUNGE"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="w-full bg-black border border-[#222] text-white placeholder:text-white/20 p-4 font-mono text-sm focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] transition-all"
            data-testid="starter-kit-venue-input"
          />
        </div>

        {/* Material Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={m.action}
              className="group bg-[#111] border border-[#222] hover:border-[#00f0ff] p-6 text-left transition-all duration-300 relative overflow-hidden"
              data-testid={`print-${m.id}`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FCE300] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <m.icon className="w-6 h-6 text-[#FCE300]" />
                <Printer className="w-4 h-4 text-[#555] group-hover:text-[#00f0ff] transition-colors" />
              </div>
              <h3 className="font-cyber text-sm font-bold text-white tracking-wide mb-1">{m.label}</h3>
              <p className="font-mono text-[10px] text-[#666] tracking-wider">{m.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 8px #00f0ff' }} />
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 border border-[#222] p-5 bg-[#111]">
          <div className="font-mono text-[10px] text-[#FCE300] tracking-[0.15em] mb-3">PRINT INSTRUCTIONS</div>
          <div className="font-mono text-[10px] text-[#888] leading-relaxed space-y-1">
            <p>&bull; Click any card above to open the print-ready version in a new tab</p>
            <p>&bull; Use your browser's Print dialog (Ctrl+P / Cmd+P) to save as PDF or print directly</p>
            <p>&bull; Recommended: Glossy paper, color print, 100% scale</p>
            <p>&bull; Brochure: Print both pages (front & back), then tri-fold</p>
            <p>&bull; Stickers: Cut along the borders after printing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarterKit;
