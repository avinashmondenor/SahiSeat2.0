# SahiSeat — JoSAA & CSAB College Predictor

> **Find your perfect college seat instantly.** Enter your JEE rank, category, home state and preferred branches — SahiSeat gives you eligible NITs, IIITs and GFTIs ranked by closing-rank data from real JoSAA & CSAB rounds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Instant Prediction** | Results in under a second from real JoSAA/CSAB closing-rank CSV data |
| 🏠 **Home State Advantage** | Highlights HS-quota seats at NITs in your home state — deduplicated to show only the best round per branch |
| 🏆 **Smart Buckets** | Results split into Best Matches, Good Options, and Explore More |
| 📱 **Mobile-First UI** | Fully responsive from 360 px to desktop, dark-themed, no horizontal scroll |
| 🔍 **Branch Filter** | Filter by CSE, AI, ECE, EE, Mechanical, Civil, Chemical, Biotechnology, IT |
| ♿ **Accessible** | Semantic HTML, keyboard-navigable forms, ARIA labels throughout |
| 🔒 **No Login Required** | Completely free, no account, no data stored |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# Clone the repo
git clone https://github.com/chvijayendra/SahiSeat.git
cd SahiSeat

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm start
```

---

## 🗂️ Project Structure

```
sahiseat/
├── app/
│   ├── api/
│   │   └── predict/
│   │       └── route.js        # Core prediction API (POST /api/predict)
│   ├── admin/                  # Admin diagnostics (hidden from public)
│   ├── lib/
│   │   ├── csvData.js          # CSV loading & institute classification
│   │   └── formatters.js       # Institute name abbreviation helpers
│   ├── layout.js               # Root layout + SEO metadata
│   ├── page.js                 # Main UI (predictor form + results)
│   ├── robots.js               # Auto-generates /robots.txt
│   └── sitemap.js              # Auto-generates /sitemap.xml
├── data/                       # JoSAA & CSAB CSV files (multiple rounds)
├── public/                     # Static assets (favicon, OG image)
└── README.md
```

---

## 🧠 How Prediction Works

1. **Input** — User provides: JEE rank, seat type (category), gender, home state, preferred branches.
2. **Filtering** — Every record in the CSV data is checked:
   - Seat type must match.
   - Gender must match.
   - User rank must be ≤ closing rank (new-logic predictor).
   - For NIT Home State quota seats, user's home state must match the NIT's state.
3. **Sorting** — Eligible records are sorted by `rankGap` (closing rank − user rank) ascending, with preferred-branch matches floated to the top.
4. **Home State Advantage** — HS-quota NIT entries are deduplicated per Institute × Branch (earliest round wins) then sorted by rankGap.
5. **Buckets** — Results split: Best Matches (top 10), Good Options (11–30), Explore More (31–50).

---

## 📊 Data Sources

All cutoff data is sourced from official JoSAA and CSAB published results (Rounds 1–6, multiple academic years). CSV files are stored in `/data` and loaded at runtime via `app/lib/csvData.js`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS v3
- **Data**: Raw CSV files (no external database)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---
## 📜 Copyright

© 2026 SahiSeat. All rights reserved.

The source code, branding, design, and content of this project may not be copied, redistributed, modified, or used for commercial purposes without explicit permission from the author.

---

## 🌐 Live Website

🔗 https://sahiseat.vercel.app

---

## 🚀 Built By

Vijayendra Ch

B.Tech AI, IIIT Vadodara

Building tools that help students make better academic and career decisions through data-driven insights.at.vercel.app)**

---

*Built with ❤️ to help JEE aspirants navigate India's college admission process.*
