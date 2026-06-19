# 🚪 Dreamy Doorsteps

A cozy little life-sim game for the browser. Pick a character, play minigames to earn ✨ Dreamies, and unlock buildings around your town to decorate your home.

This is a **pure static web app** — no build step, no server, no framework. It runs anywhere a browser does and saves your progress to your phone or computer with `localStorage`.

## ✨ Features (v1.0)

- 5 pastel anime characters to play as
- 3 starter cottages (Rose, Mint, Lavender)
- 12-building town map with unlock costs
- 3 working minigames: **Bubble Pop**, **Snake Garden**, **Sweet Stack**
- 6 shops (Furniture, Boutique, Pet Shop, Bakery, Garden Center, Café)
- Categorised inventory (furniture, outfits, pets, food, plants)
- Home decoration with wallpaper and floor picker
- Closet to switch outfits
- Library quiz (maths / spelling / general knowledge) — earn while you learn
- Daily login bonus + 3 rotating daily quests
- Parental play timer (15 / 30 / 60 min or unlimited)
- 100% local save, **no accounts, no ads, no real money**

## 🏃 Run it locally

You only need a static file server. Pick whichever is easiest.

### Option A — Python (already installed on most computers)

```bash
cd dreamy-doorsteps
python3 -m http.server 8000
```

Then open <http://localhost:8000> on your computer, **or** on your phone go to `http://<your-computer-ip>:8000` while connected to the same Wi-Fi.

### Option B — Node

```bash
cd dreamy-doorsteps
npx serve .
```

### Option C — Just open it

Double-click `index.html`. It mostly works this way too, though some browsers are stricter about local files.

## 🚀 Deploy to Vercel

This is the easiest way to play it on your mum's phone.

### One-time setup

1. Create a new GitHub repo, e.g. `dreamy-doorsteps`
2. Drop all these files into it and push:
   ```bash
   git init
   git add .
   git commit -m "Initial Dreamy Doorsteps build"
   git branch -M main
   git remote add origin https://github.com/<your-username>/dreamy-doorsteps.git
   git push -u origin main
   ```
3. Go to <https://vercel.com/new>, pick that repo, and click **Deploy**. No settings to change — Vercel detects the static site automatically.
4. Vercel gives you a URL like `dreamy-doorsteps.vercel.app`. Open it on any phone, save it to the home screen, and you're done.

### Every time you change something

Push to GitHub. Vercel auto-deploys within ~20 seconds.

## 📁 File layout

```
dreamy-doorsteps/
├── index.html              ← entry point + all screens
├── style.css               ← pastel design system
├── data.js                 ← all shop items, buildings, quizzes (edit here to add content)
├── games.js                ← the 3 canvas minigames
├── app.js                  ← state, navigation, save/load
├── vercel.json             ← hosting config
├── assets/
│   └── characters/         ← 5 character portraits
└── README.md
```

## ✏️ Adding new content (no coding needed)

### New shop items

Open `data.js`. Find the shop in `SHOP_ITEMS`, add a new line:

```js
{ id: 'unique_id', name: 'Display Name', emoji: '🎀', cost: 50, category: 'furniture' }
```

Categories: `furniture`, `outfits`, `pet`, `food`, `plant`.

### New quiz questions

In `data.js`, add to `QUIZ_QUESTIONS`:

```js
{ subject: 'Maths', q: 'What is 5 + 5?', options: ['8', '9', '10', '11'], answer: 2 }
```

`answer` is the **index** of the right option (0, 1, 2 or 3).

### New buildings

In `data.js`, add to `BUILDINGS`:

```js
{ id: 'museum', name: 'Museum', emoji: '🏛️', cost: 12000, screen: 'screen-shop', shop: 'museum', desc: 'Quiet halls.' }
```

Then create a matching `museum: [...]` entry in `SHOP_ITEMS` with the items it sells.

## 🛡️ Privacy & safety

- No personal info is collected. The save file lives only on your device.
- No external requests except for Google Fonts (Quicksand and Fredoka). Remove the `<link>` tags in `index.html` if you'd rather host fonts yourself.
- No third-party ads, no analytics, no chat with strangers, no real-money purchases.

## 🛠️ Tech notes

- Plain HTML/CSS/JS — no React, no build pipeline.
- Saves to `localStorage` under the key `dreamyDoorsteps_save_v1`.
- Minigames use the `<canvas>` API and a single requestAnimationFrame loop.
- Designed mobile-first; viewport meta tag locks zoom for a more app-like feel.
- Works offline once loaded (the page itself doesn't need the network).

## 🌱 Future ideas (not in v1.0)

- Cloud save with Supabase (so progress moves between phones)
- Friend visits (read-only "windows" into another player's home)
- More minigames: Match-3 Bakery, Dreamy Dash endless runner
- Seasonal events (Spring Bloom, Winter Lights)
- Achievement journal

---

Made with care for cozy adventures. ✨
