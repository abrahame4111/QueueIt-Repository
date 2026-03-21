// OS Detection and Smart Download Button
(function() {
    'use strict';

    // Detect user's operating system
    function detectOS() {
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
        const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

        let os = 'Unknown';

        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'Mac';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
        } else if (/Linux/.test(platform)) {
            os = 'Linux';
        }

        return os;
    }

    // Update download button based on OS
    function updateDownloadButton() {
        const os = detectOS();
        const downloadBtn = document.getElementById('download-btn');
        const downloadText = document.getElementById('download-text');
        const platformInfo = document.getElementById('platform-info');

        // Download URLs (update these with actual download links)
        const downloadLinks = {
            'Mac': {
                url: 'https://queue-it-preview.preview.emergentagent.com/downloads/QueueIt-Mac.dmg',
                text: 'Download for Mac',
                info: 'macOS 10.13+ • Intel & Apple Silicon'
            },
            'Windows': {
                url: 'https://queue-it-preview.preview.emergentagent.com/downloads/QueueIt-Windows.exe',
                text: 'Download for Windows',
                info: 'Windows 10/11 • 64-bit'
            },
            'Linux': {
                url: 'https://queue-it-preview.preview.emergentagent.com/downloads/QueueIt-Linux.AppImage',
                text: 'Download for Linux',
                info: 'Ubuntu 18.04+ • AppImage'
            },
            'Unknown': {
                url: '#download',
                text: 'Download QueueIt',
                info: 'Available for macOS, Windows, and Linux'
            }
        };

        const downloadInfo = downloadLinks[os] || downloadLinks['Unknown'];
        
        if (downloadText) {
            downloadText.textContent = downloadInfo.text;
        }
        
        if (platformInfo) {
            platformInfo.textContent = downloadInfo.info;
        }

        // Set download link
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                handleDownload(os, downloadInfo.url);
            });
        }

        // Highlight appropriate download option
        highlightDownloadOption(os);
    }

    // Handle download click
    function handleDownload(os, url) {
        // Analytics event (if you have analytics)
        console.log(`Download initiated for ${os}`);

        // For now, show a message since we don't have actual build files yet
        showDownloadModal(os);

        // When you have real download links, uncomment this:
        // window.location.href = url;
    }

    // Show download modal/instructions
    function showDownloadModal(os) {
        let message = '';
        let instructions = '';

        if (os === 'Mac') {
            message = 'Download QueueIt for Mac';
            instructions = `
                <h3>Installation Instructions</h3>
                <ol>
                    <li>Download will start automatically</li>
                    <li>Open the .dmg file</li>
                    <li>Drag QueueIt to Applications folder</li>
                    <li>Open QueueIt from Applications</li>
                    <li>Allow app if macOS blocks it (System Preferences → Security)</li>
                </ol>
                <p><strong>Or try the instant PWA version:</strong></p>
                <ol>
                    <li>Open <a href="https://queue-it-preview.preview.emergentagent.com/admin" target="_blank">queueit.preview.emergentagent.com/admin</a> in Chrome</li>
                    <li>Click the install icon (⊕) in address bar</li>
                    <li>Click "Install" - Done!</li>
                </ol>
            `;
        } else if (os === 'Windows') {
            message = 'Download QueueIt for Windows';
            instructions = `
                <h3>Installation Instructions</h3>
                <ol>
                    <li>Download will start automatically</li>
                    <li>Run the .exe installer</li>
                    <li>Follow the setup wizard</li>
                    <li>Launch QueueIt from Start Menu</li>
                    <li>If Windows Defender blocks it, click "More info" → "Run anyway"</li>
                </ol>
                <p><strong>Or try the instant PWA version:</strong></p>
                <ol>
                    <li>Open <a href="https://queue-it-preview.preview.emergentagent.com/admin" target="_blank">queueit.preview.emergentagent.com/admin</a> in Chrome/Edge</li>
                    <li>Click the install icon (⊕) in address bar</li>
                    <li>Click "Install" - Done!</li>
                </ol>
            `;
        } else {
            message = 'Download QueueIt';
            instructions = `
                <h3>Choose Your Platform</h3>
                <p>Select the appropriate version for your operating system:</p>
                <ul>
                    <li><strong>macOS:</strong> Download .dmg installer</li>
                    <li><strong>Windows:</strong> Download .exe installer</li>
                    <li><strong>Linux:</strong> Download .AppImage</li>
                </ul>
                <p><strong>Or use the instant PWA version (recommended):</strong></p>
                <ol>
                    <li>Open <a href="https://queue-it-preview.preview.emergentagent.com/admin" target="_blank">queueit.preview.emergentagent.com/admin</a></li>
                    <li>Click install icon in browser</li>
                    <li>Works on any device!</li>
                </ol>
            `;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'download-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2>${message}</h2>
                <div class="modal-body">
                    ${instructions}
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="window.open('https://queue-it-preview.preview.emergentagent.com/admin', '_blank')">
                        Try PWA Version (Instant)
                    </button>
                    <button class="btn-outline modal-close-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .download-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .modal-content {
                position: relative;
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 40px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }

            .modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: white;
                font-size: 32px;
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.3s;
            }

            .modal-close:hover {
                opacity: 1;
            }

            .modal-content h2 {
                margin-bottom: 24px;
                color: #00f0ff;
            }

            .modal-content h3 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-size: 18px;
            }

            .modal-body {
                color: #aaa;
                line-height: 1.8;
            }

            .modal-body ol, .modal-body ul {
                margin-left: 24px;
                margin-top: 12px;
                margin-bottom: 24px;
            }

            .modal-body li {
                margin-bottom: 8px;
            }

            .modal-body a {
                color: #00f0ff;
                text-decoration: none;
            }

            .modal-body a:hover {
                text-decoration: underline;
            }

            .modal-actions {
                display: flex;
                gap: 16px;
                margin-top: 32px;
            }

            .modal-actions button {
                flex: 1;
            }
        `;
        document.head.appendChild(style);

        // Close modal handlers
        const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn, .modal-overlay');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
    }

    // Highlight download option
    function highlightDownloadOption(os) {
        const macBtn = document.querySelector('.mac-download');
        const winBtn = document.querySelector('.windows-download');

        if (os === 'Mac' && macBtn) {
            macBtn.style.borderColor = '#00f0ff';
            macBtn.style.background = 'rgba(0, 240, 255, 0.1)';
        } else if (os === 'Windows' && winBtn) {
            winBtn.style.borderColor = '#00f0ff';
            winBtn.style.background = 'rgba(0, 240, 255, 0.1)';
        }
    }

    // Add click handlers for download options
    function addDownloadHandlers() {
        const macBtn = document.querySelector('.mac-download');
        const winBtn = document.querySelector('.windows-download');

        if (macBtn) {
            macBtn.addEventListener('click', () => handleDownload('Mac', ''));
        }

        if (winBtn) {
            winBtn.addEventListener('click', () => handleDownload('Windows', ''));
        }
    }

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#demo') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        updateDownloadButton();
        addDownloadHandlers();
        initSmoothScroll();

        console.log('QueueIt Download Website Loaded');
        console.log('Detected OS:', detectOS());
    });

})();
