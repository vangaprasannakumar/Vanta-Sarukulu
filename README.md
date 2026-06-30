# 🍛 Vanta Sarukulu (వంగా సత్యనారాయణ, వంటమేస్త్రి)
**Enterprise Catering Order & Inventory Management PWA**

Vanta Sarukulu is a Progressive Web App (PWA) built for managing catering orders, menus, and grocery inventories. It pairs a Google Apps Script backend (using Google Sheets as a database) with a single-file, offline-capable vanilla HTML/JS frontend.

---

## 🏗 Architecture

The app is a single static frontend file talking to a Google Apps Script web app over `fetch()`. There is no iframe, no second copy of the UI living inside Apps Script, and no `google.script.run` dependency — the frontend includes a small shim (`gasRun`) that replicates that API's chainable shape but sends real HTTP requests, so it works hosted anywhere.

```
GitHub Pages (or any static host)
  index.html  — the entire app (login, orders, history, admin panel, PWA shell)
  manifest.json
  sw.js
        │
        │  fetch() — GET for reads, application/x-www-form-urlencoded POST for writes
        │  (deliberately avoids JSON POST bodies so no CORS preflight is triggered —
        │   Apps Script needs zero extra CORS configuration)
        ▼
Google Apps Script Web App
  Code.gs  — pure JSON API only (doGet / doPost action dispatcher)
        │
        ▼
Google Sheets (database)  +  Google Drive (PDFs, weekly backups)
```

Earlier versions of this app split the frontend in two: a GitHub-hosted "shell" that loaded the real UI inside an iframe from Apps Script, plus a second copy of that UI hosted inside Apps Script itself as `Index.html`. That's been consolidated — there's exactly one frontend file now, and Apps Script's only job is serving `Code.gs` as an API.

---

## ✨ Key Features

### 🔐 Security & Access Control
* **Role-Based Login:** Supports `Admin`, `User`, and `Guest` roles.
  * *Guests* can only submit menu requests (Pending status).
  * *Users* can create and manage orders.
  * *Admins* have full access to the Master Inventory and Order History.
* **Salted Server-Side Hashing:** Passwords are hashed with SHA-256 plus a per-deployment salt inside `Code.gs` — the salt is generated once and stored in Script Properties, never in source. Any account still on an older plain-text or unsalted-hash credential is transparently upgraded to the salted format the moment that user next logs in successfully — no manual migration step or forced password reset required.
* **Concurrency Protection:** Uses Google's `LockService` to prevent data collision when multiple users edit inventory or submit orders simultaneously.

### 📝 Order Management & PDF Generation
* **Dual-Mode Entry:** Toggle between **Menu Selection** (picking dishes) and **Grocery List** (raw ingredients with quantities).
* **Automated PDF Generation:** Generates structured HTML-to-PDF lists for clients.
  * A **Master PDF** combining selected menus and all ingredients.
  * **Category-Specific PDFs** (Groceries, Vegetables, Non-Veg, Tent Items, Other Items). Items with an unrecognized category are filed under Other Items instead of silently being dropped from the PDF.
* **Smart Auto-Routing:** Saves generated PDFs into automatically created `Year ➔ Month` Google Drive folders, shared as "Anyone with the link can view" so the links actually open for staff and clients, not just the script owner's account.
* **Collision-Resistant Order IDs:** Order IDs combine a timestamp with a random suffix, so two near-simultaneous submissions can never collide.

### 💻 UI / UX & PWA Capabilities
* **Real Offline Caching:** The service worker now caches the actual app (not just a loading shell), with versioned cache cleanup on update, immediate activation (`skipWaiting`/`clients.claim`) instead of waiting for every tab to close, and a resilient install that won't fail outright if one remote asset is briefly unreachable.
* **Bilingual Support:** 1-click toggle between English and Telugu (తెలుగు) across the entire app.
* **Dynamic Geolocation:** Integrates `Leaflet.js` maps to drop pins and save venue locations as Google Maps links.
* **Dark/Light Mode:** Full theme support with automatic UI adjustments.
* **Working App Shortcuts:** Long-press the installed PWA icon to jump directly to "New Order" or "Order History" — this now actually routes to the right screen after login, reading the shortcut's `?view=` parameter.
* **Accessible Zoom:** Pinch-to-zoom is no longer disabled, so the app stays usable for anyone who needs to zoom in.

### 📊 Admin & Business Tools
* **Master Inventory Panel:** Add, edit, or categorize menu dishes and grocery items directly from the app. Edits are matched by item code (a stable identifier) rather than by name, so renaming an item during an edit updates the existing row instead of creating a duplicate.
* **Notification System:** Notification bell alerts Admins to pending Guest orders.
* **Self-Installing Backups:** Run `installTriggers()` once from the Apps Script editor and it programmatically sets up both the weekly database backup and the monthly image-cache refresh — no manual configuration in the Triggers panel needed.

### 📋 Documented but not yet implemented
A few items in earlier docs described features that don't currently exist in the code — listed here so the docs stay honest rather than quietly dropping them:
* **CSV Export** of order history — no export code currently exists in the frontend.
* **Audit Logging** — the `Audit_Log` sheet is defined in the database schema below, but no function in `Code.gs` currently writes to it. Worth picking up as a follow-on task if it's still wanted.

---

## 🛠 Tech Stack

* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+) — a single file, no build step, no framework.
* **Backend:** Google Apps Script (`Code.gs`) — pure JSON API, no server-rendered HTML.
* **Database:** Google Sheets.
* **Storage:** Google Drive (PDFs and Backups).
* **Mapping:** Leaflet.js + OpenStreetMap.

---

## 📂 Google Sheets Database Structure

To run this application, a Google Spreadsheet must be created with the following exact sheet names:

1. **`List`** (Master Grocery Inventory)
   * Columns: `Code` | `English Name` | `Telugu Name` | `Category (En)` | `Category (Te)` | `Unit (En)` | `Unit (Te)`
2. **`Menu_list`** (Master Menu Dishes)
   * Columns: `Code` | `English Name` | `Telugu Name` | `Category (En)` | `Category (Te)`
3. **`Users`** (Authentication)
   * Columns: `Name` | `Email` | `Password Hash` | `Role` *(admin, user, guest)*
4. **`Report`** (Order History)
   * 19 columns tracking Customer Info, Map Links, PDF URLs, Raw JSON Data, and Status.
5. **`Audit_Log`** (Security) — *schema reserved, not yet written to by `Code.gs`*
   * Columns: `Timestamp` | `User` | `Action` | `Details`

---

## 🚀 Deployment Instructions

### 1. Google Apps Script Setup (backend only)
1. Create a new Google Spreadsheet and set up the tabs listed above.
2. Go to `Extensions > Apps Script`.
3. Paste the contents of `Code.gs` into the backend file. No HTML file is needed in Apps Script anymore — the entire frontend lives on GitHub.
4. Click **Deploy > New Deployment**.
5. Select **Web App**.
6. Set "Execute as" to **Me** and "Who has access" to **Anyone**.
7. Copy the resulting **Web App URL** (ends in `/exec`).
8. In the Apps Script editor, select `installTriggers` from the function dropdown and click **Run** once. This configures the weekly backup and the monthly image-cache refresh automatically.

### 2. GitHub PWA Setup (this is now the entire frontend)
1. Open `index.html`.
2. Near the top of the main `<script>` block, find the `gasRun` shim and locate the `GAS_EXEC_URL` constant.
3. Replace it with the Web App URL you copied in the previous step.
4. Make sure `manifest.json` and `sw.js` sit alongside `index.html` in the same directory.
5. Push to GitHub and enable **GitHub Pages** (or any static host).

When redeploying `Code.gs` after future edits, create a **new version** of the same deployment (rather than a brand-new deployment) so the `/exec` URL stays stable and `index.html` doesn't need updating.

---

## 📱 Installing the PWA
1. Open the GitHub Pages URL on a mobile device (Chrome for Android, Safari for iOS).
2. Tap the browser menu and select **"Add to Home Screen"**.
3. The app installs as a native-feeling application with full fullscreen support and offline launch capability.

---
*Designed & Built for Vanga Satyanarayana, Vantamesthri.*
