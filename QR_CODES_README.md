# 🎵 QR Codes for Hostel Music Queue

## 📱 Generated QR Codes

All QR codes link to: **https://queue-debug-2.preview.emergentagent.com/**

### Files Created:

1. **`hostel_music_qr_simple.png`** (490x490 pixels)
   - Basic QR code only
   - Neon cyan (#00F0FF) on black background
   - Perfect for digital displays or embedding in websites

2. **`hostel_music_qr_code.png`** (490x640 pixels)
   - QR code with text
   - Includes "🎵 QUEUE YOUR VIBE" title
   - "Scan to request songs" subtitle
   - Good for social media or digital sharing

3. **`hostel_music_poster_a4.png`** (2480x3508 pixels - A4 size at 300 DPI)
   - Full A4 poster design
   - Professional print quality
   - Includes:
     - "HOSTEL BEATS" header
     - Large QR code
     - Step-by-step instructions
     - Footer message
   - **Best for: Printing and putting on walls**

4. **`hostel_music_table_tent.png`** (1200x1600 pixels)
   - Compact table tent design
   - "🎵 QUEUE SONGS" header
   - Medium-sized QR code
   - "Scan with your phone camera" footer
   - **Best for: Printing and placing on tables/bar**

---

## 🖨️ Printing Instructions

### A4 Poster (Wall Mount)

**File:** `hostel_music_poster_a4.png`

1. **Print Settings:**
   - Paper: A4 (210mm x 297mm)
   - Quality: Best/High (300 DPI)
   - Color: Full color
   - Paper type: Photo paper or glossy for best results

2. **Where to Print:**
   - Local print shop
   - Online services: Printful, Vistaprint, etc.
   - Office printer (use photo paper)

3. **Placement Ideas:**
   - Reception area wall
   - Common room notice board
   - Near the bar
   - Entrance/lobby
   - Dining area wall

### Table Tents

**File:** `hostel_music_table_tent.png`

1. **Print Settings:**
   - Paper: A5 or cut A4 in half
   - Quality: High (300 DPI)
   - Laminate for durability

2. **Assembly:**
   - Print on cardstock or thick paper
   - Fold in half to create standing tent
   - Or use acrylic table tent holders

3. **Placement:**
   - On each table in common area
   - Bar counter
   - Reception desk
   - Pool/outdoor seating areas

---

## 📲 Testing Your QR Codes

### Before Printing:

1. **Test on Your Phone:**
   - Open camera app
   - Point at QR code on your computer screen
   - Should open: https://queue-debug-2.preview.emergentagent.com/
   - Verify you can search and request songs

2. **Test Different Phones:**
   - iPhone (built-in camera)
   - Android (camera or Google Lens)
   - Ensure it works for all guests

### After Printing:

1. Scan from 1-2 meters away
2. Different lighting conditions
3. Different phone models

---

## 🎨 Design Details

**Colors Used:**
- Background: Black (#050505)
- Primary: Neon Cyan (#00F0FF)
- Text: White/Light gray

**Why These Colors?**
- Matches your app's cyberpunk/neon theme
- High contrast = easy to scan
- Looks modern and eye-catching

**QR Code Features:**
- High error correction (30%)
- Works even if partially damaged/obscured
- Optimal size for scanning from distance

---

## 💡 Pro Tips

### Maximize Scans:

1. **Strategic Placement:**
   - Eye level for easy scanning
   - Well-lit areas
   - High-traffic locations
   - Multiple copies (redundancy)

2. **Add Context:**
   - Place near speakers so guests understand connection
   - Add handwritten notes: "DJ is you! Request songs here"
   - Create excitement: "Be the DJ tonight"

3. **Social Proof:**
   - Once people start using it, others will follow
   - Announce at check-in: "You can request songs using QR codes"
   - Post on hostel's Instagram/socials

### Durability:

1. **Laminate QR codes** for tables (prevent spills/damage)
2. **Use weather-resistant paper** for outdoor areas
3. **Keep backup digital copies** for quick reprints

### Custom QR Codes:

If you want to generate new QR codes (e.g., for different events):

```python
python3 << 'EOF'
import qrcode

url = "https://queue-debug-2.preview.emergentagent.com/"
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color="#00F0FF", back_color="black")
img.save("custom_qr.png")
EOF
```

---

## 📊 Tracking Usage

**Want to know which QR codes are being scanned most?**

You can add tracking parameters to different QR codes:

- Tables: `?source=table`
- Bar: `?source=bar`
- Reception: `?source=reception`

This way you can see where most requests come from!

---

## 🎉 Ready to Deploy!

Your QR codes are ready to print and use. Here's the quick checklist:

- [ ] Print A4 posters (3-5 copies)
- [ ] Print table tents (1 per table)
- [ ] Laminate table tents
- [ ] Test scanning with your phone
- [ ] Place in strategic locations
- [ ] Announce to guests
- [ ] Monitor usage on admin dashboard

**Need help?** All QR codes link to the same customer portal, so guests can start requesting songs immediately!

---

## 🔄 Future Updates

If your URL changes in production:
1. Generate new QR codes with the new URL
2. Use the Python script above
3. Replace old QR codes

**Note:** The QR codes are static - they always point to the same URL, so as long as your URL doesn't change, these QR codes will work forever!

---

**Made with ❤️ for hostel vibes in Goa** 🏖️🎵
