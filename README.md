# 🍛 Vanta Sarukulu (వంగా సత్యనారాయణ, వంటమేస్త్రి)
**Enterprise Catering Order & Inventory Management PWA**

Vanta Sarukulu is a highly optimized Progressive Web App (PWA) built specifically for managing catering orders, menus, and grocery inventories. It seamlessly bridges a robust Google Apps Script backend (using Google Sheets as a database) with a lightning-fast, offline-capable vanilla HTML/JS frontend.

---

## ✨ Key Features

### 🔐 Security & Access Control
* **Role-Based Login:** Supports `Admin`, `User`, and `Guest` roles. 
  * *Guests* can only submit menu requests (Pending status).
  * *Users* can create and manage orders.
  * *Admins* have full access to the Master Inventory and Order History.
* **Client-Side Hashing:** Passwords are encrypted using the Web Crypto API (SHA-256) before leaving the device.
* **Audit Logging:** All edits to the master inventory or past orders are silently tracked in a secure Google Sheet.
* **Concurrency Protection:** Uses Google's `LockService` to prevent data collision if multiple users submit orders simultaneously.

### 📝 Order Management & PDF Generation
* **Dual-Mode Entry:** Seamlessly toggle between **Menu Selection** (picking dishes) and **Grocery List** (raw ingredients with quantities).
* **Automated PDF Generation:** Instantly generates structured HTML-to-PDF lists for clients.
  * Generates a **Master PDF** combining selected menus and all ingredients.
  * Generates **Category-Specific PDFs** (Groceries, Vegetables, Non-Veg, Tent Items).
* **Smart Auto-Routing:** Saves generated PDFs dynamically into automatically created `Year ➔ Month` Google Drive folders.

### 💻 UI / UX & PWA Capabilities
* **Offline Resilience:** Includes a Service Worker (`sw.js`) that caches assets and provides a beautiful fallback screen when there is no internet connection.
* **Bilingual Support:** 1-click toggle between English and Telugu (తెలుగు) across the entire app.
* **Dynamic Geolocation:** Integrates `Leaflet.js` maps to drop pins and save venue locations as Google Maps links.
* **Dark/Light Mode:** Full theme support with automatic UI adjustments.
* **App Shortcuts:** Long-press the installed PWA icon to jump directly to "New Order" or "Order History".

### 📊 Admin & Business Tools
* **Master Inventory Panel:** Add, edit, or categorize thousands of menu dishes and grocery items directly from the app.
* **Notification System:** Facebook-style notification bell alerts Admins to pending Guest orders.
* **CSV Export:** 1-click export of filtered order history into a `.csv` file for accounting.
* **Automated Backups:** Time-driven trigger automatically duplicates the entire database to a secure folder every week.

---

## 🛠 Tech Stack

* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+).
* **Backend:** Google Apps Script (`Code.gs`).
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
5. **`Audit_Log`** (Security)
   * Columns: `Timestamp` | `User` | `Action` | `Details`

---

## 🚀 Deployment Instructions

### 1. Google Apps Script Setup
1. Create a new Google Spreadsheet and set up the tabs listed above.
2. Go to `Extensions > Apps Script`.
3. Paste the contents of `Code.gs` into the backend file.
4. Create a new HTML file named `Index.html` in the Apps Script editor and paste the frontend code.
5. Click **Deploy > New Deployment**.
6. Select **Web App**.
7. Set "Execute as" to **Me** and "Who has access" to **Anyone**.
8. Copy the resulting **Web App URL**.

### 2. GitHub PWA Setup
1. Open the `index.html` wrapper file in your GitHub repository.
2. Locate the `baseAppsScriptUrl` variable inside the `<script>` tag.
3. Replace the placeholder URL with your newly generated Google Web App URL.
4. Ensure `manifest.json` and `sw.js` are in the root directory.
5. Host the repository using **GitHub Pages** (or any static hosting).

---

## 📱 Installing the PWA
1. Open the GitHub Pages URL on a mobile device (Chrome for Android, Safari for iOS).
2. Tap the browser menu and select **"Add to Home Screen"**.
3. The app will install as a native-feeling application with full fullscreen support and offline launch capabilities.

---
*Designed & Built for Vanga Satyanarayana, Vantamesthri.*
