# Ledger Terminal — Install as a Mobile App

This folder is a installable **PWA (Progressive Web App)**. Installed this way, it opens
full-screen with its own icon on your home screen, just like a native app — and it works offline.

## 1. Host the folder (required once)

Phones can't install a PWA from a `file://` link — it needs to be served over `http(s)://`.
Pick whichever is easiest:

**Easiest — no account needed, same Wi-Fi:**
1. On your computer, open a terminal in this folder and run:
   `python3 -m http.server 8080`
2. Find your computer's local IP (e.g. `192.168.1.14`).
3. On your phone (same Wi-Fi), open `http://192.168.1.14:8080` in Chrome (Android) or Safari (iPhone).

**Permanent — free static hosting:**
- Drag this folder onto [Netlify Drop](https://app.netlify.com/drop), or
- Push it to a GitHub repo and enable GitHub Pages.
- Either gives you a permanent `https://` link you can open from any phone, anywhere.

## 2. Install to your home screen

- **Android (Chrome):** open the link → tap the **⋮** menu → **Add to Home screen** / **Install app**.
- **iPhone (Safari):** open the link → tap the **Share** icon → **Add to Home Screen**.

It now launches full-screen, with no browser address bar, like any other app. It also caches
itself for offline use after the first load.

## 3. Data security on your device

- On first launch you'll be asked to **create a 4-digit PIN**. This is not sent anywhere —
  it never leaves your device.
- Your PIN is run through PBKDF2 (150,000 iterations) to derive an **AES-256-GCM** key, which
  encrypts all your trades, journal entries, positions and strategies before they're written
  to your phone's local storage. The file on disk is ciphertext, not readable JSON.
- Use **"🔒 Lock now"** in the sidebar to lock instantly (e.g. before handing your phone to
  someone). The app also **auto-locks** if it's been in the background for more than 2 minutes.
- **"Reset saved data"** wipes your encrypted trades but keeps your PIN.
- **"Reset app"** (on the lock screen) wipes everything, including the PIN, for a clean start.
- If you forget your PIN, the data **cannot be recovered** — that's the nature of real
  encryption. There is no backdoor or "forgot PIN" flow by design.

## 4. What "offline" and "local-only" mean here

- All your data lives only in this browser's local storage on this one device. It does **not**
  sync across devices and is **not** backed up anywhere automatically.
- Use **Reports → Export (Excel/CSV)** regularly to back up your trades to a file you control
  (save it to cloud storage, email it to yourself, etc.).
- If you clear your phone browser's site data/storage, or uninstall, the encrypted data is
  gone — export first.

## Files in this folder
- `index.html` — the app itself (self-contained, charts + spreadsheet library bundled in)
- `manifest.json` — tells the phone how to install it as an app
- `service-worker.js` — caches the app for offline use
- `icon-192.png`, `icon-512.png` — home screen icons
