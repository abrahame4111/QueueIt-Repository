# 📱 Android APK - Build Instructions

## Overview

This folder contains instructions to create an Android APK for the Hostel Music Queue Admin portal.

**Note**: I cannot directly build an APK in this environment, but I'll provide you with the complete project structure and instructions.

---

## Option 1: Use Android Studio (Recommended)

### Prerequisites
- Install Android Studio: https://developer.android.com/studio
- Install Android SDK
- Enable Developer Mode on your Android device

### Step-by-Step Instructions

#### 1. Download PWA Builder (Easiest Method)

**PWA Builder** can convert your web app to APK automatically:

1. Go to: https://www.pwabuilder.com/
2. Enter your URL: `https://queue-debug-2.preview.emergentagent.com/admin`
3. Click "Start"
4. Click "Package for stores"
5. Select "Android"
6. Click "Generate"
7. Download the APK file
8. ✅ Done! Install on Android device

**This is the FASTEST way** and requires no coding!

---

## Option 2: Trusted Web Activity (TWA)

Google's official method to create Android apps from websites.

### Using Bubblewrap (Command Line)

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize project
bubblewrap init --manifest https://queue-debug-2.preview.emergentagent.com/manifest.json

# Build APK
bubblewrap build

# Output: app-release-signed.apk
```

---

## Option 3: Manual Android Studio Project

I'll create the project structure for you:

### Project Structure
```
android-app/
├── AndroidManifest.xml
├── MainActivity.java
├── activity_main.xml
├── strings.xml
├── build.gradle
└── README.md (this file)
```

### Step 1: Create New Android Studio Project

1. Open Android Studio
2. File → New → New Project
3. Select "Empty Activity"
4. Set:
   - Name: `Hostel Music Queue Admin`
   - Package: `com.hostel.musicqueue.admin`
   - Language: Java
   - Minimum SDK: API 24 (Android 7.0)
5. Click "Finish"

### Step 2: Add Internet Permission

Edit `AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hostel.musicqueue.admin">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

### Step 3: Create MainActivity.java

```java
package com.hostel.musicqueue.admin;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.KeyEvent;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String ADMIN_URL = "https://queue-debug-2.preview.emergentagent.com/admin";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        
        // Configure WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setSupportZoom(false);
        
        // Enable localStorage
        webSettings.setDomStorageEnabled(true);
        
        // Keep WebView inside app
        webView.setWebViewClient(new WebViewClient());
        
        // Load admin portal
        webView.loadUrl(ADMIN_URL);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Handle back button
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
```

### Step 4: Create activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</RelativeLayout>
```

### Step 5: Build APK

1. Build → Generate Signed Bundle / APK
2. Select "APK"
3. Create new keystore (or use existing)
4. Set password and alias
5. Click "Next" → "Finish"
6. Find APK in: `app/release/app-release.apk`

---

## Option 4: Use Capacitor (Web to Mobile)

Capacitor converts web apps to native apps.

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize
npx cap init "Hostel Music Queue Admin" com.hostel.musicqueue.admin

# Add Android platform
npx cap add android

# Open in Android Studio
npx cap open android

# Build in Android Studio
```

---

## Quick & Easy Solutions

### 1. ApkOnline (Online APK Builder)
- Go to: https://www.apkonline.net/
- Upload your web URL
- Generate APK online
- Download and install

### 2. Hermit (Lite Apps)
User installs Hermit from Play Store, then:
- Open Hermit
- Add "Lite App"
- Enter URL: `https://queue-debug-2.preview.emergentagent.com/admin`
- Creates home screen icon
- Works like native app

### 3. Progressive Web App (PWA)
Your admin portal can be "installed" directly:
1. Open admin URL in Chrome on Android
2. Menu → "Add to Home screen"
3. Creates app icon
4. Opens in standalone mode
5. ✅ No APK needed!

---

## Installing APK on Device

### Enable Unknown Sources

**Android 8+:**
1. Settings → Apps & notifications
2. Advanced → Special app access
3. Install unknown apps
4. Select browser/file manager
5. Allow from this source

**Android 7 and below:**
1. Settings → Security
2. Enable "Unknown sources"

### Install APK

1. Transfer APK to phone (USB/email/cloud)
2. Open APK file
3. Click "Install"
4. Click "Open" when done

---

## Recommended Approach

**For Fastest Results**: Use **PWA Builder** (Option 1)
- No coding required
- Generates signed APK
- Takes 5 minutes
- Professional output

**For Custom Build**: Use **Android Studio** (Option 3)
- Full control
- Custom branding
- Can add features
- Takes 30-60 minutes

---

## File Sizes

- Basic WebView APK: ~5-10 MB
- With custom features: ~10-20 MB
- PWA Builder output: ~3-8 MB

Much smaller than Electron desktop apps!

---

## Testing

1. Build APK
2. Install on Android phone/tablet
3. Open app
4. Login with password: `hostel2024`
5. Connect Spotify
6. Test queue management

---

## Distribution

### Google Play Store (Optional)

1. Create Play Console account ($25 one-time fee)
2. Upload APK
3. Fill app details
4. Submit for review
5. Published in 1-7 days

### Direct Distribution (Easier)

1. Build APK
2. Upload to Google Drive/Dropbox
3. Share link with hostel
4. They download and install
5. No Play Store needed!

---

## Support

If you need help building:
1. Try PWA Builder first (easiest)
2. If that doesn't work, use Android Studio
3. Test on real device before distributing

---

**Made with Emergent** 🚀
